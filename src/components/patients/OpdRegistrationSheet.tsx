import { useState, useEffect, useRef, useCallback } from 'react';
import { format, parse, isValid } from 'date-fns';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, X, Stethoscope, User, Ticket, CheckCircle, ArrowRight,
  IndianRupee, ShieldCheck, CalendarIcon, Plus,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as patientService from '@/services/patientService';
import { Patient } from '@/services/patientService';
import * as doctorService from '@/services/doctorService';
import { Doctor } from '@/services/doctorService';
import { fetchDepartmentNames } from '@/services/departmentService';
import * as opdService from '@/services/opdVisitService';
import { OpdVisit } from '@/services/opdVisitService';
import { AbdmSheet } from '@/components/abdm/AbdmSheet';
import * as abdmService from '@/services/abdmService';

interface OpdRegistrationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: (visit: OpdVisit) => void;
}

const PAYMENT_MODES = [
  { value: 'cash',        label: 'Cash' },
  { value: 'card',        label: 'Card / UPI' },
  { value: 'insurance',   label: 'Insurance' },
  { value: 'corporate',   label: 'Corporate' },
  { value: 'government',  label: 'Government' },
];

// ── Department-wise chief complaint suggestions ──────────────────────────────
const COMPLAINT_SUGGESTIONS: Record<string, string[]> = {
  Orthopedics:       ['Joint pain', 'Back pain', 'Knee pain', 'Shoulder pain', 'Fracture', 'Post-op follow-up'],
  Cardiology:        ['Chest pain', 'Palpitations', 'Shortness of breath', 'Hypertension checkup', 'Leg swelling'],
  Neurology:         ['Headache', 'Dizziness', 'Seizure', 'Numbness / tingling', 'Memory issues', 'Weakness'],
  Pediatrics:        ['Fever', 'Cold & cough', 'Vomiting', 'Growth checkup', 'Vaccination', 'Rash'],
  Gynecology:        ['Abdominal pain', 'Irregular periods', 'Pregnancy checkup', 'Discharge', 'Pelvic pain'],
  Dermatology:       ['Rash', 'Itching', 'Acne', 'Hair loss', 'Skin infection', 'Pigmentation'],
  ENT:               ['Ear pain', 'Sore throat', 'Nasal blockage', 'Hearing loss', 'Tonsillitis', 'Snoring'],
  Ophthalmology:     ['Blurry vision', 'Eye pain', 'Redness', 'Watering eyes', 'Vision checkup', 'Cataract'],
  Gastroenterology:  ['Abdominal pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Acidity / GERD'],
  Urology:           ['Urinary problems', 'Kidney stones', 'UTI symptoms', 'Pelvic pain', 'Blood in urine'],
  Pulmonology:       ['Cough', 'Breathlessness', 'Wheezing', 'Chest tightness', 'TB follow-up'],
  Endocrinology:     ['Diabetes follow-up', 'Weight gain', 'Thyroid checkup', 'Fatigue', 'Hair thinning'],
  Psychiatry:        ['Anxiety', 'Depression', 'Sleep issues', 'Mood swings', 'Follow-up', 'Stress'],
  Oncology:          ['Follow-up', 'Pain management', 'Fatigue', 'Chemotherapy review', 'Biopsy follow-up'],
  General:           ['Fever', 'Fatigue', 'General checkup', 'Follow-up', 'Cough', 'Weakness', 'Body ache'],
};

function getSuggestions(dept: string, specialisation: string): string[] {
  const key = Object.keys(COMPLAINT_SUGGESTIONS).find(k =>
    dept.toLowerCase().includes(k.toLowerCase()) ||
    specialisation.toLowerCase().includes(k.toLowerCase()),
  );
  return COMPLAINT_SUGGESTIONS[key ?? 'General'];
}

// ── Compact DOB picker — uses the standard Calendar component ─────────────────
interface DobPickerProps {
  value: string;   // "YYYY-MM-DD" or ""
  onChange: (val: string) => void;
}

function DobPicker({ value, onChange }: DobPickerProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ? format(new Date(value + 'T00:00:00'), 'dd/MM/yyyy') : '');
  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;

  useEffect(() => {
    setText(value ? format(new Date(value + 'T00:00:00'), 'dd/MM/yyyy') : '');
  }, [value]);

  const handleTextChange = (raw: string) => {
    setText(raw);
    let parsed: Date | null = null;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw))      parsed = parse(raw, 'dd/MM/yyyy', new Date());
    else if (/^\d{4}-\d{2}-\d{2}$/.test(raw))    parsed = new Date(raw + 'T00:00:00');
    if (parsed && isValid(parsed) && parsed <= new Date() && parsed.getFullYear() >= 1900)
      onChange(format(parsed, 'yyyy-MM-dd'));
    else if (raw === '') onChange('');
  };

  const handleCalendarSelect = (d: Date | undefined) => {
    if (d) { onChange(format(d, 'yyyy-MM-dd')); setText(format(d, 'dd/MM/yyyy')); }
    setOpen(false);
  };

  return (
    <div className="flex gap-1">
      <Input
        value={text}
        onChange={e => handleTextChange(e.target.value)}
        placeholder="DD/MM/YYYY"
        className="h-8 text-sm flex-1 min-w-0"
        maxLength={10}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 px-0" type="button">
            <CalendarIcon className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end" side="bottom" sideOffset={4}>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            defaultMonth={selectedDate ?? new Date(2000, 0, 1)}
            disabled={(d) => d > new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export const OpdRegistrationSheet = ({ isOpen, onClose, onRegistered }: OpdRegistrationSheetProps) => {
  // Patient lookup
  const [patientSearch, setPatientSearch]     = useState('');
  const [patientResults, setPatientResults]   = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatient, setIsNewPatient]       = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // New patient fields
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [gender,    setGender]    = useState('');
  const [dob,       setDob]       = useState('');

  // Visit details
  const [departments,     setDepartments]     = useState<string[]>([]);
  const [doctors,         setDoctors]         = useState<Doctor[]>([]);
  const [selectedDept,    setSelectedDept]    = useState('');
  const [selectedDoctor,  setSelectedDoctor]  = useState<Doctor | null>(null);
  const [complaint,       setComplaint]       = useState('');
  const [paymentMode,     setPaymentMode]     = useState('cash');

  // UI state
  const [isSubmitting,         setIsSubmitting]         = useState(false);
  const [registeredVisit,      setRegisteredVisit]      = useState<OpdVisit | null>(null);
  const [registeredPatientId,  setRegisteredPatientId]  = useState('');
  const [isAbdmOpen,           setIsAbdmOpen]           = useState(false);

  // Load departments & doctors when sheet opens
  useEffect(() => {
    if (!isOpen) return;
    fetchDepartmentNames().then(setDepartments).catch(() => {});
    doctorService.fetchDoctors(1, 100)
      .then(result => {
        const list = Array.isArray(result) ? result : (result as any).data ?? [];
        setDoctors(list);
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => { if (isOpen) resetForm(); }, [isOpen]);

  const resetForm = () => {
    setPatientSearch(''); setPatientResults([]); setSelectedPatient(null);
    setIsNewPatient(false); setFirstName(''); setLastName('');
    setPhone(''); setGender(''); setDob('');
    setSelectedDept(''); setSelectedDoctor(null);
    setComplaint(''); setPaymentMode('cash'); setRegisteredVisit(null);
  };

  // Patient search
  const handlePatientSearch = useCallback(async (query: string) => {
    setPatientSearch(query);
    setSelectedPatient(null);
    setIsNewPatient(false);
    if (query.trim().length >= 2) {
      try {
        const results = await patientService.searchPatients(query);
        setPatientResults(results);
        setShowSuggestions(true);
      } catch {
        setPatientResults([]);
      }
    } else {
      setPatientResults([]);
      setShowSuggestions(false);
    }
  }, []);

  const selectExistingPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.name);
    setShowSuggestions(false);
    setIsNewPatient(false);
  };

  const startNewPatient = () => { setIsNewPatient(true); setSelectedPatient(null); setShowSuggestions(false); };

  // Filtered doctor list by department
  const filteredDoctors = selectedDept
    ? doctors.filter(d => d.department?.toLowerCase() === selectedDept.toLowerCase() && d.status === 'Active')
    : doctors.filter(d => d.status === 'Active');

  // Complaint suggestions based on selected dept / doctor specialisation
  const suggestions = getSuggestions(
    selectedDept || selectedDoctor?.department || '',
    selectedDoctor?.specialisation || '',
  );

  const addSuggestion = (s: string) => {
    setComplaint(prev => {
      if (!prev.trim()) return s;
      if (prev.toLowerCase().includes(s.toLowerCase())) return prev;
      return `${prev.trimEnd().replace(/,\s*$/, '')}, ${s}`;
    });
  };

  // Submit
  const handleRegister = async () => {
    if (!selectedPatient && !isNewPatient) {
      toast({ title: 'Select Patient', description: 'Search for an existing patient or create a new one.', variant: 'destructive' });
      return;
    }
    if (isNewPatient && (!firstName.trim() || !phone.trim() || !gender)) {
      toast({ title: 'Missing Fields', description: 'First name, phone, and gender are required for new patients.', variant: 'destructive' });
      return;
    }
    if (!selectedDoctor) {
      toast({ title: 'Select Doctor', description: 'Please select a doctor for this visit.', variant: 'destructive' });
      return;
    }
    if (!complaint.trim()) {
      toast({ title: 'Chief Complaint', description: 'Please enter the reason for visit.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      let patientId = selectedPatient?.id || '';
      let patientName = selectedPatient?.name || '';
      let patientPhone = selectedPatient?.phone || '';

      if (isNewPatient) {
        const newPatient = await patientService.createPatient({
          patientId: '', name: `${firstName} ${lastName}`.trim(),
          dob: dob || undefined, age: 0, gender, phone,
          email: '', address: '', bloodGroup: '', lastVisit: '',
          status: 'Active', doctor: selectedDoctor.name,
          department: selectedDept || selectedDoctor.department || '',
        });
        patientId   = newPatient.id;
        patientName = newPatient.name;
        patientPhone = phone;
      }

      const visit = await opdService.createOpdVisit({
        patient_id:       patientId,
        patient_name:     patientName,
        patient_phone:    patientPhone,
        doctor_id:        selectedDoctor.id,
        doctor_name:      selectedDoctor.name,
        department:       selectedDept || selectedDoctor.department || '',
        chief_complaint:  complaint,
        consultation_fee: selectedDoctor.consultationFee || 0,
        payment_mode:     paymentMode,
      });

      setRegisteredVisit(visit);
      setRegisteredPatientId(patientId);
      onRegistered?.(visit);
      toast({ title: 'OPD Registered', description: `Token: ${visit.tokenNumber}`, variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to register OPD visit. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Token confirmation screen ────────────────────────────────────────────
  if (registeredVisit) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
          <SheetContent className="w-full sm:w-[min(680px,92vw)] p-0 flex flex-col h-full" side="right">
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">OPD Registration Complete</h2>
              <p className="text-sm text-muted-foreground mb-6">Patient has been added to the queue</p>

              <div className="rounded-xl border-2 border-primary/20 bg-primary/5 px-8 py-6 mb-6 w-full max-w-xs">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Ticket className="h-5 w-5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Token</span>
                </div>
                <p className="text-4xl font-black text-primary tracking-wide">{registeredVisit.tokenNumber}</p>
              </div>

              <div className="text-left w-full max-w-xs space-y-2 mb-8">
                {[
                  ['Patient',        registeredVisit.patientName],
                  ['Doctor',         registeredVisit.doctorName],
                  ['Department',     registeredVisit.department],
                  ['Queue Position', `#${registeredVisit.queuePosition}`],
                  ...(registeredVisit.consultationFee > 0
                    ? [['Fee', `₹${registeredVisit.consultationFee.toLocaleString('en-IN')}`]]
                    : []),
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {registeredPatientId && !abdmService.getAbhaForPatient(registeredPatientId) && (
              <div className="px-8 pb-4">
                <button
                  onClick={() => setIsAbdmOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/5 text-primary text-xs font-semibold py-2.5 hover:bg-primary/10 transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Link ABHA (Ayushman Bharat Health Account)
                </button>
              </div>
            )}
            {registeredPatientId && abdmService.getAbhaForPatient(registeredPatientId) && (
              <div className="px-8 pb-4 flex items-center justify-center gap-2 text-xs text-green-600 font-medium">
                <CheckCircle className="h-3.5 w-3.5" />
                ABHA linked: {abdmService.getAbhaForPatient(registeredPatientId)?.abhaNumber}
              </div>
            )}

            <div className="flex-shrink-0 border-t border-border px-5 py-3 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
              <Button className="flex-1" onClick={resetForm}>Register Another</Button>
            </div>
          </SheetContent>
        </Sheet>

        {registeredPatientId && (
          <AbdmSheet
            isOpen={isAbdmOpen}
            onClose={() => setIsAbdmOpen(false)}
            patientId={registeredPatientId}
            patientName={registeredVisit?.patientName ?? ''}
            initialMode="choose"
            onLinked={() => setIsAbdmOpen(false)}
          />
        )}
      </>
    );
  }

  // ── Registration form ────────────────────────────────────────────────────
  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      {/* ↑ wider: min(680px, 92vw) so it uses ~35% on large monitors */}
      <SheetContent className="w-full sm:w-[min(680px,92vw)] p-0 flex flex-col h-full" side="right">

        {/* Header */}
        <div className="flex-shrink-0 bg-background border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">OPD Registration</h2>
                <p className="text-xs text-muted-foreground">Quick out-patient visit registration</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Patient section ──────────────────────────────────────────── */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2 border-b border-border flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Patient</span>
            </div>
            <div className="p-4 space-y-3">

              {/* Search */}
              <div ref={searchRef} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={patientSearch}
                  onChange={e => handlePatientSearch(e.target.value)}
                  onFocus={() => patientResults.length > 0 && setShowSuggestions(true)}
                  placeholder="Search by name or phone..."
                  className="pl-8 h-9 text-sm"
                />
                {showSuggestions && patientResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {patientResults.slice(0, 8).map(p => (
                      <button
                        key={p.id}
                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center gap-2"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => selectExistingPatient(p)}
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.phone} · {p.patientId}</p>
                        </div>
                        {p.status && <Badge variant="outline" className="text-[10px] shrink-0">{p.status}</Badge>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected patient badge */}
              {selectedPatient && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-800">{selectedPatient.name}</p>
                    <p className="text-xs text-emerald-600">{selectedPatient.phone} · {selectedPatient.patientId}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6"
                    onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* New patient toggle */}
              {!selectedPatient && patientSearch.length >= 2 && (
                <button
                  onClick={startNewPatient}
                  className={`w-full text-left px-3 py-2 rounded-md border transition-colors text-sm ${
                    isNewPatient
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-dashed border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  + Register new patient
                </button>
              )}

              {/* New patient inline form */}
              {isNewPatient && !selectedPatient && (
                <div className="space-y-3 pt-2 border-t border-border">
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">First Name *</Label>
                      <Input value={firstName} onChange={e => setFirstName(e.target.value)}
                        placeholder="First" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Last Name</Label>
                      <Input value={lastName} onChange={e => setLastName(e.target.value)}
                        placeholder="Last" className="h-8 text-sm" />
                    </div>
                  </div>

                  {/* Phone · Gender · DOB row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Phone *</Label>
                      <Input value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="98765…" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Gender *</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">
                        DOB
                        <span className="ml-1 text-[10px] text-muted-foreground font-normal">(dd/mm/yyyy)</span>
                      </Label>
                      <DobPicker value={dob} onChange={setDob} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Visit details section ─────────────────────────────────────── */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2 border-b border-border flex items-center gap-2">
              <Stethoscope className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Visit Details</span>
            </div>
            <div className="p-4 space-y-3">

              {/* Dept + Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Department</Label>
                  <Select value={selectedDept} onValueChange={v => { setSelectedDept(v); setSelectedDoctor(null); }}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Payment</Label>
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_MODES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Doctor list */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Doctor *</Label>
                <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                  {filteredDoctors.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3 text-center">
                      {selectedDept ? 'No active doctors in this department' : 'Loading doctors…'}
                    </p>
                  ) : (
                    filteredDoctors.map(doc => {
                      const isSelected = selectedDoctor?.id === doc.id;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDoctor(doc)}
                          className={`w-full text-left rounded-md border p-2.5 flex items-center gap-2.5 transition-all ${
                            isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Stethoscope className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-[11px] text-muted-foreground">{doc.specialisation || doc.department}</p>
                          </div>
                          <div className="text-right shrink-0">
                            {doc.consultationFee > 0 && (
                              <p className="text-xs font-semibold text-foreground flex items-center gap-0.5">
                                <IndianRupee className="h-3 w-3" />{doc.consultationFee}
                              </p>
                            )}
                            {isSelected && <CheckCircle className="h-4 w-4 text-primary mt-0.5 ml-auto" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chief complaint */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Chief Complaint *</Label>
                <Input
                  value={complaint}
                  onChange={e => setComplaint(e.target.value)}
                  placeholder="Chest pain, headache, follow-up…"
                  className="h-9 text-sm"
                />
                {/* Suggestion chips — show when a dept / doctor is selected or always */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {suggestions.map(s => {
                    const already = complaint.toLowerCase().includes(s.toLowerCase());
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addSuggestion(s)}
                        disabled={already}
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                          already
                            ? 'border-primary/30 bg-primary/8 text-primary/50 cursor-default'
                            : 'border-border bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        {!already && <Plus className="h-2.5 w-2.5" />}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border px-5 py-3 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            onClick={handleRegister}
            disabled={isSubmitting}
            className="gap-1.5 min-w-36"
          >
            {isSubmitting ? 'Registering…' : (<>Register <ArrowRight className="h-3.5 w-3.5" /></>)}
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
};

export default OpdRegistrationSheet;
