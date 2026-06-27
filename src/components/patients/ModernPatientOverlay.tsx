import { useState, useEffect, useRef } from 'react';
import { X, Save, User, Phone, Mail, MapPin, Heart, Calendar, Activity, FileText, AlertCircle, Barcode, Edit3, Stethoscope, Building2, Droplets, Search } from 'lucide-react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Card removed — using tinted section headers pattern
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { Patient } from '@/services/patientService';
import { fetchDoctors, Doctor } from '@/services/doctorService';
import { fetchDepartmentNames } from '@/services/departmentService';
import { DatePicker } from '@/components/ui/date-picker';

const toDate = (s: string): Date | undefined => s ? new Date(s + 'T00:00:00') : undefined;
const fromDate = (d: Date | undefined): string => d ? d.toISOString().split('T')[0] : '';
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

// ─── View-mode detail row ─────────────────────────────────────────────────────
const DetailRow = ({ label, value, index }: { label: string; value: React.ReactNode; index: number }) => (
  <div className={`flex items-center justify-between px-4 py-2.5 ${index % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
    <span className="text-xs text-muted-foreground font-medium">{label}</span>
    <span className="text-sm font-medium text-foreground text-right">{value || '—'}</span>
  </div>
);

export const ModernPatientOverlay = ({
  isOpen,
  onClose,
  patient,
  isEditMode = false,
  onSave
}: ModernPatientOverlayProps) => {
  // Determine mode: view (existing patient, not editing), edit (existing patient, editing), add (no patient)
  const isViewMode = !!patient && !isEditMode;
  const isAddMode = !patient && !isEditMode;
  const [internalEditMode, setInternalEditMode] = useState(false);
  const editing = isEditMode || internalEditMode || isAddMode;

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

  // Doctor auto-suggest state
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [showDoctorSuggestions, setShowDoctorSuggestions] = useState(false);
  const doctorRef = useRef<HTMLDivElement>(null);

  // Load doctors + departments on open
  useEffect(() => {
    if (!isOpen) return;
    fetchDoctors(1, 100)
      .then(result => {
        const list = Array.isArray(result) ? result : (result as any).data ?? [];
        setAvailableDoctors(list);
      })
      .catch(() => {});
    fetchDepartmentNames().then(setAvailableDepartments).catch(() => {});
  }, [isOpen]);

  // Close doctor suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (doctorRef.current && !doctorRef.current.contains(e.target as Node)) {
        setShowDoctorSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (patient) {
      setFormData(patient);
      setDoctorSearch(patient.doctor || '');
    } else {
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
        department: ''
      });
      setDoctorSearch('');
    }
    setInternalEditMode(false);
  }, [patient, isEditMode, isOpen]);

  const handleInputChange = (field: keyof Patient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.age || formData.age <= 0) newErrors.age = 'Valid age is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.doctor?.trim()) newErrors.doctor = 'Doctor name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields correctly.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      if (onSave) await onSave(formData as Patient);
      toast({ title: (isEditMode || internalEditMode) ? 'Patient Updated' : 'Patient Added', description: `${formData.name} has been successfully ${(isEditMode || internalEditMode) ? 'updated' : 'added'}.`, variant: 'success' });
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save patient. Please try again.', variant: 'destructive' });
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

  // ─────────────────────────────────────────────────── VIEW MODE ───────────────
  if (isViewMode && !internalEditMode) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          className="w-full sm:w-[90vw] sm:max-w-[680px] p-0 flex flex-col h-full bg-gradient-to-br from-background to-muted/20"
          side="right"
        >
          {/* Header — title + subtitle + close only; CTAs are in the footer */}
          <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-foreground tracking-tight leading-tight break-words">{patient.name}</h1>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{patient.patientId} · {patient.department || 'General Medicine'}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* View Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Stat cards row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{patient.age || '—'}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Age</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-2xl font-bold text-primary">{patient.bloodGroup || '—'}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Blood Group</p>
              </div>
            </div>

            {/* Personal Details */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Personal Details</span>
              </div>
              <DetailRow label="Full Name" value={patient.name} index={0} />
              <DetailRow label="Patient ID" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{patient.patientId}</code>} index={1} />
              <DetailRow label="Age" value={patient.age} index={2} />
              <DetailRow label="Gender" value={patient.gender} index={3} />
              <DetailRow label="Blood Group" value={
                patient.bloodGroup ? <Badge variant="outline" className="text-[10px] border-red-200 text-red-700 bg-red-50">
                  <Droplets className="h-3 w-3 mr-1" />{patient.bloodGroup}
                </Badge> : '—'
              } index={4} />
              <DetailRow label="Status" value={
                patient.status ? <Badge variant="outline" className={`${statusColors[patient.status as keyof typeof statusColors]} text-[10px]`}>
                  {patient.status}
                </Badge> : '—'
              } index={5} />
            </div>

            {/* Contact Information */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Contact Information</span>
              </div>
              <DetailRow label="Phone" value={patient.phone} index={0} />
              <DetailRow label="Email" value={patient.email} index={1} />
              <DetailRow label="Address" value={patient.address} index={2} />
            </div>

            {/* Medical Information */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Medical Information</span>
              </div>
              <DetailRow label="Department" value={patient.department} index={0} />
              <DetailRow label="Doctor" value={patient.doctor} index={1} />
              <DetailRow label="Last Visit" value={patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : '—'} index={2} />
            </div>

            {/* Tracking Codes — view */}
            {(patient.barcode || patient.qrCode || patient.rfidTag) && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                  <Barcode className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Tracking & Identification</span>
                </div>
                {patient.barcode && <DetailRow label="Barcode" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{patient.barcode}</code>} index={0} />}
                {patient.qrCode && <DetailRow label="QR Code" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{patient.qrCode}</code>} index={1} />}
                {patient.rfidTag && <DetailRow label="RFID Tag" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{patient.rfidTag}</code>} index={2} />}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-border/50 px-5 py-3 bg-background/95 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setInternalEditMode(true)} className="gap-1.5">
              <Edit3 className="h-3.5 w-3.5" /> Edit Patient
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // ─────────────────────────────────────────────────── EDIT / ADD MODE ─────────
  return (
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
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-foreground tracking-tight truncate">
                  {isAddMode ? 'Add New Patient' : 'Edit Patient'}
                </h1>
                {formData.patientId && (
                  <p className="text-xs text-muted-foreground font-medium">
                    {formData.patientId}
                    {formData.status && (
                      <Badge variant="outline" className={`${statusColors[formData.status as keyof typeof statusColors]} text-[10px] ml-2`}>
                        {formData.status}
                      </Badge>
                    )}
                  </p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Personal Information */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Personal Information</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="patientId" className="text-xs font-medium text-muted-foreground">Patient ID</Label>
                  <Input id="patientId" value={formData.patientId} disabled className="bg-muted/50 h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className={`h-9 text-sm ${errors.name ? 'border-destructive' : ''}`}
                  />
                  {errors.name && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-xs font-medium text-muted-foreground">
                    Age <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    placeholder="Age"
                    className={`h-9 text-sm ${errors.age ? 'border-destructive' : ''}`}
                  />
                  {errors.age && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.age}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-medium text-muted-foreground">Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      {genderOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bloodGroup" className="text-xs font-medium text-muted-foreground">Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(v) => handleInputChange('bloodGroup', v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select blood group" /></SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(s => (
                        <SelectItem key={s} value={s}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              s === 'Active' ? 'bg-green-500' : s === 'Admitted' ? 'bg-yellow-500' : s === 'Discharged' ? 'bg-blue-500' : 'bg-red-500'
                            }`} />
                            {s}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Contact Information</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91-XXXXXXXXXX"
                    className={`h-9 text-sm ${errors.phone ? 'border-destructive' : ''}`}
                  />
                  {errors.phone && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.phone}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className={`h-9 text-sm ${errors.email ? 'border-destructive' : ''}`}
                  />
                  {errors.email && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                  rows={2}
                  className={`text-sm resize-none ${errors.address ? 'border-destructive' : ''}`}
                />
                {errors.address && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Stethoscope className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Medical Information</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="department" className="text-xs font-medium text-muted-foreground">Department</Label>
                  <Select value={formData.department || ''} onValueChange={(v) => handleInputChange('department', v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {availableDepartments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5" ref={doctorRef}>
                  <Label htmlFor="doctor" className="text-xs font-medium text-muted-foreground">
                    Doctor <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      id="doctor"
                      value={doctorSearch}
                      onChange={(e) => {
                        setDoctorSearch(e.target.value);
                        handleInputChange('doctor', e.target.value);
                        setShowDoctorSuggestions(true);
                      }}
                      onFocus={() => setShowDoctorSuggestions(true)}
                      placeholder="Search doctor name…"
                      className={`h-9 text-sm pl-8 ${errors.doctor ? 'border-destructive' : ''}`}
                    />
                    {showDoctorSuggestions && doctorSearch.length >= 1 && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {availableDoctors
                          .filter(d => d.name.toLowerCase().includes(doctorSearch.toLowerCase()) || d.department?.toLowerCase().includes(doctorSearch.toLowerCase()))
                          .slice(0, 10)
                          .map(d => (
                            <button
                              key={d.id}
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center gap-2"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setDoctorSearch(d.name);
                                handleInputChange('doctor', d.name);
                                if (d.department) handleInputChange('department', d.department);
                                setShowDoctorSuggestions(false);
                              }}
                            >
                              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{d.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{[d.department, d.specialisation].filter(Boolean).join(' · ')}</p>
                              </div>
                            </button>
                          ))}
                        {availableDoctors.filter(d => d.name.toLowerCase().includes(doctorSearch.toLowerCase())).length === 0 && (
                          <p className="text-xs text-muted-foreground px-3 py-2">No doctors found</p>
                        )}
                      </div>
                    )}
                  </div>
                  {errors.doctor && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.doctor}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastVisit" className="text-xs font-medium text-muted-foreground">Last Visit</Label>
                  <DatePicker
                    date={toDate(formData.lastVisit)}
                    onDateChange={d => handleInputChange('lastVisit', fromDate(d))}
                    placeholder="Select last visit date"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Patient Tracking */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Barcode className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Tracking & Identification</span>
            </div>
            <div className="p-4">
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
            </div>
          </div>

          {/* HIPAA Notice */}
          <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-3 flex gap-3">
            <FileText className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">Patient Information</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                All patient information is confidential and will be stored securely in accordance with HIPAA regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border/50 px-5 py-3 bg-background/95 flex items-center justify-between">
          <div>
            {internalEditMode && (
              <Button variant="ghost" size="sm" onClick={() => setInternalEditMode(false)} className="text-xs text-muted-foreground">
                Cancel Edit
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 px-3 text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 px-4 text-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {isSaving ? 'Saving...' : isAddMode ? 'Add Patient' : 'Update Patient'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ModernPatientOverlay;
