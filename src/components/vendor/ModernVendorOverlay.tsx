import { useState, useEffect } from 'react';
import { Save, Edit3, X, Building2, User, CreditCard, Package, Calendar, Phone, Mail, MapPin, Globe, Receipt, Trash2, Tag, Hash, FileText, Briefcase, AlertCircle, Building } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Card removed — using tinted section headers pattern
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from '@/hooks/use-toast';
import { Vendor } from '@/types/inventory';
import { formatIndianCurrency } from '@/lib/utils';
import { fetchActiveTaxes, type Tax } from '@/services/taxService';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ModernVendorOverlayProps {
  vendor: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  onSave?: (vendor: Vendor) => void;
  onUpdate?: (vendor: Vendor) => void;
  onDelete?: (vendorId: string) => void;
}

// Autocomplete data
const vendorSuggestions = [
  'Meditech Supplies Ltd', 'HealthCare Solutions Inc', 'Phoenix Medical Equipment',
  'Global Pharma Trading', 'Elite Office Supplies', 'Premier Food Services',
  'TechnoMed Instruments', 'Sunrise Healthcare', 'Metro Medical Systems', 'Universal Supply Chain'
];

const categorySuggestions = [
  'Food & Beverages', 'Medical Equipment', 'Pharmaceuticals', 'Office Supplies',
  'Cleaning Supplies', 'Electronics', 'Furniture', 'Textiles', 'Laboratory Equipment', 'Surgical Instruments'
];

const citySuggestions = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal'
];

const stateSuggestions = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi'
];

const bankSuggestions = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Punjab National Bank', 'Bank of Baroda',
  'Canara Bank', 'Union Bank of India', 'Bank of India', 'Indian Bank', 'Central Bank of India',
  'AXIS Bank', 'Kotak Mahindra Bank', 'IndusInd Bank', 'YES Bank', 'IDFC First Bank'
];

const paymentTermsSuggestions = [
  'Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Advance Payment',
  '2/10 Net 30', '1/10 Net 30', 'Due on Receipt', 'End of Month'
];

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-800 border-green-200',
  'Inactive': 'bg-red-100 text-red-800 border-red-200',
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

// ─── View-mode detail row ─────────────────────────────────────────────────────
const DetailRow = ({ label, value, index }: { label: string; value: React.ReactNode; index: number }) => (
  <div className={`flex items-center justify-between px-4 py-2.5 ${index % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
    <span className="text-xs text-muted-foreground font-medium">{label}</span>
    <span className="text-sm font-medium text-foreground text-right max-w-[60%] truncate">{value || '—'}</span>
  </div>
);

// ─── Autocomplete ─────────────────────────────────────────────────────────────
interface AutocompleteInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

const AutocompleteInput = ({ id, value, onChange, suggestions, placeholder, disabled, className }: AutocompleteInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (value.length > 0) {
      setFilteredSuggestions(suggestions.filter(item => item.toLowerCase().includes(value.toLowerCase())));
    } else {
      setFilteredSuggestions([]);
    }
  }, [value, suggestions]);

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowSuggestions(e.target.value.length > 0); }}
        onFocus={() => setShowSuggestions(value.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
          {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
            <div
              key={index}
              className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 transition-colors text-sm"
              onClick={() => { onChange(suggestion); setShowSuggestions(false); }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ModernVendorOverlay = ({
  vendor,
  isOpen,
  onClose,
  isEdit = false,
  onSave,
  onUpdate,
  onDelete
}: ModernVendorOverlayProps) => {
  const [name, setName] = useState(vendor?.name || '');
  const [contactPerson, setContactPerson] = useState(vendor?.contactPerson || '');
  const [phone, setPhone] = useState(vendor?.phone || '');
  const [email, setEmail] = useState(vendor?.email || '');
  const [address, setAddress] = useState(vendor?.address || '');
  const [city, setCity] = useState(vendor?.city || '');
  const [state, setState] = useState(vendor?.state || '');
  const [zipCode, setZipCode] = useState(vendor?.zipCode || '');
  const [country, setCountry] = useState(vendor?.country || 'India');
  const [category, setCategory] = useState(vendor?.category || '');
  const [status, setStatus] = useState(vendor?.status || 'Active');
  const [website, setWebsite] = useState(vendor?.website || '');
  const [taxId, setTaxId] = useState(vendor?.taxId || '');
  const [applicableTaxIds, setApplicableTaxIds] = useState<string[]>([]);
  const [defaultPurchaseTaxId, setDefaultPurchaseTaxId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState(vendor?.paymentTerms || 'Net 30');
  const [creditLimit, setCreditLimit] = useState(vendor?.creditLimit || 0);
  const [bankName, setBankName] = useState(vendor?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(vendor?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(vendor?.ifscCode || '');
  const [notes, setNotes] = useState(vendor?.notes || '');
  const [isEditMode, setIsEditMode] = useState(isEdit || !vendor);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTaxes, setAvailableTaxes] = useState<Tax[]>([]);
  const [loadingTaxes, setLoadingTaxes] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadTaxes = async () => {
      setLoadingTaxes(true);
      try {
        const taxes = await fetchActiveTaxes('purchase');
        setAvailableTaxes(taxes);
      } catch {
        toast({ title: 'Error', description: 'Failed to load tax options.', variant: 'destructive' });
      } finally {
        setLoadingTaxes(false);
      }
    };
    loadTaxes();
  }, []);

  useEffect(() => {
    if (vendor) {
      setName(vendor.name || '');
      setContactPerson(vendor.contactPerson || '');
      setPhone(vendor.phone || '');
      setEmail(vendor.email || '');
      setAddress(vendor.address || '');
      setCity(vendor.city || '');
      setState(vendor.state || '');
      setZipCode(vendor.zipCode || '');
      setCountry(vendor.country || 'India');
      setCategory(vendor.category || '');
      setStatus(vendor.status || 'Active');
      setWebsite(vendor.website || '');
      setTaxId(vendor.taxId || '');
      setPaymentTerms(vendor.paymentTerms || 'Net 30');
      setCreditLimit(vendor.creditLimit || 0);
      setBankName(vendor.bankName || '');
      setAccountNumber(vendor.accountNumber || '');
      setIfscCode(vendor.ifscCode || '');
      setNotes(vendor.notes || '');
    }
    setApplicableTaxIds([]);
    setDefaultPurchaseTaxId('');
    setIsEditMode(isEdit || !vendor);
  }, [vendor, isEdit]);

  const handleSaveVendor = async () => {
    if (!name.trim()) { toast({ title: 'Validation Error', description: 'Please enter vendor name.', variant: 'destructive' }); return; }
    if (!contactPerson.trim()) { toast({ title: 'Validation Error', description: 'Please enter contact person name.', variant: 'destructive' }); return; }
    if (!email.trim()) { toast({ title: 'Validation Error', description: 'Please enter email address.', variant: 'destructive' }); return; }
    if (!category.trim()) { toast({ title: 'Validation Error', description: 'Please select a category.', variant: 'destructive' }); return; }

    setIsSaving(true);
    try {
      const vendorData: any = {
        id: vendor?.id || '',
        vendorId: vendor?.vendorId || `V${String(Date.now()).slice(-6)}`,
        name, contactPerson, phone, email, address, city, state, zipCode, country, category,
        status: status as 'Active' | 'Inactive' | 'Pending',
        website, taxId: taxId || '', paymentTerms, creditLimit, bankName, accountNumber, ifscCode, notes,
        totalOrders: vendor?.totalOrders || 0, totalValue: vendor?.totalValue || 0,
        outstandingBalance: vendor?.outstandingBalance || 0,
        registrationDate: vendor?.registrationDate || new Date().toISOString().split('T')[0],
        lastOrderDate: vendor?.lastOrderDate,
        applicableTaxIds: applicableTaxIds.length > 0 ? applicableTaxIds : undefined,
        defaultPurchaseTaxId: defaultPurchaseTaxId || undefined,
      };

      if (vendor && onUpdate) {
        await onUpdate(vendorData);
        toast({ title: 'Vendor Updated', description: `${vendorData.name} updated successfully.`, variant: 'success' });
      } else if (onSave) {
        await onSave(vendorData);
        toast({ title: 'Vendor Created', description: `${vendorData.name} created successfully.`, variant: 'success' });
      }
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to save vendor.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (vendor && onDelete) {
      onDelete(vendor.id);
      toast({ title: 'Vendor Deleted', description: `${vendor.name} has been removed.`, variant: 'success' });
      onClose();
    }
  };

  const isViewMode = !!vendor && !isEditMode;

  // ─────────────────────────────────────────────────── VIEW MODE ───────────────
  if (isViewMode) {
    return (
      <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          className="w-full sm:w-[90vw] sm:max-w-[680px] p-0 flex flex-col h-full bg-gradient-to-br from-background to-muted/20"
          side="right"
        >
          {/* Header — title + subtitle + close only; CTAs are in the footer */}
          <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-foreground tracking-tight leading-tight break-words">{vendor.name}</h1>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{vendor.vendorId} · {vendor.category || 'Uncategorized'}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-xl font-bold text-foreground">{vendor.totalOrders || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Orders</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-lg font-bold text-green-600">{formatIndianCurrency(vendor.totalValue || 0)}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Total Value</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-lg font-bold text-amber-600">{formatIndianCurrency(vendor.outstandingBalance || 0)}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Outstanding</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Basic Information</span>
              </div>
              <DetailRow label="Vendor Name" value={vendor.name} index={0} />
              <DetailRow label="Vendor ID" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{vendor.vendorId}</code>} index={1} />
              <DetailRow label="Category" value={vendor.category} index={2} />
              <DetailRow label="Website" value={vendor.website} index={3} />
              <DetailRow label="Registration" value={vendor.registrationDate ? new Date(vendor.registrationDate).toLocaleDateString() : '—'} index={4} />
            </div>

            {/* Contact */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Contact Information</span>
              </div>
              <DetailRow label="Contact Person" value={vendor.contactPerson} index={0} />
              <DetailRow label="Phone" value={vendor.phone} index={1} />
              <DetailRow label="Email" value={vendor.email} index={2} />
            </div>

            {/* Address */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Address</span>
              </div>
              <DetailRow label="Street" value={vendor.address} index={0} />
              <DetailRow label="City" value={vendor.city} index={1} />
              <DetailRow label="State" value={vendor.state} index={2} />
              <DetailRow label="ZIP Code" value={vendor.zipCode} index={3} />
              <DetailRow label="Country" value={vendor.country} index={4} />
            </div>

            {/* Financial */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Financial Information</span>
              </div>
              <DetailRow label="Payment Terms" value={vendor.paymentTerms} index={0} />
              <DetailRow label="Credit Limit" value={formatIndianCurrency(vendor.creditLimit || 0)} index={1} />
              <DetailRow label="Bank Name" value={vendor.bankName} index={2} />
              <DetailRow label="Tax ID / PAN" value={vendor.taxId} index={3} />
            </div>

            {/* Notes */}
            {vendor.notes && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Notes</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{vendor.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-border/50 px-5 py-3 bg-background/95 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)} className="gap-1.5 text-xs">
              <Edit3 className="h-3.5 w-3.5" /> Edit Vendor
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete vendor ${vendor?.name ?? ''}?`}
        description="This will permanently remove this vendor from the system. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
      </>
    );
  }

  // ─────────────────────────────────────────────────── EDIT / ADD MODE ─────────
  return (
    <>
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="w-full sm:w-[90vw] sm:max-w-[780px] p-0 flex flex-col h-full bg-gradient-to-br from-background to-muted/20"
        side="right"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-foreground tracking-tight truncate">
                  {vendor ? 'Edit Vendor' : 'New Vendor'}
                </h1>
                {vendor?.vendorId && (
                  <p className="text-xs text-muted-foreground font-medium">{vendor.vendorId}</p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Basic Information */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Basic Information</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Vendor Name <span className="text-destructive">*</span></Label>
                <AutocompleteInput value={name} onChange={setName} suggestions={vendorSuggestions} placeholder="Enter vendor name" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Category <span className="text-destructive">*</span></Label>
                <AutocompleteInput value={category} onChange={setCategory} suggestions={categorySuggestions} placeholder="Select category" className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" />Active</div></SelectItem>
                      <SelectItem value="Inactive"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" />Inactive</div></SelectItem>
                      <SelectItem value="Pending"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" />Pending</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Website</Label>
                  <Input value={website} onChange={e => setWebsite(e.target.value)} className="h-9 text-sm" placeholder="www.example.com" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Contact Information</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Contact Person <span className="text-destructive">*</span></Label>
                <Input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="h-9 text-sm" placeholder="Contact person name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-9 text-sm" placeholder="+91-XXXXXXXXXX" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Email <span className="text-destructive">*</span></Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-9 text-sm" placeholder="contact@vendor.com" />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Address</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Street Address</Label>
                <Textarea value={address} onChange={e => setAddress(e.target.value)} className="text-sm resize-none" placeholder="Enter street address" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">City</Label>
                  <AutocompleteInput value={city} onChange={setCity} suggestions={citySuggestions} placeholder="City" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">State</Label>
                  <AutocompleteInput value={state} onChange={setState} suggestions={stateSuggestions} placeholder="State" className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">ZIP Code</Label>
                  <Input value={zipCode} onChange={e => setZipCode(e.target.value)} className="h-9 text-sm" placeholder="ZIP code" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Country</Label>
                  <Input value={country} onChange={e => setCountry(e.target.value)} className="h-9 text-sm" placeholder="Country" />
                </div>
              </div>
            </div>
          </div>

          {/* Tax & Legal */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Receipt className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Tax & Legal</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Tax ID / PAN</Label>
                <Input value={taxId} onChange={e => setTaxId(e.target.value)} className="h-9 text-sm" placeholder="PAN number" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Applicable Tax Slabs</Label>
                <Select
                  disabled={loadingTaxes}
                  value={applicableTaxIds.length > 0 ? applicableTaxIds[0] : ''}
                  onValueChange={(value) => {
                    if (value && !applicableTaxIds.includes(value)) {
                      setApplicableTaxIds([...applicableTaxIds, value]);
                      if (applicableTaxIds.length === 0) setDefaultPurchaseTaxId(value);
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={loadingTaxes ? 'Loading...' : 'Select taxes'} /></SelectTrigger>
                  <SelectContent>
                    {availableTaxes.filter(t => !applicableTaxIds.includes(t._id)).map(tax => (
                      <SelectItem key={tax._id} value={tax._id}>{tax.name} ({tax.rate}%)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {applicableTaxIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {applicableTaxIds.map(id => {
                      const tax = availableTaxes.find(t => t._id === id);
                      return (
                        <Badge key={id} variant="outline" className="cursor-pointer" onClick={() => {
                          setApplicableTaxIds(applicableTaxIds.filter(i => i !== id));
                          if (defaultPurchaseTaxId === id) setDefaultPurchaseTaxId('');
                        }}>
                          {tax ? `${tax.name} (${tax.rate}%)` : id}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Default Purchase Tax</Label>
                <Select disabled={applicableTaxIds.length === 0} value={defaultPurchaseTaxId} onValueChange={setDefaultPurchaseTaxId}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={applicableTaxIds.length === 0 ? 'Select taxes first' : 'Select default'} /></SelectTrigger>
                  <SelectContent>
                    {availableTaxes.filter(t => applicableTaxIds.includes(t._id)).map(tax => (
                      <SelectItem key={tax._id} value={tax._id}>{tax.name} ({tax.rate}%)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Financial Information</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Payment Terms</Label>
                  <AutocompleteInput value={paymentTerms} onChange={setPaymentTerms} suggestions={paymentTermsSuggestions} placeholder="Terms" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Credit Limit (₹)</Label>
                  <Input type="number" value={creditLimit} onChange={e => setCreditLimit(parseFloat(e.target.value) || 0)} className="h-9 text-sm" placeholder="Credit limit" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Bank Name</Label>
                <AutocompleteInput value={bankName} onChange={setBankName} suggestions={bankSuggestions} placeholder="Bank name" className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Account Number</Label>
                  <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="h-9 text-sm" placeholder="Account number" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">IFSC Code</Label>
                  <Input value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="h-9 text-sm" placeholder="IFSC code" />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Notes</span>
            </div>
            <div className="p-4">
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="text-sm resize-none" placeholder="Additional notes..." rows={3} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border/50 px-5 py-3 bg-background/95 flex items-center justify-between">
          <div>
            {vendor && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditMode(false)} className="text-xs text-muted-foreground">
                Cancel Edit
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 px-3 text-xs">Cancel</Button>
            <Button size="sm" onClick={handleSaveVendor} disabled={isSaving} className="h-8 px-4 text-xs">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {isSaving ? 'Saving...' : vendor ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <ConfirmDialog
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      title={`Delete vendor ${vendor?.name ?? ''}?`}
      description="This will permanently remove this vendor. This action cannot be undone."
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={handleDelete}
    />
    </>
  );
};
