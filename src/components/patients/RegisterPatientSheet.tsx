import React, { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  User, Phone, MapPin, Droplets, HeartPulse, ShieldCheck,
  X, UserPlus,
} from 'lucide-react';
import * as patientService from '@/services/patientService';
import { toast } from '@/hooks/use-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toDate = (s: string): Date | undefined => (s ? new Date(s + 'T00:00:00') : undefined);
const fromDate = (d: Date | undefined): string => (d ? d.toISOString().split('T')[0] : '');

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({
  label, required, children, error,
}: {
  label: string; required?: boolean; children: React.ReactNode; error?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold text-foreground">
      {label}{required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    {error && <p className="text-[11px] text-destructive">{error}</p>}
  </div>
);

// ─── Section card ─────────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children }: {
  title: string; icon?: React.ElementType; children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
      {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
      <p className="text-xs font-bold text-primary uppercase tracking-wider">{title}</p>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// ─── Form state ───────────────────────────────────────────────────────────────
interface RegisterForm {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string;
  existingConditions: string;
  insuranceCompany: string;
  policyNumber: string;
}

const INITIAL: RegisterForm = {
  firstName: '', lastName: '', dob: '', gender: '',
  phone: '', email: '', bloodGroup: '', address: '',
  emergencyContactName: '', emergencyContactPhone: '',
  allergies: '', existingConditions: '',
  insuranceCompany: '', policyNumber: '',
};

type Errors = Partial<Record<keyof RegisterForm, string>>;

function validate(form: RegisterForm): Errors {
  const e: Errors = {};
  if (!form.firstName.trim())  e.firstName  = 'First name is required';
  if (!form.lastName.trim())   e.lastName   = 'Last name is required';
  if (!form.dob)               e.dob        = 'Date of birth is required';
  if (!form.gender)            e.gender     = 'Gender is required';
  if (!form.phone.trim())      e.phone      = 'Phone number is required';
  return e;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface RegisterPatientSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (patient: patientService.Patient) => void;
}

export const RegisterPatientSheet = ({ isOpen, onClose, onRegistered }: RegisterPatientSheetProps) => {
  const [form, setForm] = useState<RegisterForm>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof RegisterForm>(key: K, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleClose = () => {
    setForm(INITIAL);
    setErrors({});
    onClose();
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const created = await patientService.createPatient({
        patientId: '',
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        dob: form.dob,
        age: 0,
        gender: form.gender,
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        bloodGroup: form.bloodGroup,
        emergencyContactName: form.emergencyContactName.trim(),
        emergencyContactPhone: form.emergencyContactPhone.trim(),
        allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        existingConditions: form.existingConditions ? form.existingConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
        lastVisit: '',
        status: 'Registered' as any,
        doctor: '',
        department: '',
      });

      toast({
        title: 'Patient Registered',
        description: `${form.firstName} ${form.lastName} has been added to the system.`,
        variant: 'success',
      });
      onRegistered(created);
      handleClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to register patient. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) handleClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:w-[85vw] sm:max-w-[720px] p-0 flex flex-col h-full bg-background"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-3.5 w-3.5 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">Add Patient</h2>
            </div>
            <p className="text-xs text-muted-foreground ml-9.5">
              Register a patient master record — no admission required
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Personal Details */}
          <Section title="Personal Details" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" required error={errors.firstName}>
                <Input
                  value={form.firstName}
                  onChange={e => update('firstName', e.target.value)}
                  placeholder="John"
                  className={`h-9 text-sm ${errors.firstName ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                />
              </Field>
              <Field label="Last Name" required error={errors.lastName}>
                <Input
                  value={form.lastName}
                  onChange={e => update('lastName', e.target.value)}
                  placeholder="Doe"
                  className={`h-9 text-sm ${errors.lastName ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                />
              </Field>
              <Field label="Date of Birth" required error={errors.dob}>
                <DatePicker
                  date={toDate(form.dob)}
                  onDateChange={d => update('dob', fromDate(d))}
                  placeholder="Select date"
                />
              </Field>
              <Field label="Gender" required error={errors.gender}>
                <Select value={form.gender} onValueChange={v => update('gender', v)}>
                  <SelectTrigger className={`h-9 text-sm ${errors.gender ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Phone" required error={errors.phone}>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`pl-9 h-9 text-sm ${errors.phone ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                  />
                </div>
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="patient@email.com"
                  className="h-9 text-sm"
                />
              </Field>
              <Field label="Blood Group">
                <div className="relative">
                  <Droplets className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Select value={form.bloodGroup} onValueChange={v => update('bloodGroup', v)}>
                    <SelectTrigger className="pl-9 h-9 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Field>
              <Field label="Address">
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    value={form.address}
                    onChange={e => update('address', e.target.value)}
                    placeholder="Street, City, State"
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              </Field>
            </div>
          </Section>

          {/* Emergency Contact */}
          <Section title="Emergency Contact" icon={Phone}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Contact Name">
                <Input
                  value={form.emergencyContactName}
                  onChange={e => update('emergencyContactName', e.target.value)}
                  placeholder="Full name"
                  className="h-9 text-sm"
                />
              </Field>
              <Field label="Contact Phone">
                <Input
                  value={form.emergencyContactPhone}
                  onChange={e => update('emergencyContactPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="h-9 text-sm"
                />
              </Field>
            </div>
          </Section>

          {/* Medical History */}
          <Section title="Medical History" icon={HeartPulse}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Known Allergies">
                <Input
                  value={form.allergies}
                  onChange={e => update('allergies', e.target.value)}
                  placeholder="Penicillin, Aspirin… (comma-separated)"
                  className="h-9 text-sm"
                />
              </Field>
              <Field label="Existing Conditions">
                <Input
                  value={form.existingConditions}
                  onChange={e => update('existingConditions', e.target.value)}
                  placeholder="Diabetes, Hypertension… (comma-separated)"
                  className="h-9 text-sm"
                />
              </Field>
            </div>
          </Section>

          {/* Insurance */}
          <Section title="Insurance" icon={ShieldCheck}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Insurance Company">
                <Input
                  value={form.insuranceCompany}
                  onChange={e => update('insuranceCompany', e.target.value)}
                  placeholder="Star Health, HDFC Ergo…"
                  className="h-9 text-sm"
                />
              </Field>
              <Field label="Policy Number">
                <Input
                  value={form.policyNumber}
                  onChange={e => update('policyNumber', e.target.value)}
                  placeholder="POL-XXXXXXXXXX"
                  className="h-9 text-sm"
                />
              </Field>
            </div>
          </Section>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card/50 flex-shrink-0">
          <Button variant="outline" onClick={handleClose} className="gap-1.5 min-w-20">
            <X className="h-3.5 w-3.5" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitting} className="min-w-40 gap-2">
            {submitting
              ? <><div className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Saving…</>
              : <><UserPlus className="h-3.5 w-3.5" /> Register Patient</>
            }
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
