import { useState, useEffect } from 'react';
import { X, Save, FileText, User, Calendar, DollarSign, CreditCard, Plus, Trash2, AlertCircle, Check, Download } from 'lucide-react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/hooks/use-toast";
import { BillingRecord } from '@/services/billingService';
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
}

const statusColors = {
  Paid: 'bg-green-100 text-green-800 border-green-200',
  Partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Pending: 'bg-red-100 text-red-800 border-red-200',
  Overdue: 'bg-red-100 text-red-800 border-red-200'
};

const commonServices = [
  'Consultation',
  'X-Ray',
  'CT Scan',
  'MRI',
  'Blood Test',
  'ECG',
  'Ultrasound',
  'Surgery',
  'Emergency Care',
  'Physical Therapy',
  'Medication',
  'Lab Test',
  'Room Charges',
  'ICU Charges'
];

export const ModernBillingOverlay = ({
  isOpen,
  onClose,
  billing,
  isEditMode = false,
  onSave
}: ModernBillingOverlayProps) => {
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
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (billing && isEditMode) {
      setFormData(billing);
      setInvoiceDate(billing.date ? new Date(billing.date) : undefined);
      setDueDate(billing.dueDate ? new Date(billing.dueDate) : undefined);
      // Convert services array to billing services format
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
      // Generate new invoice number
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

  // Calculate total amount when services change
  useEffect(() => {
    const totalAmount = billingServices.reduce((sum, service) => sum + service.total, 0);
    setFormData(prev => ({ ...prev, amount: totalAmount }));
  }, [billingServices]);

  // Update status based on paid amount
  useEffect(() => {
    if (formData.amount && formData.paidAmount !== undefined) {
      let newStatus = 'Pending';
      if (formData.paidAmount >= formData.amount) {
        newStatus = 'Paid';
      } else if (formData.paidAmount > 0) {
        newStatus = 'Partial';
      }
      setFormData(prev => ({ ...prev, status: newStatus }));
    }
  }, [formData.paidAmount, formData.amount]);

  const handleInputChange = (field: keyof BillingRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addService = () => {
    const newService: BillingService = {
      id: `service-${Date.now()}`,
      name: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setBillingServices([...billingServices, newService]);
  };

  const removeService = (id: string) => {
    setBillingServices(billingServices.filter(service => service.id !== id));
  };

  const updateService = (id: string, field: keyof BillingService, value: any) => {
    setBillingServices(billingServices.map(service => {
      if (service.id === id) {
        const updated = { ...service, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return service;
    }));
  };

  const handleLoadPatientData = async () => {
    if (!formData.patientId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a Patient ID first.",
      });
      return;
    }

    try {
      const services: BillingService[] = [];

      // Load medications
      const medications = await medicationService.fetchPatientMedications(formData.patientId);
      medications.forEach((med) => {
        services.push({
          id: `med-${med.id}`,
          name: `Medication: ${med.medicationName}`,
          quantity: med.quantity,
          unitPrice: med.price,
          total: med.totalCost
        });
      });

      // Load diagnostics
      const diagnostics = await diagnosticService.fetchPatientDiagnostics(formData.patientId);
      diagnostics.forEach((diag) => {
        services.push({
          id: `diag-${diag.id}`,
          name: `Test: ${diag.testName}`,
          quantity: 1,
          unitPrice: diag.price,
          total: diag.price
        });
      });

      // Load room charges
      const roomAssignments = await roomService.fetchPatientRoomAssignments(formData.patientId);
      roomAssignments.filter(ra => ra.status === 'Active').forEach((room) => {
        services.push({
          id: `room-${room.id}`,
          name: `Room: ${room.roomNumber} (${room.roomType})`,
          quantity: room.totalDays || 1,
          unitPrice: room.dailyRate,
          total: room.totalCharges || room.dailyRate
        });
      });

      if (services.length === 0) {
        toast({
          title: "No Data Found",
          description: "No medications, diagnostics, or room charges found for this patient.",
        });
      } else {
        setBillingServices(services);
        toast({
          title: "Data Loaded",
          description: `${services.length} service(s) loaded from patient records.`,
        });
      }
    } catch (error) {
      console.error('Failed to load patient data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load patient data. Please try again.",
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientName?.trim()) {
      newErrors.patientName = 'Patient name is required';
    }

    if (!formData.patientId?.trim()) {
      newErrors.patientId = 'Patient ID is required';
    }

    if (!formData.department?.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.doctor?.trim()) {
      newErrors.doctor = 'Doctor name is required';
    }

    if (billingServices.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please add at least one service.",
      });
      return false;
    }

    const hasEmptyServices = billingServices.some(service => !service.name.trim());
    if (hasEmptyServices) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "All services must have a name.",
      });
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const serviceNames = billingServices.map(service => service.name);
      const billingData: BillingRecord = {
        ...formData as BillingRecord,
        services: serviceNames
      };

      if (onSave) {
        await onSave(billingData);
      }
      toast({
        title: isEditMode ? "Invoice Updated" : "Invoice Created",
        description: `Invoice ${formData.invoiceNumber} has been successfully ${isEditMode ? 'updated' : 'created'}.`,
      });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save invoice. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const outstandingAmount = (formData.amount || 0) - (formData.paidAmount || 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        className="w-full sm:w-[90vw] sm:max-w-[1200px] p-0 flex flex-col h-full bg-gradient-to-br from-background to-muted/20"
        side="right"
      >
        {/* Modern Header */}
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 p-3 sm:p-6">
          <div className="flex items-start justify-between mb-2 sm:mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <FileText className="h-6 w-6 text-primary" />
                <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight truncate">
                  {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
                </h1>
                {formData.status && (
                  <Badge 
                    variant="outline" 
                    className={`${statusColors[formData.status as keyof typeof statusColors]} text-xs shrink-0`}
                  >
                    {formData.status}
                  </Badge>
                )}
              </div>
              {formData.invoiceNumber && (
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                  Invoice: {formData.invoiceNumber}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 ml-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving}
                className="h-9 px-3 bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{isSaving ? 'Saving...' : 'Save'}</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClose} 
                className="h-9 px-3 bg-background/90 hover:bg-destructive hover:text-destructive-foreground border-border/70"
              >
                <X className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Close</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Patient & Invoice Information */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Patient & Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Invoice Number */}
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber" className="text-sm font-medium">
                    Invoice Number
                  </Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    disabled
                    className="bg-muted/50 font-mono"
                  />
                </div>

                {/* Patient ID */}
                <div className="space-y-2">
                  <Label htmlFor="patientId" className="text-sm font-medium">
                    Patient ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="patientId"
                    value={formData.patientId}
                    onChange={(e) => handleInputChange('patientId', e.target.value)}
                    placeholder="P001"
                    className={errors.patientId ? 'border-destructive' : ''}
                  />
                  {errors.patientId && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.patientId}
                    </p>
                  )}
                </div>

                {/* Patient Name */}
                <div className="space-y-2">
                  <Label htmlFor="patientName" className="text-sm font-medium">
                    Patient Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    placeholder="John Smith"
                    className={errors.patientName ? 'border-destructive' : ''}
                  />
                  {errors.patientName && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.patientName}
                    </p>
                  )}
                </div>

                {/* Load Patient Data Button */}
                <div className="md:col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadPatientData}
                    className="w-full"
                    disabled={!formData.patientId}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Load Patient Data (Medications, Tests, Room Charges)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically populate services from patient records
                  </p>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Cardiology"
                    className={errors.department ? 'border-destructive' : ''}
                  />
                  {errors.department && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Doctor */}
                <div className="space-y-2">
                  <Label htmlFor="doctor" className="text-sm font-medium">
                    Doctor <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="doctor"
                    value={formData.doctor}
                    onChange={(e) => handleInputChange('doctor', e.target.value)}
                    placeholder="Dr. John Doe"
                    className={errors.doctor ? 'border-destructive' : ''}
                  />
                  {errors.doctor && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.doctor}
                    </p>
                  )}
                </div>

                {/* Invoice Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    Invoice Date
                  </Label>
                  <div className="mt-1">
                    <DatePicker
                      date={invoiceDate}
                      onDateChange={(date) => {
                        setInvoiceDate(date);
                        handleInputChange('date', date ? date.toISOString().split('T')[0] : '');
                      }}
                      placeholder="Select invoice date"
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    Due Date
                  </Label>
                  <div className="mt-1">
                    <DatePicker
                      date={dueDate}
                      onDateChange={(date) => {
                        setDueDate(date);
                        handleInputChange('dueDate', date ? date.toISOString().split('T')[0] : '');
                      }}
                      placeholder="Select due date"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Section */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Services & Charges
                </CardTitle>
                <Button onClick={addService} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Service</TableHead>
                      <TableHead className="font-semibold w-24">Qty</TableHead>
                      <TableHead className="font-semibold w-32">Unit Price</TableHead>
                      <TableHead className="font-semibold w-32">Total</TableHead>
                      <TableHead className="font-semibold w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No services added yet. Click "Add Service" to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      billingServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <Select
                              value={service.name}
                              onValueChange={(value) => updateService(service.id, 'name', value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                              <SelectContent>
                                {commonServices.map((serviceName) => (
                                  <SelectItem key={serviceName} value={serviceName}>
                                    {serviceName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={service.quantity}
                              onChange={(e) => updateService(service.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={service.unitPrice}
                                onChange={(e) => updateService(service.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="pl-8"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${service.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeService(service.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Paid Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="paidAmount" className="text-sm font-medium">
                      Amount Paid
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="paidAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.paidAmount}
                        onChange={(e) => handleInputChange('paidAmount', parseFloat(e.target.value) || 0)}
                        className="pl-10 text-lg font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Amount:</span>
                    <span className="text-lg font-bold">${(formData.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Paid Amount:</span>
                    <span className="text-lg font-semibold text-green-600">${(formData.paidAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Outstanding:</span>
                      <span className={`text-xl font-bold ${outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${outstandingAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Notice */}
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Billing Information
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    All billing records are stored securely. Payment status is automatically updated based on the paid amount.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ModernBillingOverlay;
