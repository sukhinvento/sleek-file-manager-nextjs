import { useState, useEffect } from 'react';
import { Save, Edit3, X, Building2, User, CreditCard, Package, Calendar, Phone, Mail, MapPin } from 'lucide-react';
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
  category: string;
  status: string;
  totalOrders?: number;
  lastOrderDate?: string;
  totalValue?: number;
  paymentTerms: string;
  taxId: string;
  website?: string;
  bankDetails?: string;
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

const statusColors = {
  'Active': 'delivered' as const,
  'Inactive': 'cancelled' as const,
  'Pending': 'pending' as const
};

const categories = [
  'Food & Beverages',
  'Medical Equipment',
  'Pharmaceuticals', 
  'Office Supplies',
  'Cleaning Supplies',
  'Electronics',
  'Furniture',
  'Textiles'
];

const paymentTerms = [
  'Net 15',
  'Net 30',
  'Net 45',
  'COD',
  'Advance'
];

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
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('Active');
  const [website, setWebsite] = useState<string>('');
  const [taxId, setTaxId] = useState<string>('');
  const [paymentTermsValue, setPaymentTermsValue] = useState<string>('Net 30');
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [bankDetails, setBankDetails] = useState<string>('');
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
      setCategory(vendor.category || '');
      setStatus(vendor.status || 'Active');
      setWebsite(vendor.website || '');
      setTaxId(vendor.taxId || '');
      setPaymentTermsValue(vendor.paymentTerms || 'Net 30');
      setCreditLimit(vendor.creditLimit || 0);
      setBankDetails(vendor.bankDetails || '');
      setNotes(vendor.notes || '');
    } else {
      setName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCategory('');
      setStatus('Active');
      setWebsite('');
      setTaxId('');
      setPaymentTermsValue('Net 30');
      setCreditLimit(0);
      setBankDetails('');
      setNotes('');
    }
    setIsEditMode(isEdit);
  }, [vendor, isEdit]);

  const handleSaveVendor = async () => {
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
        category,
        status,
        website,
        taxId,
        paymentTerms: paymentTermsValue,
        creditLimit,
        bankDetails,
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
        {/* Left Panel - Vendor Information */}
        <div className="w-80 border-r border-border/50 bg-background/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="vendor-name" className="text-xs">Vendor Name</Label>
                  <Input
                    id="vendor-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditMode}
                    className="h-8 text-sm"
                    placeholder="Enter vendor name"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-xs">Category</Label>
                  <Select value={category} onValueChange={setCategory} disabled={!isEditMode}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status" className="text-xs">Status</Label>
                  <Select value={status} onValueChange={setStatus} disabled={!isEditMode}>
                    <SelectTrigger className="h-8 text-sm">
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
                  <Label htmlFor="website" className="text-xs">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={!isEditMode}
                    className="h-8 text-sm"
                    placeholder="www.example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="tax-id" className="text-xs">Tax ID</Label>
                  <Input
                    id="tax-id"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    disabled={!isEditMode}
                    className="h-8 text-sm"
                    placeholder="Tax identification number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="contact-person" className="text-xs">Contact Person</Label>
                  <Input
                    id="contact-person"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    disabled={!isEditMode}
                    className="h-8 text-sm"
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditMode}
                    className="h-8 text-sm"
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditMode}
                    className="h-8 text-sm"
                    placeholder="contact@vendor.com"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-xs">Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={!isEditMode}
                    className="text-sm resize-none"
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Financial Information & Statistics */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6 space-y-6 overflow-y-auto">
            {/* Financial Information */}
            <Card className="border-border/50">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment-terms" className="text-sm">Payment Terms</Label>
                    <Select value={paymentTermsValue} onValueChange={setPaymentTermsValue} disabled={!isEditMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTerms.map(term => (
                          <SelectItem key={term} value={term}>{term} Days</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="credit-limit" className="text-sm">Credit Limit</Label>
                    <Input
                      id="credit-limit"
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                      disabled={!isEditMode}
                      placeholder="Enter credit limit"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="bank-details" className="text-sm">Bank Details</Label>
                    <Input
                      id="bank-details"
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      disabled={!isEditMode}
                      placeholder="Bank Name - Account Number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Statistics - Show only for existing vendors */}
            {vendor && (
              <Card className="border-border/50">
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
                        <div className="text-sm font-medium">Last Order</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {vendor.lastOrderDate || 'N/A'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Notes */}
            <Card className="border-border/50">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-lg font-semibold">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!isEditMode}
                  className="resize-none"
                  placeholder="Additional notes about the vendor..."
                  rows={6}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernInventoryOverlay>
  );
};