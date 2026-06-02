import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User, BedDouble, Stethoscope, ShieldCheck, ClipboardCheck,
  ChevronRight, ChevronLeft, Check, Search, AlertTriangle, X,
} from 'lucide-react';
import * as roomService from '@/services/roomService';
import { Room } from '@/services/roomService';
import * as doctorService from '@/services/doctorService';
import { Doctor } from '@/services/doctorService';
import * as patientService from '@/services/patientService';
import * as admissionService from '@/services/admissionService';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';

// ─── Date helpers ─────────────────────────────────────────────────────────────

const toDate = (s: string): Date | undefined => s ? new Date(s + 'T00:00:00') : undefined;
const fromDate = (d: Date | undefined): string => d ? d.toISOString().split('T')[0] : '';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdmissionForm {
  firstName: string; lastName: string; dob: string; gender: string;
  phone: string; email: string; address: string;
  emergencyContact: string; emergencyPhone: string;
  bloodGroup: string; allergies: string; existingConditions: string;
  selectedRoomId: string; admissionDate: string; expectedDischarge: string; admissionType: string;
  selectedDoctor: string; department: string; admissionReason: string; notes: string;
  paymentMode: string; insuranceProvider: string; insurancePolicyNo: string;
  insuranceValidity: string; corporateAccount: string;
}

const INITIAL_FORM: AdmissionForm = {
  firstName: '', lastName: '', dob: '', gender: '', phone: '', email: '',
  address: '', emergencyContact: '', emergencyPhone: '', bloodGroup: '',
  allergies: '', existingConditions: '',
  selectedRoomId: '', admissionDate: new Date().toISOString().split('T')[0],
  expectedDischarge: '', admissionType: 'Planned',
  selectedDoctor: '', department: '', admissionReason: '', notes: '',
  paymentMode: '', insuranceProvider: '', insurancePolicyNo: '',
  insuranceValidity: '', corporateAccount: '',
};

// ─── Existing Patients (for returning patient lookup) ─────────────────────────

interface ExistingPatient {
  id: string; name: string; phone: string; dob: string;
  gender: string; bloodGroup: string; address: string;
  emergencyContact: string; emergencyPhone: string;
  allergies: string; existingConditions: string;
}

function mapRawToExistingPatient(p: any): ExistingPatient {
  return {
    id: p._id || p.id || '',
    name: [p.first_name, p.last_name].filter(Boolean).join(' '),
    phone: p.phone || '',
    dob: p.dob || '',
    gender: p.gender || '',
    bloodGroup: p.blood_group || '',
    address: p.address || '',
    emergencyContact: p.emergency_contact_name || p.emergency_contact || '',
    emergencyPhone: p.emergency_contact_phone || p.emergency_phone || '',
    allergies: Array.isArray(p.allergies) ? p.allergies.join(', ') : (p.allergies || ''),
    existingConditions: Array.isArray(p.existing_conditions) ? p.existing_conditions.join(', ') : (p.existing_conditions || p.medical_history || ''),
  };
}

// ─── Existing Patient Auto-suggest ───────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Registration', icon: User },
  { id: 2, label: 'Room', icon: BedDouble },
  { id: 3, label: 'Doctor', icon: Stethoscope },
  { id: 4, label: 'Insurance', icon: ShieldCheck },
  { id: 5, label: 'Confirm', icon: ClipboardCheck },
];

const STEP_META: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Patient Registration', subtitle: 'Enter personal and emergency contact details' },
  2: { title: 'Room Booking', subtitle: 'Select ward, bed type, and admission dates' },
  3: { title: 'Doctor Assignment', subtitle: 'Assign attending physician and clinical notes' },
  4: { title: 'Insurance & Payment', subtitle: 'Set up billing and insurance details' },
  5: { title: 'Review & Confirm', subtitle: 'Verify all details before confirming admission' },
};

const ROOM_TYPE_COLOR: Record<string, string> = {
  General: 'bg-blue-100 text-blue-700',
  'Semi-Private': 'bg-purple-100 text-purple-700',
  Private: 'bg-green-100 text-green-700',
  ICU: 'bg-red-100 text-red-700',
  Deluxe: 'bg-amber-100 text-amber-700',
  Suite: 'bg-pink-100 text-pink-700',
};

// ─── Shared Field wrapper ─────────────────────────────────────────────────────

const Field = ({
  label, required, children, hint, id,
}: { label: string; required?: boolean; children: React.ReactNode; hint?: string; id?: string }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs font-semibold text-foreground">
      {label}{required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

// ─── Section divider ──────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pt-1 pb-0.5">{children}</p>
);

// ─── Stepper header ───────────────────────────────────────────────────────────

const StepperHeader = ({ current }: { current: number }) => (
  <div className="flex items-center justify-between">
    {STEPS.map((step, idx) => {
      const done = current > step.id;
      const active = current === step.id;
      const Icon = step.icon;
      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              done ? 'bg-primary text-primary-foreground' :
              active ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
              'bg-muted text-muted-foreground'
            }`}>
              {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
            </div>
            <span className={`text-[10px] font-semibold hidden sm:block leading-none ${
              active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-3 sm:mb-0 transition-all ${done ? 'bg-primary' : 'bg-border'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Step 1: Patient Registration ────────────────────────────────────────────

const StepRegistration = ({ form, update }: { form: AdmissionForm; update: (k: keyof AdmissionForm, v: string) => void }) => {
  const [allPatients, setAllPatients] = useState<ExistingPatient[]>([]);
  const [suggestions, setSuggestions] = useState<ExistingPatient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchedPatient, setMatchedPatient] = useState<ExistingPatient | null>(null);
  const [loadExisting, setLoadExisting] = useState(false);

  useEffect(() => {
    apiClient.get('/patients', { params: { limit: 500 } })
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setAllPatients(raw.map(mapRawToExistingPatient));
      })
      .catch(() => {});
  }, []);

  const handleFirstNameChange = (value: string) => {
    update('firstName', value);
    if (matchedPatient && value !== matchedPatient.name.split(' ')[0]) {
      setMatchedPatient(null);
      setLoadExisting(false);
    }
    if (value.trim().length >= 2) {
      const matches = allPatients.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.phone.includes(value)
      );
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectPatient = (p: ExistingPatient) => {
    const [first] = p.name.split(' ');
    update('firstName', first);
    setMatchedPatient(p);
    setShowSuggestions(false);
    setLoadExisting(false);
  };

  const applyExisting = (on: boolean) => {
    setLoadExisting(on);
    if (!matchedPatient) return;
    const [, ...rest] = matchedPatient.name.split(' ');
    if (on) {
      update('lastName', rest.join(' '));
      update('phone', matchedPatient.phone);
      update('dob', matchedPatient.dob);
      update('gender', matchedPatient.gender);
      update('bloodGroup', matchedPatient.bloodGroup);
      update('address', matchedPatient.address);
      update('emergencyContact', matchedPatient.emergencyContact);
      update('emergencyPhone', matchedPatient.emergencyPhone);
      update('allergies', matchedPatient.allergies);
      update('existingConditions', matchedPatient.existingConditions);
    } else {
      update('lastName', '');
      update('phone', '');
      update('dob', '');
      update('gender', '');
      update('bloodGroup', '');
      update('address', '');
      update('emergencyContact', '');
      update('emergencyPhone', '');
      update('allergies', '');
      update('existingConditions', '');
    }
  };

  return (
  <div className="space-y-5">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
      {/* First Name with inline autosuggest */}
      <Field label="First Name" required id="firstName">
        <div className="relative">
          <Input
            id="firstName"
            value={form.firstName}
            onChange={e => handleFirstNameChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="John"
            autoComplete="off"
          />
          {showSuggestions && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
              {suggestions.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-muted/60 cursor-pointer border-b border-border/40 last:border-b-0 transition-colors"
                  onMouseDown={e => { e.preventDefault(); selectPatient(p); }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.phone} · {p.dob} · {p.bloodGroup}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">{p.id}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </Field>
      <Field label="Last Name" required id="lastName">
        <Input id="lastName" value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Doe" />
      </Field>
      <Field label="Date of Birth" required id="dob">
        <DatePicker
          date={toDate(form.dob)}
          onDateChange={d => update('dob', fromDate(d))}
          placeholder="Select date of birth"
        />
      </Field>
      <Field label="Gender" required id="gender">
        <Select value={form.gender} onValueChange={v => update('gender', v)}>
          <SelectTrigger id="gender" className="h-9 text-sm">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Phone" required id="phone">
        <Input id="phone" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 98765 43210" />
      </Field>
      <Field label="Email" id="email">
        <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="patient@email.com" />
      </Field>
      <Field label="Blood Group" id="bloodGroup">
        <Select value={form.bloodGroup} onValueChange={v => update('bloodGroup', v)}>
          <SelectTrigger id="bloodGroup" className="h-9 text-sm">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Address" id="address">
        <Input id="address" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Street, City, State" />
      </Field>
    </div>

    {/* Returning patient banner — only shown after selecting from autosuggest */}
    {matchedPatient && (
      <div className="rounded-lg border border-primary/25 bg-primary/5 px-3.5 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">Existing patient found</p>
          <p className="text-[11px] text-foreground/70 mt-0.5 truncate">
            {matchedPatient.name} · {matchedPatient.phone} · {matchedPatient.id}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">Load previous details</span>
          <button
            onClick={() => applyExisting(!loadExisting)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${loadExisting ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${loadExisting ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    )}

    <div className="border-t border-border pt-4 space-y-3">
      <SectionLabel>Emergency Contact</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <Field label="Name" required id="emergencyContact">
          <Input id="emergencyContact" value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} placeholder="Contact name" />
        </Field>
        <Field label="Phone" required id="emergencyPhone">
          <Input id="emergencyPhone" value={form.emergencyPhone} onChange={e => update('emergencyPhone', e.target.value)} placeholder="+91 98765 43210" />
        </Field>
      </div>
    </div>

    <div className="border-t border-border pt-4 space-y-3">
      <SectionLabel>Medical History</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <Field label="Known Allergies" hint="Comma-separated" id="allergies">
          <Input id="allergies" value={form.allergies} onChange={e => update('allergies', e.target.value)} placeholder="Penicillin, Aspirin…" />
        </Field>
        <Field label="Existing Conditions" hint="Comma-separated" id="existingConditions">
          <Input id="existingConditions" value={form.existingConditions} onChange={e => update('existingConditions', e.target.value)} placeholder="Diabetes, Hypertension…" />
        </Field>
      </div>
    </div>
  </div>
  );
};

// ─── Step 2: Room Booking ─────────────────────────────────────────────────────

const StepRoomBooking = ({ form, update, rooms, loadingRooms }: {
  form: AdmissionForm; update: (k: keyof AdmissionForm, v: string) => void;
  rooms: Room[]; loadingRooms: boolean;
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = rooms.filter(r => {
    const matchSearch = !search || r.roomNumber.includes(search) || r.department.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || r.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
        <Field label="Admission Date" required id="admissionDate">
          <DatePicker
            date={toDate(form.admissionDate)}
            onDateChange={d => update('admissionDate', fromDate(d))}
            placeholder="Select admission date"
          />
        </Field>
        <Field label="Expected Discharge" id="expectedDischarge">
          <DatePicker
            date={toDate(form.expectedDischarge)}
            onDateChange={d => update('expectedDischarge', fromDate(d))}
            placeholder="Select discharge date"
          />
        </Field>
        <Field label="Admission Type" required id="admissionType">
          <Select value={form.admissionType} onValueChange={v => update('admissionType', v)}>
            <SelectTrigger id="admissionType" className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Planned">Planned / Elective</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
              <SelectItem value="Transfer">Transfer from another hospital</SelectItem>
              <SelectItem value="Day Care">Day Care</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <SectionLabel>Select Room</SectionLabel>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Room number or department…" className="pl-8 h-9 text-sm" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {['General', 'Semi-Private', 'Private', 'ICU', 'Deluxe', 'Suite'].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loadingRooms ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading rooms…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No rooms match your search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(room => {
              const selected = form.selectedRoomId === room.id;
              const avail = room.status === 'Available';
              return (
                <div
                  key={room.id}
                  onClick={() => avail && update('selectedRoomId', room.id)}
                  className={`rounded-lg border p-3 transition-all ${
                    selected ? 'border-primary bg-primary/5 shadow-sm' :
                    avail ? 'border-border bg-card hover:border-primary/40 hover:shadow-sm cursor-pointer' :
                    'border-border bg-muted/40 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-foreground">Room {room.roomNumber}</span>
                    <Badge className={`${ROOM_TYPE_COLOR[room.type] || 'bg-gray-100 text-gray-700'} border-0 text-[10px] pointer-events-none`}>
                      {room.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">{room.department} · Floor {room.floor}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">₹{room.dailyRate.toLocaleString()}/day</span>
                    <Badge className={`${avail ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-0 text-[10px] pointer-events-none`}>
                      {room.status}
                    </Badge>
                  </div>
                  {selected && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-primary font-semibold">
                      <Check className="h-3.5 w-3.5" /> Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Step 3: Doctor Assignment ────────────────────────────────────────────────

const StepDoctor = ({ form, update, doctors: allDoctors }: { form: AdmissionForm; update: (k: keyof AdmissionForm, v: string) => void; doctors: Doctor[] }) => {
  const [search, setSearch] = useState('');
  const doctors = allDoctors.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <Field label="Department" required id="department">
          <Select value={form.department} onValueChange={v => update('department', v)}>
            <SelectTrigger id="department" className="h-9 text-sm">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {['Cardiology', 'Orthopaedics', 'Neurology', 'General Medicine', 'Paediatrics', 'Oncology', 'Emergency'].map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Admission Reason" required id="admissionReason">
          <Input id="admissionReason" value={form.admissionReason} onChange={e => update('admissionReason', e.target.value)} placeholder="Chest pain, fracture, elective surgery…" />
        </Field>
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <SectionLabel>Select Attending Doctor</SectionLabel>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or department…" className="pl-8 h-9 text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {doctors.map(doc => {
            const selected = form.selectedDoctor === doc.id;
            const available = doc.status === 'Active';
            return (
              <div
                key={doc.id}
                onClick={() => available && update('selectedDoctor', doc.id)}
                className={`rounded-lg border p-3 transition-all flex items-center gap-3 ${
                  selected ? 'border-primary bg-primary/5 shadow-sm' :
                  available ? 'border-border bg-card hover:border-primary/40 cursor-pointer' :
                  'border-border bg-muted/40 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.specialisation || doc.department}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {selected && <Check className="h-4 w-4 text-primary" />}
                  <Badge className={`${available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-0 text-[10px] pointer-events-none`}>
                    {doc.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Field label="Clinical Notes" id="notes">
        <textarea
          id="notes"
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          rows={3}
          placeholder="Additional clinical notes for attending doctor…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 resize-none"
        />
      </Field>
    </div>
  );
};

// ─── Step 4: Insurance / Finance ──────────────────────────────────────────────

const StepInsurance = ({ form, update }: { form: AdmissionForm; update: (k: keyof AdmissionForm, v: string) => void }) => (
  <div className="space-y-5">
    <Field label="Payment Mode" required id="paymentMode">
      <Select value={form.paymentMode} onValueChange={v => update('paymentMode', v)}>
        <SelectTrigger id="paymentMode" className="h-9 text-sm">
          <SelectValue placeholder="Select payment mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Cash">Cash</SelectItem>
          <SelectItem value="Insurance">Health Insurance</SelectItem>
          <SelectItem value="Card">Card / UPI</SelectItem>
          <SelectItem value="Corporate">Corporate / Employer</SelectItem>
          <SelectItem value="Government">Government Scheme (PMJAY / State)</SelectItem>
        </SelectContent>
      </Select>
    </Field>

    {form.paymentMode === 'Insurance' && (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
        <SectionLabel>Insurance Details</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
          <Field label="Insurance Provider" required id="insuranceProvider">
            <Select value={form.insuranceProvider} onValueChange={v => update('insuranceProvider', v)}>
              <SelectTrigger id="insuranceProvider" className="h-9 text-sm">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {['Star Health', 'HDFC Ergo', 'Bajaj Allianz', 'ICICI Lombard', 'New India Assurance', 'United India', 'Other'].map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Policy Number" required id="insurancePolicyNo">
            <Input id="insurancePolicyNo" value={form.insurancePolicyNo} onChange={e => update('insurancePolicyNo', e.target.value)} placeholder="POL-XXXXXXXXXX" />
          </Field>
          <Field label="Policy Validity" id="insuranceValidity">
            <DatePicker
              date={toDate(form.insuranceValidity)}
              onDateChange={d => update('insuranceValidity', fromDate(d))}
              placeholder="Select expiry date"
            />
          </Field>
        </div>
      </div>
    )}

    {form.paymentMode === 'Corporate' && (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
        <SectionLabel>Corporate Account</SectionLabel>
        <Field label="Company / Account Name" required id="corporateAccount">
          <Input id="corporateAccount" value={form.corporateAccount} onChange={e => update('corporateAccount', e.target.value)} placeholder="Employer or corporate account" />
        </Field>
      </div>
    )}

    {(form.paymentMode === 'Cash' || form.paymentMode === 'Card') && (
      <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Self-pay patients will need to make an advance deposit at the billing counter before admission is confirmed.
        </p>
      </div>
    )}
  </div>
);

// ─── Step 5: Confirmation ─────────────────────────────────────────────────────

const StepConfirmation = ({ form, rooms, doctors }: { form: AdmissionForm; rooms: Room[]; doctors: Doctor[] }) => {
  const room = rooms.find(r => r.id === form.selectedRoomId);
  const doctor = doctors.find(d => d.id === form.selectedDoctor);

  const sections = [
    {
      title: 'Patient Details',
      rows: [
        ['Name', `${form.firstName} ${form.lastName}`],
        ['DOB / Gender', `${form.dob} · ${form.gender}`],
        ['Phone', form.phone],
        ['Blood Group', form.bloodGroup],
        ['Emergency Contact', `${form.emergencyContact} (${form.emergencyPhone})`],
        ['Allergies', form.allergies || 'None'],
        ['Existing Conditions', form.existingConditions || 'None'],
      ],
    },
    {
      title: 'Room & Admission',
      rows: [
        ['Room', room ? `Room ${room.roomNumber} — ${room.type} (${room.department})` : '—'],
        ['Rate', room ? `₹${room.dailyRate.toLocaleString()}/day` : '—'],
        ['Admission Date', form.admissionDate],
        ['Expected Discharge', form.expectedDischarge || 'TBD'],
        ['Admission Type', form.admissionType],
      ],
    },
    {
      title: 'Doctor & Clinical',
      rows: [
        ['Attending Doctor', doctor ? `${doctor.name} (${doctor.department})` : '—'],
        ['Reason', form.admissionReason],
        ['Notes', form.notes || 'None'],
      ],
    },
    {
      title: 'Payment',
      rows: [
        ['Mode', form.paymentMode],
        ...(form.paymentMode === 'Insurance' ? [['Provider', form.insuranceProvider], ['Policy No.', form.insurancePolicyNo]] : []),
        ...(form.paymentMode === 'Corporate' ? [['Account', form.corporateAccount]] : []),
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 flex items-start gap-3">
        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800 dark:text-green-200">Ready to admit</p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">Please review all details below before confirming admission.</p>
        </div>
      </div>
      {sections.map(sec => (
        <div key={sec.title} className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">{sec.title}</p>
          </div>
          <div className="divide-y divide-border">
            {sec.rows.filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex px-4 py-2 gap-4">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
                <span className="text-xs font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const PatientAdmission = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AdmissionForm>(INITIAL_FORM);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    roomService.fetchAvailableRooms()
      .then(r => setRooms(r))
      .catch(() => {})
      .finally(() => setLoadingRooms(false));
    doctorService.fetchDoctors()
      .then(d => setDoctors(d))
      .catch(() => {});
  }, []);

  const update = (key: keyof AdmissionForm, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.dob || !form.gender || !form.phone || !form.emergencyContact || !form.emergencyPhone) {
        toast({ title: 'Missing fields', description: 'Please fill all required fields in Patient Registration.', variant: 'destructive' });
        return false;
      }
    }
    if (step === 2 && !form.selectedRoomId) {
      toast({ title: 'No room selected', description: 'Please select an available room.', variant: 'destructive' });
      return false;
    }
    if (step === 3 && (!form.selectedDoctor || !form.admissionReason || !form.department)) {
      toast({ title: 'Missing fields', description: 'Please select a doctor and provide the admission reason.', variant: 'destructive' });
      return false;
    }
    if (step === 4 && !form.paymentMode) {
      toast({ title: 'Missing payment mode', description: 'Please select how the patient will pay.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(5, s + 1)); };
  const prev = () => setStep(s => Math.max(1, s - 1));

  const ADMISSION_TYPE_MAP: Record<string, admissionService.AdmissionType> = {
    Planned: 'planned', Emergency: 'emergency', Transfer: 'transfer', 'Day Care': 'day_care',
  };
  const PAYMENT_MODE_MAP: Record<string, admissionService.PaymentMode> = {
    Cash: 'cash', Insurance: 'insurance', Card: 'card', Corporate: 'corporate', Government: 'government',
  };

  const confirm = async () => {
    setSubmitting(true);
    try {
      // 1. Create patient record
      const newPatient = await patientService.createPatient({
        patientId: '',
        name: `${form.firstName} ${form.lastName}`,
        age: 0,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        address: form.address,
        bloodGroup: form.bloodGroup,
        lastVisit: '',
        status: 'Admitted',
        doctor: form.selectedDoctor,
        department: form.department,
      });

      // 2. Create admission record
      await admissionService.createAdmission({
        patientId: newPatient.id,
        roomId: form.selectedRoomId,
        doctorId: form.selectedDoctor,
        admissionDate: form.admissionDate,
        expectedDischargeDate: form.expectedDischarge || undefined,
        admissionType: ADMISSION_TYPE_MAP[form.admissionType] || 'planned',
        notes: form.notes || undefined,
        paymentMode: PAYMENT_MODE_MAP[form.paymentMode] as admissionService.PaymentMode | undefined,
        insuranceProvider: form.insuranceProvider || undefined,
        insurancePolicyNo: form.insurancePolicyNo || undefined,
        corporateAccount: form.corporateAccount || undefined,
      });

      toast({ title: 'Patient Admitted', description: `${form.firstName} ${form.lastName} has been successfully admitted.`, variant: 'success' });
      navigate('/patients');
    } catch {
      toast({ title: 'Error', description: 'Failed to complete admission. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] bg-background">
      {/* ── Static Header ── */}
      <div className="flex-shrink-0 border-b border-border bg-background px-4 sm:px-6 pt-4 pb-4 space-y-4">
        {/* Stepper */}
        <StepperHeader current={step} />
        {/* Step title + close */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-none mb-1">
              Step {step} of {STEPS.length}
            </p>
            <h2 className="text-sm font-semibold text-foreground leading-snug">
              {STEP_META[step].title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{STEP_META[step].subtitle}</p>
          </div>
          <button
            onClick={() => navigate('/patients')}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0 mt-0.5"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        {step === 1 && <StepRegistration form={form} update={update} />}
        {step === 2 && <StepRoomBooking form={form} update={update} rooms={rooms} loadingRooms={loadingRooms} />}
        {step === 3 && <StepDoctor form={form} update={update} doctors={doctors} />}
        {step === 4 && <StepInsurance form={form} update={update} />}
        {step === 5 && <StepConfirmation form={form} rooms={rooms} doctors={doctors} />}
      </div>

      {/* ── Static Footer ── */}
      <div className="flex-shrink-0 border-t border-border bg-background px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={prev} disabled={step === 1} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <span className="text-xs text-muted-foreground hidden sm:block">Step {step} of {STEPS.length}</span>
        {step < 5 ? (
          <Button size="sm" onClick={next} className="gap-1">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={confirm} disabled={submitting} className="min-w-36">
            {submitting ? 'Admitting…' : 'Confirm Admission'}
          </Button>
        )}
      </div>
    </div>
  );
};
