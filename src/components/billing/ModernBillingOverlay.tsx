import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { X, Save, FileText, User, Calendar, DollarSign, CreditCard, Plus, Trash2, AlertCircle, Check, Download } from 'lucide-react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Card removed — using tinted section headers pattern
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from '@/hooks/use-toast';
import { BillingRecord } from '@/services/billingService';
import * as billingService from '@/services/billingService';
import RecordPaymentDialog from '@/components/shared/RecordPaymentDialog';
import { PaymentRecord } from '@/types/shared';
import * as medicationService from '@/services/medicationService';
import * as diagnosticService from '@/services/diagnosticService';
import * as roomService from '@/services/roomService';

interface BillingService {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ModernBillingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  billing?: BillingRecord | null;
  isEditMode?: boolean;
  onSave?: (billing: BillingRecord) => void;
  onRefresh?: () => void;
}

const statusColors: Record<string, string> = {
  Paid: 'bg-green-100 text-green-800 border-green-200',
  Partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Pending: 'bg-red-100 text-red-800 border-red-200',
  Overdue: 'bg-red-100 text-red-800 border-red-200'
};

const commonServices = [
  'Consultation', 'X-Ray', 'CT Scan', 'MRI', 'Blood Test', 'ECG',
  'Ultrasound', 'Surgery', 'Emergency Care', 'Physical Therapy',
  'Medication', 'Lab Test', 'Room Charges', 'ICU Charges'
];

export const ModernBillingOverlay = ({
  isOpen,
  onClose,
  billing,
  isEditMode = false,
  onSave,
  onRefresh,
}: ModernBillingOverlayProps) => {
  const { displayName: billingDisplayName, username: billingUsername } = useCurrentUser();
  const actor = billing?.actor || billingUsername || billingDisplayName || '';
  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    invoiceNumber: '',
    patientName: '',
    patientId: '',
    department: '',
    doctor: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: 0,
    paidAmount: 0,
    status: 'Pending',
    services: []
  });

  const [billingServices, setBillingServices] = useState<BillingService[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (billing && isEditMode) {
      setFormData(billing);
      setInvoiceDate(billing.date ? new Date(billing.date) : undefined);
      setDueDate(billing.dueDate ? new Date(billing.dueDate) : undefined);
      if (billing.services && billing.services.length > 0) {
        const services = billing.services.map((service, index) => ({
          id: `service-${index}`,
          name: service,
          quantity: 1,
          unitPrice: billing.amount / billing.services.length,
          total: billing.amount / billing.services.length
        }));
        setBillingServices(services);
      }
    } else if (!isEditMode) {
      const newInvoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
      setFormData({
        invoiceNumber: newInvoiceNumber,
        patientName: '',
        patientId: '',
        department: '',
        doctor: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: 0,
        paidAmount: 0,
        status: 'Pending',
        services: []
      });
      setInvoiceDate(new Date());
      setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      setBillingServices([]);
    }
  }, [billing, isEditMode, isOpen]);

  useEffect(() => {
    const totalAmount = billingServices.reduce((sum, s) => sum + s.total, 0);
    setFormData(prev => ({ ...prev, amount: totalAmount }));
  }, [billingServices]);

  useEffect(() => {
    if (formData.amount && formData.paidAmount !== undefined) {
      let newStatus = 'Pending';
      if (formData.paidAmount >= formData.amount) newStatus = 'Paid';
      else if (formData.paidAmount > 0) newStatus = 'Partial';
      setFormData(prev => ({ ...prev, status: newStatus }));
    }
  }, [formData.paidAmount, formData.amount]);

  const handleInputChange = (field: keyof BillingRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const addService = () => {
    setBillingServices([...billingServices, { id: `service-${Date.now()}`, name: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeService = (id: string) => setBillingServices(billingServices.filter(s => s.id !== id));

  const updateService = (id: string, field: keyof BillingService, value: any) => {
    setBillingServices(billingServices.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') updated.total = updated.quantity * updated.unitPrice;
        return updated;
      }
      return s;
    }));
  };

  const handleLoadPatientData = async () => {
    if (!formData.patientId) {
      toast({ title: 'Error', description: 'Please enter a Patient ID first.', variant: 'destructive' });
      return;
    }
    try {
      const services: BillingService[] = [];
      const medications = await medicationService.fetchPatientMedications(formData.patientId);
      medications.forEach(med => services.push({ id: `med-${med.id}`, name: `Medication: ${med.medicationName}`, quantity: med.quantity, unitPrice: med.price, total: med.totalCost }));
      const diagnostics = await diagnosticService.fetchPatientDiagnostics(formData.patientId);
      diagnostics.forEach(diag => services.push({ id: `diag-${diag.id}`, name: `Test: ${diag.testName}`, quantity: 1, unitPrice: diag.price, total: diag.price }));
      const roomAssignments = await roomService.fetchPatientRoomAssignments(formData.patientId);
      roomAssignments.filter(ra => ra.status === 'Active').forEach(room => services.push({ id: `room-${room.id}`, name: `Room: ${room.roomNumber} (${room.roomType})`, quantity: room.totalDays || 1, unitPrice: room.dailyRate, total: room.totalCharges || room.dailyRate }));
      if (services.length === 0) {
        toast({ title: 'No Data Found', description: 'No medications, diagnostics, or room charges found.', variant: 'success' });
      } else {
        setBillingServices(services);
        toast({ title: 'Data Loaded', description: `${services.length} service(s) loaded.`, variant: 'success' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load patient data.', variant: 'destructive' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.patientName?.trim()) newErrors.patientName = 'Patient name is required';
    if (!formData.patientId?.trim()) newErrors.patientId = 'Patient ID is required';
    if (!formData.department?.trim()) newErrors.department = 'Department is required';
    if (!formData.doctor?.trim()) newErrors.doctor = 'Doctor name is required';
    if (billingServices.length === 0) { toast({ title: 'Validation Error', description: 'Add at least one service.', variant: 'destructive' }); return false; }
    if (billingServices.some(s => !s.name.trim())) { toast({ title: 'Validation Error', description: 'All services must have a name.', variant: 'destructive' }); return false; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) { toast({ title: 'Validation Error', description: 'Please fill required fields.', variant: 'destructive' }); return; }
    setIsSaving(true);
    try {
      const billingData: BillingRecord = {
        ...formData as BillingRecord,
        services: billingServices.map(s => s.name),
        actor: billing?.actor || billingUsername || billingDisplayName || '',
      };
      if (onSave) await onSave(billingData);
      toast({ title: isEditMode ? 'Invoice Updated' : 'Invoice Created', description: `Invoice ${formData.invoiceNumber} saved.`, variant: 'success' });
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to save invoice.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const outstandingAmount = (formData.amount || 0) - (formData.paidAmount || 0);

  return (
    <>
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="w-full sm:w-[90vw] sm:max-w-[900px] p-0 flex flex-col h-full bg-gradient-to-br from-background to-muted/20"
        side="right"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground tracking-tight truncate">
                    {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
                  </h1>
                  {formData.status && (
                    <Badge variant="outline" className={`${statusColors[formData.status as string] || ''} text-[10px] shrink-0`}>
                      {formData.status}
                    </Badge>
                  )}
                </div>
                {formData.invoiceNumber && (
                  <p className="text-xs text-muted-foreground font-medium">{formData.invoiceNumber}</p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Patient & Invoice Details */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Patient & Invoice Details</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Invoice Number</Label>
                  <Input value={formData.invoiceNumber} disabled className="bg-muted/50 h-9 text-sm font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Patient ID <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.patientId}
                    onChange={e => handleInputChange('patientId', e.target.value)}
                    placeholder="P001"
                    className={`h-9 text-sm ${errors.patientId ? 'border-destructive' : ''}`}
                  />
                  {errors.patientId && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.patientId}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Patient Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.patientName}
                    onChange={e => handleInputChange('patientName', e.target.value)}
                    placeholder="John Smith"
                    className={`h-9 text-sm ${errors.patientName ? 'border-destructive' : ''}`}
                  />
                  {errors.patientName && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.patientName}</p>}
                </div>
                {actor && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Processed By</Label>
                    <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-md bg-muted/50 border border-border/40 h-9">
                      <span className="text-sm font-medium text-foreground">{actor}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground bg-background border border-border/50 rounded px-1 py-0.5">system user</span>
                    </div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <Button type="button" variant="outline" onClick={handleLoadPatientData} className="w-full h-9 text-xs" disabled={!formData.patientId}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Load Patient Data (Medications, Tests, Room Charges)
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-1">Auto-populate services from patient records</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Department <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.department}
                    onChange={e => handleInputChange('department', e.target.value)}
                    placeholder="Cardiology"
                    className={`h-9 text-sm ${errors.department ? 'border-destructive' : ''}`}
                  />
                  {errors.department && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.department}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Doctor <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.doctor}
                    onChange={e => handleInputChange('doctor', e.target.value)}
                    placeholder="Dr. John Doe"
                    className={`h-9 text-sm ${errors.doctor ? 'border-destructive' : ''}`}
                  />
                  {errors.doctor && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.doctor}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Invoice Date</Label>
                  <DatePicker
                    date={invoiceDate}
                    onDateChange={date => { setInvoiceDate(date); handleInputChange('date', date ? date.toISOString().split('T')[0] : ''); }}
                    placeholder="Select date"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Due Date</Label>
                  <DatePicker
                    date={dueDate}
                    onDateChange={date => { setDueDate(date); handleInputChange('dueDate', date ? date.toISOString().split('T')[0] : ''); }}
                    placeholder="Select due date"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Services & Charges */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Services & Charges</span>
              </div>
              <Button onClick={addService} size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary hover:text-primary">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-primary/[0.03] border-b border-border">
                    <th className="text-left px-4 py-2 font-semibold text-primary uppercase tracking-wider">Service</th>
                    <th className="text-center px-2 py-2 font-semibold text-primary uppercase tracking-wider w-20">Qty</th>
                    <th className="text-right px-2 py-2 font-semibold text-primary uppercase tracking-wider w-28">Unit ₹</th>
                    <th className="text-right px-3 py-2 font-semibold text-primary uppercase tracking-wider w-28">Total</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {billingServices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted-foreground py-8 text-xs">
                        No services added. Click "Add" to begin.
                      </td>
                    </tr>
                  ) : (
                    billingServices.map((service, i) => (
                      <tr key={service.id} className={i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}>
                        <td className="px-4 py-2">
                          <Select value={service.name} onValueChange={v => updateService(service.id, 'name', v)}>
                            <SelectTrigger className="h-8 text-xs border-border/50"><SelectValue placeholder="Select service" /></SelectTrigger>
                            <SelectContent>
                              {commonServices.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <Input type="number" min="1" value={service.quantity} onChange={e => updateService(service.id, 'quantity', parseInt(e.target.value) || 1)} className="h-8 w-16 text-xs text-center" />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <Input type="number" min="0" step="0.01" value={service.unitPrice} onChange={e => updateService(service.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="h-8 w-24 text-xs text-right" />
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-foreground">
                          ₹{service.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2">
                          <Button variant="ghost" size="icon" onClick={() => removeService(service.id)} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Payment Summary</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Amount Paid</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.paidAmount}
                      onChange={e => handleInputChange('paidAmount', parseFloat(e.target.value) || 0)}
                      className="h-9 text-sm font-semibold"
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-primary/[0.03] border border-border/50 p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Amount</span>
                    <span className="text-sm font-bold text-foreground">₹{(formData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Paid</span>
                    <span className="text-sm font-semibold text-green-600">₹{(formData.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-border/50 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-foreground">Outstanding</span>
                      <span className={`text-lg font-bold ${outstandingAmount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        ₹{outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Record Payment */}
          {isEditMode && billing && outstandingAmount > 0 && (
            <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Outstanding Balance</p>
                <p className="text-lg font-bold text-amber-600">₹{outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <Button variant="outline" className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5" onClick={() => setShowPaymentDialog(true)}>
                <CreditCard className="h-3.5 w-3.5" /> Record Payment
              </Button>
            </div>
          )}

          {/* Info notice */}
          <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-3 flex gap-3">
            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">Billing Information</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                All billing records are stored securely. Payment status updates automatically based on paid amount.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border/50 px-5 py-3 bg-background/95 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 px-3 text-xs">Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-8 px-4 text-xs">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>

    {billing && (
      <RecordPaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        totalAmount={formData.amount || 0}
        paidAmount={formData.paidAmount || 0}
        onRecordPayment={async (payment: PaymentRecord) => {
          const newPaidAmount = (formData.paidAmount || 0) + payment.amount;
          const newStatus = newPaidAmount >= (formData.amount || 0) ? 'Paid' : 'Partial';
          try {
            await billingService.updateBillingRecord(billing.id, { paidAmount: newPaidAmount, status: newStatus });
            setFormData(prev => ({ ...prev, paidAmount: newPaidAmount, status: newStatus }));
            toast({ title: 'Payment Recorded', description: `₹${payment.amount.toFixed(2)} recorded.`, variant: 'success' });
            onRefresh?.();
          } catch {
            throw new Error('Failed to record payment');
          }
        }}
        entityLabel={formData.invoiceNumber || billing.id}
      />
    )}
    </>
  );
};

export default ModernBillingOverlay;
