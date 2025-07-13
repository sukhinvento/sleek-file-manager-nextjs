import { useState, useEffect } from 'react';
import { Save, Edit3, X, Building2, User, CreditCard, Package, Calendar, Phone, Mail, MapPin, Globe, Receipt } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ModernInventoryOverlay } from '../inventory/ModernInventoryOverlay';

interface Vendor {
  id?: number;
  vendorId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  category: string;
  status: string;
  totalOrders?: number;
  lastOrderDate?: string;
  totalValue?: number;
  paymentTerms: string;
  taxId: string;
  gstNumber?: string;
  website?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  creditLimit: number;
  outstandingBalance?: number;
  registrationDate?: string;
  notes?: string;
}

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
  'Meditech Supplies Ltd',
  'HealthCare Solutions Inc',
  'Phoenix Medical Equipment',
  'Global Pharma Trading',
  'Elite Office Supplies',
  'Premier Food Services',
  'TechnoMed Instruments',
  'Sunrise Healthcare',
  'Metro Medical Systems',
  'Universal Supply Chain'
];

const categorySuggestions = [
  'Food & Beverages',
  'Medical Equipment',
  'Pharmaceuticals', 
  'Office Supplies',
  'Cleaning Supplies',
  'Electronics',
  'Furniture',
  'Textiles',
  'Laboratory Equipment',
  'Surgical Instruments'
];

const citySuggestions = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 
  'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
  'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi'
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
  'AXIS Bank', 'Kotak Mahindra Bank', 'IndusInd Bank', 'YES Bank', 'IDFC First Bank',
  'Federal Bank', 'South Indian Bank', 'Karur Vysya Bank', 'City Union Bank', 'DCB Bank'
];

const paymentTermsSuggestions = [
  'Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Advance Payment', 
  '2/10 Net 30', '1/10 Net 30', 'Due on Receipt', 'End of Month'
];

const statusColors = {
  'Active': 'delivered' as const,
  'Inactive': 'cancelled' as const,
  'Pending': 'pending' as const
};

// Custom Autocomplete Component
interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

const AutocompleteInput = ({ value, onChange, suggestions, placeholder, disabled, className }: AutocompleteInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = suggestions.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [value, suggestions]);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setShowSuggestions(inputValue.length > 0);
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
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
              onClick={() => handleSelect(suggestion)}
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
  const [name, setName] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');
  const [country, setCountry] = useState<string>('India');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('Active');
  const [website, setWebsite] = useState<string>('');
  const [taxId, setTaxId] = useState<string>('');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30');
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(isEdit);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
      setGstNumber(vendor.gstNumber || '');
      setPaymentTerms(vendor.paymentTerms || 'Net 30');
      setCreditLimit(vendor.creditLimit || 0);
      setBankName(vendor.bankName || '');
      setAccountNumber(vendor.accountNumber || '');
      setIfscCode(vendor.ifscCode || '');
      setNotes(vendor.notes || '');
    } else {
      // Reset form for new vendor
      setName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setCountry('India');
      setCategory('');
      setStatus('Active');
      setWebsite('');
      setTaxId('');
      setGstNumber('');
      setPaymentTerms('Net 30');
      setCreditLimit(0);
      setBankName('');
      setAccountNumber('');
      setIfscCode('');
      setNotes('');
    }
    setIsEditMode(isEdit);
  }, [vendor, isEdit]);

  const handleSaveVendor = async () => {
    // Validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter vendor name.",
        variant: "destructive",
      });
      return;
    }

    if (!contactPerson.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter contact person name.",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter email address.",
        variant: "destructive",
      });
      return;
    }

    if (!category.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a category.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const vendorData: Vendor = {
        id: vendor?.id,
        vendorId: vendor?.vendorId || `V${String(Date.now()).slice(-6)}`,
        name,
        contactPerson,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        country,
        category,
        status,
        website,
        taxId,
        gstNumber,
        paymentTerms,
        creditLimit,
        bankName,
        accountNumber,
        ifscCode,
        notes,
        totalOrders: vendor?.totalOrders || 0,
        totalValue: vendor?.totalValue || 0,
        outstandingBalance: vendor?.outstandingBalance || 0,
        registrationDate: vendor?.registrationDate || new Date().toISOString().split('T')[0],
        lastOrderDate: vendor?.lastOrderDate,
      };

      if (vendor && onUpdate) {
        await onUpdate(vendorData);
        toast({
          title: "Vendor Updated",
          description: `Vendor ${vendorData.name} has been updated successfully.`,
        });
      } else if (onSave) {
        await onSave(vendorData);
        toast({
          title: "Vendor Created",
          description: `Vendor ${vendorData.name} has been created successfully.`,
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const quickActions = (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <Package className="h-4 w-4 mr-1" />
        Orders
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <CreditCard className="h-4 w-4 mr-1" />
        Payments
      </Button>
    </div>
  );

  const headerActions = (
    <div className="flex items-center gap-2">
      {(isEditMode || !vendor) && (
        <>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (vendor) {
                setIsEditMode(false);
              } else {
                onClose();
              }
            }}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={handleSaveVendor}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {vendor ? 'Update' : 'Create'}
              </>
            )}
          </Button>
        </>
      )}
      
      {!isEditMode && vendor && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditMode(true)}
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}
    </div>
  );

  return (
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={vendor ? `Vendor ${vendor.vendorId}` : 'New Vendor'}
      subtitle={vendor ? vendor.name : 'Create a new vendor profile'}
      status={vendor?.status}
      statusColor={vendor?.status ? statusColors[vendor.status] : 'pending'}
      size="large"
      headerActions={headerActions}
      quickActions={quickActions}
    >
      <div className="flex h-full overflow-hidden bg-gradient-to-br from-background to-muted/20">
        {/* Left Panel - Basic & Contact Information */}
        <div className="w-96 border-r border-border/50 bg-background/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vendor-name" className="text-xs font-medium">Vendor Name *</Label>
                  <AutocompleteInput
                    value={name}
                    onChange={setName}
                    suggestions={vendorSuggestions}
                    placeholder="Enter or select vendor name"
                    disabled={!isEditMode}
                    className="h-9 text-sm mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-xs font-medium">Category *</Label>
                  <AutocompleteInput
                    value={category}
                    onChange={setCategory}
                    suggestions={categorySuggestions}
                    placeholder="Enter or select category"
                    disabled={!isEditMode}
                    className="h-9 text-sm mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="status" className="text-xs font-medium">Status</Label>
                    <Select value={status} onValueChange={setStatus} disabled={!isEditMode}>
                      <SelectTrigger className="h-9 text-sm mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="website" className="text-xs font-medium">Website</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      disabled={!isEditMode}
                      className="h-9 text-sm mt-1"
                      placeholder="www.example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact-person" className="text-xs font-medium">Contact Person *</Label>
                  <Input
                    id="contact-person"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    disabled={!isEditMode}
                    className="h-9 text-sm mt-1"
                    placeholder="Enter contact person name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone" className="text-xs font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditMode}
                      className="h-9 text-sm mt-1"
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-xs font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditMode}
                      className="h-9 text-sm mt-1"
                      placeholder="contact@vendor.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address" className="text-xs font-medium">Street Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={!isEditMode}
                    className="text-sm resize-none mt-1"
                    placeholder="Enter complete street address"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city" className="text-xs font-medium">City</Label>
                    <AutocompleteInput
                      value={city}
                      onChange={setCity}
                      suggestions={citySuggestions}
                      placeholder="Enter city"
                      disabled={!isEditMode}
                      className="h-9 text-sm mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state" className="text-xs font-medium">State</Label>
                    <AutocompleteInput
                      value={state}
                      onChange={setState}
                      suggestions={stateSuggestions}
                      placeholder="Enter state"
                      disabled={!isEditMode}
                      className="h-9 text-sm mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="zip-code" className="text-xs font-medium">ZIP Code</Label>
                    <Input
                      id="zip-code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      disabled={!isEditMode}
                      className="h-9 text-sm mt-1"
                      placeholder="Enter ZIP code"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="country" className="text-xs font-medium">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={!isEditMode}
                      className="h-9 text-sm mt-1"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Financial & Additional Information */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6 space-y-6 overflow-y-auto">
            {/* Tax & Legal Information */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Tax & Legal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tax-id" className="text-sm font-medium">Tax ID / PAN</Label>
                    <Input
                      id="tax-id"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      disabled={!isEditMode}
                      className="mt-1"
                      placeholder="Enter PAN number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gst-number" className="text-sm font-medium">GST Number</Label>
                    <Input
                      id="gst-number"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      disabled={!isEditMode}
                      className="mt-1"
                      placeholder="Enter GST number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment-terms" className="text-sm font-medium">Payment Terms</Label>
                      <AutocompleteInput
                        value={paymentTerms}
                        onChange={setPaymentTerms}
                        suggestions={paymentTermsSuggestions}
                        placeholder="Enter payment terms"
                        disabled={!isEditMode}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="credit-limit" className="text-sm font-medium">Credit Limit (₹)</Label>
                      <Input
                        id="credit-limit"
                        type="number"
                        value={creditLimit}
                        onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                        disabled={!isEditMode}
                        className="mt-1"
                        placeholder="Enter credit limit"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bank-name" className="text-sm font-medium">Bank Name</Label>
                    <AutocompleteInput
                      value={bankName}
                      onChange={setBankName}
                      suggestions={bankSuggestions}
                      placeholder="Enter or select bank name"
                      disabled={!isEditMode}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="account-number" className="text-sm font-medium">Account Number</Label>
                      <Input
                        id="account-number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        disabled={!isEditMode}
                        className="mt-1"
                        placeholder="Enter account number"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ifsc-code" className="text-sm font-medium">IFSC Code</Label>
                      <Input
                        id="ifsc-code"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        disabled={!isEditMode}
                        className="mt-1"
                        placeholder="Enter IFSC code"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Statistics - Show only for existing vendors */}
            {vendor && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4 border-b border-border/50">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-border/30">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{vendor.totalOrders || 0}</div>
                        <div className="text-sm text-muted-foreground">Total Orders</div>
                      </CardContent>
                    </Card>
                    <Card className="border-border/30">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{(vendor.totalValue || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Value</div>
                      </CardContent>
                    </Card>
                    <Card className="border-border/30">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                          ₹{(vendor.outstandingBalance || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm text-muted-foreground">Outstanding</div>
                      </CardContent>
                    </Card>
                    <Card className="border-border/30">
                      <CardContent className="p-4">
                        <div className="text-sm font-medium text-muted-foreground">Last Order</div>
                        <div className="text-sm font-semibold">
                          {vendor.lastOrderDate ? new Date(vendor.lastOrderDate).toLocaleDateString() : 'No orders'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Notes */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-lg font-semibold">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!isEditMode}
                  className="text-sm resize-none"
                  placeholder="Enter any additional notes about this vendor..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernInventoryOverlay>
  );
};