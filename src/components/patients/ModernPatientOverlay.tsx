import { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, MapPin, Heart, Calendar, Activity, FileText, AlertCircle, Barcode } from 'lucide-react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Patient } from '@/services/patientService';
import { BarcodeQRManager } from '../inventory/BarcodeQRManager';

interface ModernPatientOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  isEditMode?: boolean;
  onSave?: (patient: Patient) => void;
}

const statusColors = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Admitted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Discharged: 'bg-blue-100 text-blue-800 border-blue-200',
  Critical: 'bg-red-100 text-red-800 border-red-200'
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genderOptions = ['Male', 'Female', 'Other'];
const statusOptions = ['Active', 'Admitted', 'Discharged', 'Critical'];

const departments = [
  'Cardiology',
  'Orthopedics',
  'Emergency',
  'General Medicine',
  'ICU',
  'Pediatrics',
  'Neurology',
  'Oncology',
  'Surgery',
  'Gynecology'
];

export const ModernPatientOverlay = ({
  isOpen,
  onClose,
  patient,
  isEditMode = false,
  onSave
}: ModernPatientOverlayProps) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    patientId: '',
    name: '',
    age: 0,
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    lastVisit: new Date().toISOString().split('T')[0],
    status: 'Active',
    doctor: '',
    department: 'General Medicine'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (patient && isEditMode) {
      setFormData(patient);
    } else if (!isEditMode) {
      // Generate new patient ID
      const newPatientId = `P${String(Math.floor(Math.random() * 9000) + 1000).padStart(3, '0')}`;
      setFormData({
        patientId: newPatientId,
        name: '',
        age: 0,
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        bloodGroup: 'O+',
        lastVisit: new Date().toISOString().split('T')[0],
        status: 'Active',
        doctor: '',
        department: 'General Medicine'
      });
    }
  }, [patient, isEditMode, isOpen]);

  const handleInputChange = (field: keyof Patient, value: any) => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.age || formData.age <= 0) {
      newErrors.age = 'Valid age is required';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.doctor?.trim()) {
      newErrors.doctor = 'Doctor name is required';
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
      if (onSave) {
        await onSave(formData as Patient);
      }
      toast({
        title: isEditMode ? "Patient Updated" : "Patient Added",
        description: `${formData.name} has been successfully ${isEditMode ? 'updated' : 'added'}.`,
      });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save patient. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTrackingCodeUpdate = (data: {
    barcode?: string;
    barcodeType?: string;
    qrCode?: string;
    rfidTag?: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      ...data,
      trackingEnabled: !!(data.barcode || data.qrCode || data.rfidTag)
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        className="w-full sm:w-[90vw] sm:max-w-[1000px] p-0 flex flex-col h-full bg-gradient-to-br from-background to-muted/20"
        side="right"
      >
        {/* Modern Header */}
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 p-3 sm:p-6">
          <div className="flex items-start justify-between mb-2 sm:mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <User className="h-6 w-6 text-primary" />
                <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight truncate">
                  {isEditMode ? 'Edit Patient' : 'Add New Patient'}
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
              {isEditMode && formData.patientId && (
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                  Patient ID: {formData.patientId}
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
          {/* Personal Information Section */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient ID - Read only for new patients, disabled for edit */}
                <div className="space-y-2">
                  <Label htmlFor="patientId" className="text-sm font-medium">
                    Patient ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="patientId"
                    value={formData.patientId}
                    disabled
                    className="bg-muted/50"
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-medium">
                    Age <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    placeholder="Enter age"
                    className={errors.age ? 'border-destructive' : ''}
                  />
                  {errors.age && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.age}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Blood Group */}
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup" className="text-sm font-medium">
                    Blood Group <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                    <SelectTrigger id="bloodGroup">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              status === 'Active' ? 'bg-green-500' :
                              status === 'Admitted' ? 'bg-yellow-500' :
                              status === 'Discharged' ? 'bg-blue-500' :
                              'bg-red-500'
                            }`} />
                            {status}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Section */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@example.com"
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Address - Full Width */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter full address"
                      rows={3}
                      className={`pl-10 ${errors.address ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information Section */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                {/* Last Visit */}
                <div className="space-y-2">
                  <Label htmlFor="lastVisit" className="text-sm font-medium">
                    Last Visit Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastVisit"
                      type="date"
                      value={formData.lastVisit}
                      onChange={(e) => handleInputChange('lastVisit', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Tracking Codes Section */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Barcode className="h-5 w-5 text-primary" />
                Patient Tracking & Identification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarcodeQRManager
                itemId={formData.id || 'new-patient'}
                itemName={formData.name || 'New Patient'}
                sku={formData.patientId || ''}
                barcode={formData.barcode}
                barcodeType={formData.barcodeType}
                qrCode={formData.qrCode}
                rfidTag={formData.rfidTag}
                onUpdate={handleTrackingCodeUpdate}
                disabled={false}
              />
            </CardContent>
          </Card>

          {/* Information Notice */}
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Patient Information
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    All patient information is confidential and will be stored securely in accordance with HIPAA regulations.
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

export default ModernPatientOverlay;
