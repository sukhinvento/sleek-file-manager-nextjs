import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  User, BedDouble, Stethoscope, ShieldCheck, ClipboardCheck,
  ChevronRight, ChevronLeft, Check, Search, AlertTriangle, X,
  Phone, MapPin, Droplets, HeartPulse, CalendarDays, IndianRupee,
  CreditCard, Building2, Landmark, CircleAlert,
} from 'lucide-react';
import * as roomService from '@/services/roomService';
import { Room } from '@/services/roomService';
import * as doctorService from '@/services/doctorService';
import { Doctor } from '@/services/doctorService';
import * as patientService from '@/services/patientService';
import * as admissionService from '@/services/admissionService';
import { fetchDepartmentNames } from '@/services/departmentService';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toDate = (s: string): Date | undefined => s ? new Date(s + 'T00:00:00') : undefined;
const fromDate = (d: Date | undefined): string => d ? d.toISOString().split('T')[0] : '';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdmissionForm {
  // Patient
  firstName: string; lastName: string; dob: string; gender: string;
  phone: string; email: string; address: string;
  emergencyContact: string; emergencyPhone: string;
  bloodGroup: string; allergies: string; existingConditions: string;
  existingPatientId: string;
  // Room
  selectedRoomId: string; admissionDate: string; expectedDischarge: string; admissionType: string;
  // Doctor
  selectedDoctor: string; department: string; admissionReason: string; notes: string;
  // Payment
  paymentMode: string; insuranceProvider: string; insurancePolicyNo: string;
  insuranceValidity: string; corporateAccount: string;
}

const INITIAL: AdmissionForm = {
  firstName: '', lastName: '', dob: '', gender: '', phone: '', email: '',
  address: '', emergencyContact: '', emergencyPhone: '', bloodGroup: '',
  allergies: '', existingConditions: '', existingPatientId: '',
  selectedRoomId: '', admissionDate: new Date().toISOString().split('T')[0],
  expectedDischarge: '', admissionType: 'Planned',
  selectedDoctor: '', department: '', admissionReason: '', notes: '',
  paymentMode: '', insuranceProvider: '', insurancePolicyNo: '',
  insuranceValidity: '', corporateAccount: '',
};

interface ExistingPatient {
  id: string; name: string; phone: string; dob: string; gender: string;
  bloodGroup: string; address: string; emergencyContact: string; emergencyPhone: string;
  allergies: string; existingConditions: string;
}

function mapToExisting(p: any): ExistingPatient {
  return {
    id: p._id || p.id || '',
    name: [p.first_name, p.last_name].filter(Boolean).join(' '),
    phone: p.phone || '',
    dob: p.dob || '',
    gender: p.gender || '',
    bloodGroup: p.blood_group || '',
    address: p.address || '',
    emergencyContact: p.emergency_contact_name || '',
    emergencyPhone: p.emergency_contact_phone || '',
    allergies: Array.isArray(p.allergies) ? p.allergies.join(', ') : (p.allergies || ''),
    existingConditions: Array.isArray(p.existing_conditions) ? p.existing_conditions.join(', ') : (p.existing_conditions || ''),
  };
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Patient',   icon: User },
  { id: 2, label: 'Room',      icon: BedDouble },
  { id: 3, label: 'Doctor',    icon: Stethoscope },
  { id: 4, label: 'Payment',   icon: ShieldCheck },
  { id: 5, label: 'Confirm',   icon: ClipboardCheck },
];

const ROOM_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  general:      { bg: 'bg-blue-100',   text: 'text-blue-700' },
  semi_private: { bg: 'bg-violet-100', text: 'text-violet-700' },
  private:      { bg: 'bg-emerald-100',text: 'text-emerald-700' },
  icu:          { bg: 'bg-red-100',    text: 'text-red-700' },
  deluxe:       { bg: 'bg-amber-100',  text: 'text-amber-700' },
  suite:        { bg: 'bg-pink-100',   text: 'text-pink-700' },
};

const typeLabel = (t: string) =>
  t.replace('_', '-').replace(/\b\w/g, c => c.toUpperCase());

// ─── Shared field wrapper ──────────────────────────────────────────────────────
const Field = ({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold text-foreground">
      {label}{required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

// ─── Section card wrapper ──────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, overflowVisible }: {
  title: string; icon?: React.ElementType; children: React.ReactNode; overflowVisible?: boolean;
}) => (
  <div className={`rounded-xl border border-border bg-card ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}`}>
    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border rounded-t-xl">
      {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
      <p className="text-xs font-bold text-primary uppercase tracking-wider">{title}</p>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// ─── Stepper ──────────────────────────────────────────────────────────────────
const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center px-6 py-4 border-b border-border bg-muted/20">
    {STEPS.map((step, idx) => {
      const done = current > step.id;
      const active = current === step.id;
      const Icon = step.icon;
      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              done   ? 'bg-primary text-primary-foreground' :
              active ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                       'bg-muted text-muted-foreground border border-border'
            }`}>
              {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
            </div>
            <span className={`text-[10px] font-semibold hidden sm:block ${
              active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'
            }`}>{step.label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-0 sm:mb-4 transition-all ${done ? 'bg-primary' : 'bg-border'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Step 1: Patient ──────────────────────────────────────────────────────────
const StepPatient = ({ form, update }: {
  form: AdmissionForm; update: (k: keyof AdmissionForm, v: string) => void;
}) => {
  const [allPatients, setAllPatients] = useState<ExistingPatient[]>([]);
  const [suggestions, setSuggestions] = useState<ExistingPatient[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [loaded, setLoaded] = useState<ExistingPatient | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.get('/patients', { params: { limit: 500 } })
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setAllPatients(raw.map(mapToExisting));
      }).catch(() => {});
  }, []);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSugg(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (v: string) => {
    update('firstName', v);
    if (loaded && v !== loaded.name.split(' ')[0]) setLoaded(null);
    if (v.length >= 2) {
      const m = allPatients.filter(p =>
        p.name.toLowerCase().includes(v.toLowerCase()) || p.phone.includes(v)
      );
      setSuggestions(m);
      setShowSugg(m.length > 0);
    } else {
      setSuggestions([]);
      setShowSugg(false);
    }
  };

  const applyPatient = (p: ExistingPatient) => {
    const [first, ...rest] = p.name.split(' ');
    update('firstName', first);
    update('lastName', rest.join(' '));
    update('phone', p.phone);
    update('dob', p.dob);
    update('gender', p.gender);
    update('bloodGroup', p.bloodGroup);
    update('address', p.address);
    update('emergencyContact', p.emergencyContact);
    update('emergencyPhone', p.emergencyPhone);
    update('allergies', p.allergies);
    update('existingConditions', p.existingConditions);
    update('existingPatientId', p.id);
    setLoaded(p);
    setShowSugg(false);
  };

  const clearExisting = () => {
    setLoaded(null);
    update('existingPatientId', '');
  };

  return (
    <div className="space-y-4">
      {/* Existing patient lookup */}
      <Section title="Patient Lookup" icon={Search} overflowVisible>
        <div className="space-y-3" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={form.firstName}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSugg(true)}
              placeholder="Search by name or phone to load existing patient…"
              className="pl-9 h-9 text-sm"
              autoComplete="off"
            />
            {showSugg && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                {suggestions.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-muted/60 cursor-pointer border-b border-border/40 last:border-b-0 transition-colors"
                    onMouseDown={e => { e.preventDefault(); applyPatient(p); }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.phone} · {p.dob} · {p.bloodGroup || 'Blood N/A'}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">{p.id}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          {loaded && (
            <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-3.5 py-2.5">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary">Existing patient loaded</p>
                <p className="text-[11px] text-muted-foreground truncate">{loaded.name} · {loaded.id}</p>
              </div>
              <button onClick={clearExisting} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* Personal details */}
      <Section title="Personal Details" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" required>
            <Input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="John" className="h-9 text-sm" />
          </Field>
          <Field label="Last Name" required>
            <Input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Doe" className="h-9 text-sm" />
          </Field>
          <Field label="Date of Birth" required>
            <DatePicker date={toDate(form.dob)} onDateChange={d => update('dob', fromDate(d))} placeholder="Select date" />
          </Field>
          <Field label="Gender" required>
            <Select value={form.gender} onValueChange={v => update('gender', v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Phone" required>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 98765 43210" className="pl-9 h-9 text-sm" />
            </div>
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="patient@email.com" className="h-9 text-sm" />
          </Field>
          <Field label="Blood Group">
            <div className="relative">
              <Droplets className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Select value={form.bloodGroup} onValueChange={v => update('bloodGroup', v)}>
                <SelectTrigger className="pl-9 h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
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
              <Input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Street, City, State" className="pl-9 h-9 text-sm" />
            </div>
          </Field>
        </div>
      </Section>

      {/* Emergency contact */}
      <Section title="Emergency Contact" icon={Phone}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact Name">
            <Input value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} placeholder="Full name" className="h-9 text-sm" />
          </Field>
          <Field label="Contact Phone">
            <Input value={form.emergencyPhone} onChange={e => update('emergencyPhone', e.target.value)} placeholder="+91 98765 43210" className="h-9 text-sm" />
          </Field>
        </div>
      </Section>

      {/* Medical history */}
      <Section title="Medical History" icon={HeartPulse}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Known Allergies" hint="Comma-separated">
            <Input value={form.allergies} onChange={e => update('allergies', e.target.value)} placeholder="Penicillin, Aspirin…" className="h-9 text-sm" />
          </Field>
          <Field label="Existing Conditions" hint="Comma-separated">
            <Input value={form.existingConditions} onChange={e => update('existingConditions', e.target.value)} placeholder="Diabetes, Hypertension…" className="h-9 text-sm" />
          </Field>
        </div>
      </Section>
    </div>
  );
};

// ─── Step 2: Room ─────────────────────────────────────────────────────────────
const StepRoom = ({ form, update, rooms, loading }: {
  form: AdmissionForm; update: (k: keyof AdmissionForm, v: string) => void;
  rooms: Room[]; loading: boolean;
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = rooms.filter(r => {
    const matchSearch = !search ||
      r.roomNumber.includes(search) ||
      r.department?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const roomTypes = ['all', ...Array.from(new Set(rooms.map(r => r.type).filter(Boolean)))];

  return (
    <div className="space-y-4">
      <Section title="Admission Details" icon={CalendarDays}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Admission Date" required>
            <DatePicker date={toDate(form.admissionDate)} onDateChange={d => update('admissionDate', fromDate(d))} placeholder="Admission date" />
          </Field>
          <Field label="Expected Discharge">
            <DatePicker date={toDate(form.expectedDischarge)} onDateChange={d => update('expectedDischarge', fromDate(d))} placeholder="Expected date" />
          </Field>
          <Field label="Admission Type" required>
            <Select value={form.admissionType} onValueChange={v => update('admissionType', v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Planned">Planned / Elective</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
                <SelectItem value="Day Care">Day Care</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">Select Room</p>
          <span className="text-xs text-muted-foreground">{rooms.filter(r => r.status === 'Available').length} available</span>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Room number or department…" className="pl-8 h-8 text-xs" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {roomTypes.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                  typeFilter === t ? 'bg-primary text-white border-primary' : 'bg-transparent text-muted-foreground border-border'
                }`}>
                {t === 'all' ? 'All' : typeLabel(t)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <BedDouble className="h-8 w-8 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No rooms match your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(room => {
              const sel = form.selectedRoomId === room.id;
              const avail = room.status?.toLowerCase() === 'available';
              const colors = ROOM_TYPE_COLORS[room.type?.toLowerCase()] ?? { bg: 'bg-gray-100', text: 'text-gray-700' };
              return (
                <div
                  key={room.id}
                  onClick={() => avail && update('selectedRoomId', room.id)}
                  className={`rounded-xl border p-3.5 transition-all relative ${
                    sel    ? 'border-primary bg-primary/5 shadow-sm' :
                    avail  ? 'border-border bg-card hover:border-primary/40 hover:shadow-sm cursor-pointer' :
                             'border-border bg-muted/30 opacity-55 cursor-not-allowed'
                  }`}
                >
                  {sel && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                      <BedDouble className={`h-4.5 w-4.5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-foreground">Room {room.roomNumber}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                          {typeLabel(room.type)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{room.department || 'General'} · Floor {room.floor || '—'}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-foreground">
                          ₹{room.dailyRate?.toLocaleString('en-IN')}<span className="text-xs font-normal text-muted-foreground">/day</span>
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          avail ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {avail ? 'Available' : 'Occupied'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Step 3: Doctor ───────────────────────────────────────────────────────────
const StepDoctor = ({ form, update, doctors: allDoctors, departments: depts }: {
  form: AdmissionForm; update: (k: keyof AdmissionForm, v: string) => void;
  doctors: Doctor[]; departments: string[];
}) => {
  const [search, setSearch] = useState('');
  const filtered = allDoctors.filter(d =>
    (!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.department?.toLowerCase().includes(search.toLowerCase())) &&
    (!form.department || d.department === form.department)
  );

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
      <Section title="Clinical Details" icon={ClipboardCheck}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Department" required>
            <Select value={form.department} onValueChange={v => { update('department', v); update('selectedDoctor', ''); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {depts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Admission Reason" required>
            <Input value={form.admissionReason} onChange={e => update('admissionReason', e.target.value)} placeholder="Chest pain, fracture…" className="h-9 text-sm" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Clinical Notes">
            <textarea
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              rows={3}
              placeholder="Additional notes for the attending doctor…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none"
            />
          </Field>
        </div>
      </Section>

      <div className="space-y-3">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">Select Attending Doctor</p>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name…" className="pl-8 h-8 text-xs" />
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Stethoscope className="h-8 w-8 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">
              {form.department ? `No doctors in ${form.department}` : 'Select a department to filter doctors'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filtered.map(doc => {
              const sel = form.selectedDoctor === doc.id;
              const active = doc.status === 'Active';
              return (
                <div
                  key={doc.id}
                  onClick={() => active && update('selectedDoctor', doc.id)}
                  className={`rounded-xl border p-3.5 transition-all flex items-center gap-3 ${
                    sel    ? 'border-primary bg-primary/5 shadow-sm' :
                    active ? 'border-border bg-card hover:border-primary/40 cursor-pointer' :
                             'border-border bg-muted/30 opacity-55 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                    sel ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                  }`}>
                    {initials(doc.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{doc.specialisation || doc.department}</p>
                    {doc.consultationFee != null && doc.consultationFee > 0 && (
                      <p className="text-xs font-semibold text-primary mt-0.5">₹{doc.consultationFee.toLocaleString()}/visit</p>
                    )}
                  </div>
                  {sel && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                  {!active && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex-shrink-0">
                      Unavailable
                    </span>
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

// ─── Step 4: Payment ──────────────────────────────────────────────────────────
const PAYMENT_OPTIONS = [
  { value: 'cash',      label: 'Cash',      icon: IndianRupee },
  { value: 'insurance', label: 'Insurance', icon: ShieldCheck },
  { value: 'card',      label: 'Card / UPI',icon: CreditCard },
  { value: 'corporate', label: 'Corporate', icon: Building2 },
  { value: 'government',label: 'Govt Scheme',icon: Landmark },
];

const StepPayment = ({ form, update }: {
  form: AdmissionForm; update: (k: keyof AdmissionForm, v: string) => void;
}) => (
  <div className="space-y-4">
    <Section title="Payment Mode" icon={IndianRupee}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {PAYMENT_OPTIONS.map(opt => {
          const sel = form.paymentMode === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => update('paymentMode', opt.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all text-center ${
                sel ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${sel ? 'bg-primary' : 'bg-muted'}`}>
                <Icon className={`h-4 w-4 ${sel ? 'text-white' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-xs font-semibold ${sel ? 'text-primary' : 'text-foreground'}`}>{opt.label}</span>
              {sel && <div className="absolute top-2 right-2"><Check className="h-3 w-3 text-primary" /></div>}
            </button>
          );
        })}
      </div>
    </Section>

    {form.paymentMode === 'insurance' && (
      <Section title="Insurance Details" icon={ShieldCheck}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Provider" required>
            <Select value={form.insuranceProvider} onValueChange={v => update('insuranceProvider', v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select provider" /></SelectTrigger>
              <SelectContent>
                {['Star Health','HDFC Ergo','Bajaj Allianz','ICICI Lombard','New India Assurance','United India','Other'].map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Policy Number" required>
            <Input value={form.insurancePolicyNo} onChange={e => update('insurancePolicyNo', e.target.value)} placeholder="POL-XXXXXXXXXX" className="h-9 text-sm" />
          </Field>
          <Field label="Policy Validity">
            <DatePicker date={toDate(form.insuranceValidity)} onDateChange={d => update('insuranceValidity', fromDate(d))} placeholder="Expiry date" />
          </Field>
        </div>
      </Section>
    )}

    {form.paymentMode === 'corporate' && (
      <Section title="Corporate Account" icon={Building2}>
        <Field label="Company / Account Name" required>
          <Input value={form.corporateAccount} onChange={e => update('corporateAccount', e.target.value)} placeholder="Employer or corporate account" className="h-9 text-sm" />
        </Field>
      </Section>
    )}

    {(form.paymentMode === 'cash' || form.paymentMode === 'card') && (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
        <CircleAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          Self-pay patients must make an advance deposit at the billing counter before admission is confirmed.
        </p>
      </div>
    )}

    {!form.paymentMode && (
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3.5">
        <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">Select a payment mode above to continue.</p>
      </div>
    )}
  </div>
);

// ─── Step 5: Confirm ──────────────────────────────────────────────────────────
const StepConfirm = ({ form, rooms, doctors }: {
  form: AdmissionForm; rooms: Room[]; doctors: Doctor[];
}) => {
  const room = rooms.find(r => r.id === form.selectedRoomId);
  const doctor = doctors.find(d => d.id === form.selectedDoctor);
  const colors = room ? (ROOM_TYPE_COLORS[room.type?.toLowerCase()] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }) : null;

  const Row = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="flex gap-4 py-2 border-b border-border/50 last:border-0">
        <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{label}</span>
        <span className="text-xs font-medium text-foreground">{value}</span>
      </div>
    ) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3.5">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Check className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-green-800">Ready to admit</p>
          <p className="text-xs text-green-700 mt-0.5">Review all details below before confirming admission.</p>
        </div>
      </div>

      {/* Patient card */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{form.firstName} {form.lastName}</p>
            <p className="text-xs text-muted-foreground">{form.gender} · {form.dob} · {form.bloodGroup || 'Blood N/A'}</p>
          </div>
        </div>
        <div className="px-4 py-1">
          <Row label="Phone" value={form.phone} />
          <Row label="Address" value={form.address} />
          <Row label="Emergency Contact" value={form.emergencyContact ? `${form.emergencyContact} · ${form.emergencyPhone}` : undefined} />
          <Row label="Allergies" value={form.allergies || 'None'} />
          <Row label="Conditions" value={form.existingConditions || 'None'} />
        </div>
      </div>

      {/* Room card */}
      {room && colors && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg}`}>
              <BedDouble className={`h-4 w-4 ${colors.text}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Room {room.roomNumber} — {typeLabel(room.type)}</p>
              <p className="text-xs text-muted-foreground">{room.department} · Floor {room.floor}</p>
            </div>
            <span className="ml-auto text-sm font-bold text-foreground">₹{room.dailyRate?.toLocaleString()}/day</span>
          </div>
          <div className="px-4 py-1">
            <Row label="Admission Date" value={form.admissionDate} />
            <Row label="Expected Discharge" value={form.expectedDischarge || 'TBD'} />
            <Row label="Admission Type" value={form.admissionType} />
          </div>
        </div>
      )}

      {/* Doctor card */}
      {doctor && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
              {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{doctor.name}</p>
              <p className="text-xs text-muted-foreground">{doctor.specialisation || doctor.department}</p>
            </div>
          </div>
          <div className="px-4 py-1">
            <Row label="Department" value={form.department} />
            <Row label="Reason" value={form.admissionReason} />
            <Row label="Notes" value={form.notes || undefined} />
          </div>
        </div>
      )}

      {/* Payment card */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <IndianRupee className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground capitalize">{form.paymentMode || '—'}</p>
        </div>
        <div className="px-4 py-1">
          <Row label="Insurance Provider" value={form.insuranceProvider} />
          <Row label="Policy Number" value={form.insurancePolicyNo} />
          <Row label="Corporate Account" value={form.corporateAccount} />
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
interface AdmissionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmitted?: () => void;
}

const STEP_META = {
  1: { title: 'Patient Details',     subtitle: 'Enter or load existing patient information' },
  2: { title: 'Room Booking',        subtitle: 'Select bed type and admission dates' },
  3: { title: 'Doctor Assignment',   subtitle: 'Assign attending physician and clinical notes' },
  4: { title: 'Payment Setup',       subtitle: 'Configure billing and insurance' },
  5: { title: 'Review & Confirm',    subtitle: 'Verify all details before admitting' },
};

const ADMISSION_TYPE_MAP: Record<string, admissionService.AdmissionType> = {
  Planned: 'planned', Emergency: 'emergency', Transfer: 'transfer', 'Day Care': 'day_care',
};
const PAYMENT_MODE_MAP: Record<string, admissionService.PaymentMode> = {
  cash: 'cash', insurance: 'insurance', card: 'card', corporate: 'corporate', government: 'government',
};

export const AdmissionSheet = ({ isOpen, onClose, onAdmitted }: AdmissionSheetProps) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AdmissionForm>(INITIAL);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setForm(INITIAL);
    setLoadingRooms(true);
    roomService.fetchAvailableRooms()
      .then(r => setRooms(r))
      .catch(() => {})
      .finally(() => setLoadingRooms(false));
    doctorService.fetchDoctors(1, 100)
      .then(res => {
        const list = Array.isArray(res) ? res : (res as any).data ?? [];
        setDoctors(list);
      })
      .catch(() => {});
    fetchDepartmentNames().then(setDepartments).catch(() => {});
  }, [isOpen]);

  const update = (key: keyof AdmissionForm, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    if (step === 1) {
      const missing: string[] = [];
      if (!form.firstName?.trim()) missing.push('First Name');
      if (!form.lastName?.trim()) missing.push('Last Name');
      if (!form.dob) missing.push('Date of Birth');
      if (!form.gender) missing.push('Gender');
      if (!form.phone?.trim()) missing.push('Phone');
      if (missing.length > 0) {
        toast({ title: 'Missing required fields', description: missing.join(', '), variant: 'destructive' });
        return false;
      }
    }
    if (step === 2 && !form.selectedRoomId) {
      toast({ title: 'No room selected', description: 'Please select an available room.', variant: 'destructive' });
      return false;
    }
    if (step === 3 && (!form.selectedDoctor || !form.admissionReason || !form.department)) {
      toast({ title: 'Missing clinical details', description: 'Department, doctor, and admission reason are required.', variant: 'destructive' });
      return false;
    }
    if (step === 4 && !form.paymentMode) {
      toast({ title: 'No payment mode', description: 'Please select a payment method.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const next = () => { if (validate()) setStep(s => Math.min(5, s + 1)); };
  const prev = () => setStep(s => Math.max(1, s - 1));

  const confirm = async () => {
    setSubmitting(true);
    try {
      const newPatient = await patientService.createPatient({
        patientId: '',
        name: `${form.firstName} ${form.lastName}`,
        dob: form.dob,
        age: 0,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        address: form.address,
        bloodGroup: form.bloodGroup,
        emergencyContactName: form.emergencyContact,
        emergencyContactPhone: form.emergencyPhone,
        allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        existingConditions: form.existingConditions ? form.existingConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
        lastVisit: '',
        status: 'Admitted',
        doctor: form.selectedDoctor,
        department: form.department,
      });

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
      onAdmitted?.();
      onClose();
    } catch {
      toast({ title: 'Admission Failed', description: 'Failed to complete admission. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const meta = STEP_META[step as keyof typeof STEP_META];

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:w-[85vw] sm:max-w-[860px] p-0 flex flex-col h-full bg-background"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <BedDouble className="h-3.5 w-3.5 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">IPD Admission</h2>
            </div>
            <p className="text-xs text-muted-foreground ml-9.5">{meta.title} — {meta.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* ── Stepper ── */}
        <Stepper current={step} />

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && <StepPatient form={form} update={update} />}
          {step === 2 && <StepRoom form={form} update={update} rooms={rooms} loading={loadingRooms} />}
          {step === 3 && <StepDoctor form={form} update={update} doctors={doctors} departments={departments} />}
          {step === 4 && <StepPayment form={form} update={update} />}
          {step === 5 && <StepConfirm form={form} rooms={rooms} doctors={doctors} />}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card/50 flex-shrink-0">
          <Button variant="outline" onClick={step === 1 ? onClose : prev} className="gap-1.5 min-w-20">
            {step === 1 ? <><X className="h-3.5 w-3.5" /> Cancel</> : <><ChevronLeft className="h-4 w-4" /> Back</>}
          </Button>
          <span className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</span>
          {step < 5 ? (
            <Button onClick={next} className="gap-1.5 min-w-20">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={confirm} disabled={submitting} className="min-w-40 gap-2">
              {submitting
                ? <><div className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Admitting…</>
                : <><Check className="h-3.5 w-3.5" /> Confirm Admission</>
              }
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
