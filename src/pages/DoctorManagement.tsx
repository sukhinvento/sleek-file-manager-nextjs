import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Search, Plus, Eye, Edit, Trash2, X, Save,
  Phone, Mail, Calendar, Star, Users, Clock, User,
  Stethoscope, GraduationCap, Globe, CheckCircle, AlertCircle, UserMinus
} from 'lucide-react';
import * as doctorService from '@/services/doctorService';
import { Doctor, DoctorSchedule } from '@/services/doctorService';
import { toast } from '@/hooks/use-toast';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// ── Design tokens ────────────────────────────────────────────────────────────
const PRIMARY   = STAT_ACCENTS.PRIMARY;
const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toDate = (s: string): Date | undefined => s ? new Date(s + 'T00:00:00') : undefined;
const fromDate = (d: Date | undefined): string => d ? d.toISOString().split('T')[0] : '';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = ['Cardiology', 'Orthopaedics', 'Neurology', 'General Medicine', 'Paediatrics', 'Oncology', 'Emergency', 'Radiology', 'Gynaecology', 'Psychiatry', 'Urology', 'Nephrology', 'ENT', 'Ophthalmology', 'Dermatology'];
const STATUSES: Doctor['status'][] = ['Active', 'On Leave', 'Inactive'];
const GENDERS: Doctor['gender'][] = ['Male', 'Female', 'Other'];
const DAYS: DoctorSchedule['day'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Bengali', 'Gujarati', 'Marathi', 'Punjabi'];

const STATUS_STYLES: Record<Doctor['status'], { badge: string; icon: React.ElementType; dot: string }> = {
  Active:     { badge: 'bg-green-100 text-green-800 border-green-200',  icon: CheckCircle, dot: 'bg-green-500' },
  'On Leave': { badge: 'bg-amber-100 text-amber-800 border-amber-200',  icon: Clock,        dot: 'bg-amber-500' },
  Inactive:   { badge: 'bg-gray-100  text-gray-700  border-gray-200',   icon: UserMinus,    dot: 'bg-gray-400'  },
};

const DEPT_COLORS: Record<string, string> = {
  Cardiology: 'bg-red-100 text-red-700', Orthopaedics: 'bg-blue-100 text-blue-700',
  Neurology: 'bg-purple-100 text-purple-700', 'General Medicine': 'bg-green-100 text-green-700',
  Paediatrics: 'bg-pink-100 text-pink-700', Oncology: 'bg-orange-100 text-orange-700',
  Emergency: 'bg-red-200 text-red-800', Radiology: 'bg-cyan-100 text-cyan-700',
};

const EMPTY_DOCTOR: Omit<Doctor, 'id'> = {
  employeeId: '', name: '', gender: 'Male', dob: '', phone: '', email: '',
  department: 'General Medicine', specialisation: '', qualification: [],
  experience: 0, status: 'Active', schedule: [], consultationFee: 0,
  opdSlots: 20, activePatients: 0, joinDate: new Date().toISOString().split('T')[0],
  registrationNo: '', bio: '', languages: ['English'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();

const avatarColor = (id: string) => {
  const colors = ['bg-primary', 'bg-purple-500', 'bg-green-600', 'bg-amber-500', 'bg-cyan-600', 'bg-pink-500'];
  return colors[id.charCodeAt(id.length - 1) % colors.length];
};

const FieldGroup = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-semibold text-foreground mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const SelectField = ({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── Doctor Avatar ─────────────────────────────────────────────────────────────

const DoctorAvatar = ({ doctor, size = 'md' }: { doctor: Doctor; size?: 'sm' | 'md' | 'lg' }) => {
  const sz = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} ${avatarColor(doctor.id)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials(doctor.name)}
    </div>
  );
};

// ─── Schedule Editor ──────────────────────────────────────────────────────────

const ScheduleEditor = ({ schedule, onChange }: {
  schedule: DoctorSchedule[];
  onChange: (s: DoctorSchedule[]) => void;
}) => {
  const toggle = (day: DoctorSchedule['day']) => {
    if (schedule.some(s => s.day === day)) {
      onChange(schedule.filter(s => s.day !== day));
    } else {
      onChange([...schedule, { day, startTime: '09:00', endTime: '17:00' }]);
    }
  };

  const update = (day: DoctorSchedule['day'], field: 'startTime' | 'endTime', val: string) => {
    onChange(schedule.map(s => s.day === day ? { ...s, [field]: val } : s));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-3">
        {DAYS.map(day => {
          const active = schedule.some(s => s.day === day);
          return (
            <button key={day} onClick={() => toggle(day)}
              className={`w-10 h-10 rounded-full text-xs font-bold transition-all border ${
                active ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
              }`}>
              {day}
            </button>
          );
        })}
      </div>
      {schedule.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          {schedule.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)).map((s, i) => (
            <div key={s.day} className={`flex items-center gap-3 px-3 py-2 ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
              <span className="text-xs font-semibold text-foreground w-8">{s.day}</span>
              <input type="time" value={s.startTime} onChange={e => update(s.day, 'startTime', e.target.value)}
                className="h-7 rounded border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
              <span className="text-xs text-muted-foreground">to</span>
              <input type="time" value={s.endTime} onChange={e => update(s.day, 'endTime', e.target.value)}
                className="h-7 rounded border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Doctor Sheet (View / Edit / Add) ────────────────────────────────────────

interface DoctorSheetProps {
  doctor: Doctor | null;
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave: (d: Doctor) => void;
}

const DoctorSheet = ({ doctor, mode, onClose, onSave }: DoctorSheetProps) => {
  const [form, setForm] = useState<Omit<Doctor, 'id'>>(doctor ? { ...doctor } : { ...EMPTY_DOCTOR });
  const [qualInput, setQualInput] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = mode === 'edit' || mode === 'add';

  useEffect(() => { setForm(doctor ? { ...doctor } : { ...EMPTY_DOCTOR }); }, [doctor]);

  const upd = <K extends keyof Omit<Doctor, 'id'>>(key: K, val: Omit<Doctor, 'id'>[K]) =>
    setForm(p => ({ ...p, [key]: val }));

  const addQual = () => {
    if (qualInput.trim()) { upd('qualification', [...form.qualification, qualInput.trim()]); setQualInput(''); }
  };
  const removeQual = (q: string) => upd('qualification', form.qualification.filter(x => x !== q));

  const toggleLanguage = (lang: string) =>
    upd('languages', form.languages.includes(lang) ? form.languages.filter(l => l !== lang) : [...form.languages, lang]);

  const handleSave = async () => {
    if (!form.name || !form.department || !form.registrationNo) {
      toast({ title: 'Missing fields', description: 'Name, department, and registration number are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let saved: Doctor;
      if (mode === 'add') {
        saved = await doctorService.addDoctor(form);
        toast({ title: 'Doctor Added', description: `${saved.name} has been added to the system.`, variant: 'success' });
      } else {
        saved = await doctorService.updateDoctor(doctor!.id, form);
        toast({ title: 'Doctor Updated', description: `${saved.name}'s profile has been updated.`, variant: 'success' });
      }
      onSave(saved);
    } catch {
      toast({ title: 'Error', description: 'Failed to save. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={!!doctor || mode === 'add'} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:w-[680px] sm:max-w-[680px] p-0 flex flex-col h-full bg-background">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {mode !== 'add' && doctor && <DoctorAvatar doctor={doctor} size="md" />}
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground truncate">
                {mode === 'add' ? 'Add New Doctor' : mode === 'edit' ? `Edit — ${doctor?.name}` : doctor?.name}
              </h2>
              {mode === 'view' && doctor && (
                <p className="text-xs text-muted-foreground mt-0.5">{doctor.specialisation} · {doctor.department}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── VIEW MODE ─────────────────────────────────────────── */}
          {mode === 'view' && doctor && (
            <>
              {/* Status + dept */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${STATUS_STYLES[doctor.status].badge} border text-xs font-semibold pointer-events-none`}>{doctor.status}</Badge>
                <Badge className={`${DEPT_COLORS[doctor.department] ?? 'bg-slate-100 text-slate-700'} border-0 text-xs pointer-events-none`}>{doctor.department}</Badge>
                <span className="ml-auto text-xs text-muted-foreground">Reg: {doctor.registrationNo}</span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Experience', value: `${doctor.experience} yrs`, icon: Star },
                  { label: 'Active Patients', value: doctor.activePatients, icon: Users },
                  { label: 'OPD Fee', value: `₹${doctor.consultationFee.toLocaleString('en-IN')}`, icon: Stethoscope },
                ].map(s => (
                  <div key={s.label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-base font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bio */}
              {doctor.bio && (
                <div className="rounded-lg bg-primary/5 border border-primary/15 px-4 py-3">
                  <p className="text-xs text-foreground leading-relaxed">{doctor.bio}</p>
                </div>
              )}

              {/* Personal Details */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Personal Details</span>
                </div>
                {[
                  ['Employee ID', doctor.employeeId],
                  ['Phone', doctor.phone],
                  ['Email', doctor.email],
                  ['Gender', doctor.gender],
                  ['Date of Birth', doctor.dob],
                  ['Join Date', doctor.joinDate],
                ].map(([label, value], i) => (
                  <div key={label} className={`flex px-4 py-2.5 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                    <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-foreground">{value || '—'}</span>
                  </div>
                ))}
              </div>

              {/* Professional Details */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Professional Details</span>
                </div>
                {[
                  ['Specialisation', doctor.specialisation],
                  ['Consultation Fee', `₹${doctor.consultationFee.toLocaleString('en-IN')}`],
                  ['OPD Slots/Day', doctor.opdSlots > 0 ? String(doctor.opdSlots) : 'N/A'],
                  ['Registration No.', doctor.registrationNo],
                ].map(([label, value], i) => (
                  <div key={label} className={`flex px-4 py-2.5 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                    <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-foreground">{value || '—'}</span>
                  </div>
                ))}
              </div>

              {/* Qualifications */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Qualifications</span>
                </div>
                <div className="px-4 py-3 flex flex-wrap gap-2">
                  {doctor.qualification.length > 0 ? doctor.qualification.map(q => (
                    <span key={q} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15 text-xs font-medium text-primary">
                      <GraduationCap className="h-3 w-3" />{q}
                    </span>
                  )) : <span className="text-xs text-muted-foreground">No qualifications listed</span>}
                </div>
              </div>

              {/* Languages */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Languages</span>
                </div>
                <div className="px-4 py-3 flex flex-wrap gap-2">
                  {doctor.languages.length > 0 ? doctor.languages.map(l => (
                    <span key={l} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-xs text-foreground">
                      <Globe className="h-3 w-3 text-muted-foreground" />{l}
                    </span>
                  )) : <span className="text-xs text-muted-foreground">No languages listed</span>}
                </div>
              </div>

              {/* Schedule */}
              {doctor.schedule.length > 0 && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Weekly Schedule</span>
                  </div>
                  {doctor.schedule.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)).map((s, i) => (
                    <div key={s.day} className={`flex items-center gap-4 px-4 py-2.5 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                      <span className="text-xs font-semibold text-foreground w-8">{s.day}</span>
                      <span className="text-xs text-muted-foreground">{s.startTime} – {s.endTime}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {(() => {
                          const [sh, sm] = s.startTime.split(':').map(Number);
                          const [eh, em] = s.endTime.split(':').map(Number);
                          const mins = (eh * 60 + em) - (sh * 60 + sm);
                          return mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ''}`.trim() : '—';
                        })()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {doctor.status === 'On Leave' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">This doctor is currently on leave and will not appear as available for new patient assignments.</p>
                </div>
              )}
            </>
          )}

          {/* ── EDIT / ADD MODE ───────────────────────────────────── */}
          {isEdit && (
            <>
              {/* Basic Info */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Personal Details</span>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <FieldGroup label="Full Name" required>
                    <Input value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Dr. First Last" />
                  </FieldGroup>
                  <FieldGroup label="Employee ID" required>
                    <Input value={form.employeeId} onChange={e => upd('employeeId', e.target.value)} placeholder="EMP1001" />
                  </FieldGroup>
                  <FieldGroup label="Gender">
                    <SelectField value={form.gender} onChange={v => upd('gender', v as Doctor['gender'])}
                      options={GENDERS.map(g => ({ value: g, label: g }))} />
                  </FieldGroup>
                  <FieldGroup label="Date of Birth">
                    <DatePicker date={toDate(form.dob)} onDateChange={d => upd('dob', fromDate(d))} placeholder="Select DOB" />
                  </FieldGroup>
                  <FieldGroup label="Phone" required>
                    <Input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+91 98765 43210" />
                  </FieldGroup>
                  <FieldGroup label="Email" required>
                    <Input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="doctor@hospital.com" />
                  </FieldGroup>
                </div>
              </div>

              {/* Professional */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Professional Details</span>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <FieldGroup label="Department" required>
                    <SelectField value={form.department} onChange={v => upd('department', v)}
                      options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
                  </FieldGroup>
                  <FieldGroup label="Specialisation" required>
                    <Input value={form.specialisation} onChange={e => upd('specialisation', e.target.value)} placeholder="e.g. Interventional Cardiology" />
                  </FieldGroup>
                  <FieldGroup label="Registration No." required>
                    <Input value={form.registrationNo} onChange={e => upd('registrationNo', e.target.value)} placeholder="MCI-KA-XXXXX" />
                  </FieldGroup>
                  <FieldGroup label="Experience (years)">
                    <Input type="number" min={0} max={60} value={form.experience} onChange={e => upd('experience', Number(e.target.value))} />
                  </FieldGroup>
                  <FieldGroup label="Consultation Fee (₹)">
                    <Input type="number" min={0} value={form.consultationFee} onChange={e => upd('consultationFee', Number(e.target.value))} />
                  </FieldGroup>
                  <FieldGroup label="OPD Slots/Day">
                    <Input type="number" min={0} value={form.opdSlots} onChange={e => upd('opdSlots', Number(e.target.value))} />
                  </FieldGroup>
                  <FieldGroup label="Join Date">
                    <DatePicker date={toDate(form.joinDate)} onDateChange={d => upd('joinDate', fromDate(d))} placeholder="Select join date" />
                  </FieldGroup>
                  <FieldGroup label="Status">
                    <SelectField value={form.status} onChange={v => upd('status', v as Doctor['status'])}
                      options={STATUSES.map(s => ({ value: s, label: s }))} />
                  </FieldGroup>
                </div>
              </div>

              {/* Qualifications */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Qualifications</span>
                </div>
                <div className="p-4">
                <div className="flex gap-2 mb-2">
                  <Input value={qualInput} onChange={e => setQualInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addQual()}
                    placeholder="e.g. MBBS, MD, DM…" className="flex-1 h-8 text-sm" />
                  <Button variant="outline" size="sm" onClick={addQual} className="h-8 px-3 text-xs">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.qualification.map(q => (
                    <span key={q} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15 text-xs font-medium text-primary">
                      <GraduationCap className="h-3 w-3" />{q}
                      <button onClick={() => removeQual(q)} className="hover:opacity-60 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
                </div>
              </div>

              {/* Languages */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Languages</span>
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => {
                    const active = form.languages.includes(lang);
                    return (
                      <button key={lang} onClick={() => toggleLanguage(lang)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${
                          active ? 'border-primary bg-primary/8 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                        }`}>
                        <Globe className="h-3 w-3" />{lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Weekly Schedule</span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-3">Click a day to toggle it on/off, then set times.</p>
                  <ScheduleEditor schedule={form.schedule} onChange={s => upd('schedule', s)} />
                </div>
              </div>

              {/* Bio */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                  <Edit className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Bio / Profile Summary</span>
                </div>
                <div className="p-4">
                <FieldGroup label="Bio">
                  <textarea value={form.bio} onChange={e => upd('bio', e.target.value)} rows={3}
                    placeholder="Brief professional summary visible to patients and staff…"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                </FieldGroup>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {isEdit && (
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? 'Saving…' : <><Save className="h-4 w-4" /> Save Doctor</>}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ─── Doctor Table Row ─────────────────────────────────────────────────────────

const TABLE_HEADERS = ['Doctor', 'Department', 'Qualifications', 'Exp.', 'Patients', 'Fee', 'Schedule', 'Status', ''] as const;

// ─── Main Page ────────────────────────────────────────────────────────────────

export const DoctorManagement = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, onLeave: 0, inactive: 0, departments: 0, totalActivePatients: 0 });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [sheetMode, setSheetMode] = useState<'view' | 'edit' | 'add' | null>(null);

  useEffect(() => { loadData(); }, []);

  const computeStats = (docs: Doctor[]) => ({
    total: docs.length,
    active: docs.filter(d => d.status === 'Active').length,
    onLeave: docs.filter(d => d.status === 'On Leave').length,
    inactive: docs.filter(d => d.status === 'Inactive').length,
    departments: new Set(docs.map(d => d.department).filter(Boolean)).size,
    totalActivePatients: docs.filter(d => d.status === 'Active').reduce((sum, d) => sum + (d.activePatients || 0), 0),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const docs = await doctorService.fetchDoctors();
      setDoctors(docs);
      setStats(computeStats(docs));
    } catch {
      toast({ title: 'Error', description: 'Failed to load doctor data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    setStats(computeStats(doctors));
  };

  const departments = useMemo(() => ['All', ...new Set(doctors.map(d => d.department))], [doctors]);

  const filtered = useMemo(() => doctors.filter(d => {
    const matchSearch = !searchTerm ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialisation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.registrationNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || d.status === filterStatus;
    const matchDept = filterDept === 'All' || d.department === filterDept;
    return matchSearch && matchStatus && matchDept;
  }), [doctors, searchTerm, filterStatus, filterDept]);

  const openSheet = (doctor: Doctor | null, mode: 'view' | 'edit' | 'add') => {
    setSelectedDoctor(doctor);
    setSheetMode(mode);
  };

  const closeSheet = () => { setSheetMode(null); setSelectedDoctor(null); };

  const handleSave = (saved: Doctor) => {
    setDoctors(prev => {
      const idx = prev.findIndex(d => d.id === saved.id);
      return idx >= 0 ? prev.map(d => d.id === saved.id ? saved : d) : [...prev, saved];
    });
    refreshStats();
    closeSheet();
  };

  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);

  const handleDelete = async (doctor: Doctor) => {
    try {
      await doctorService.deleteDoctor(doctor.id);
      setDoctors(prev => prev.filter(d => d.id !== doctor.id));
      refreshStats();
      toast({ title: 'Doctor Removed', description: `${doctor.name} has been removed.`, variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to remove doctor.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total" value={stats.total} icon={Stethoscope} accent={STAT_ACCENTS.PRIMARY}
            active={filterStatus === 'All'} onClick={() => setFilterStatus('All')} />
          <StatCard label="Active" value={stats.active} icon={CheckCircle} accent={STAT_ACCENTS.SUCCESS}
            active={filterStatus === 'Active'} onClick={() => setFilterStatus(s => s === 'Active' ? 'All' : 'Active')} />
          <StatCard label="On Leave" value={stats.onLeave} icon={Clock} accent={STAT_ACCENTS.WARNING}
            active={filterStatus === 'On Leave'} onClick={() => setFilterStatus(s => s === 'On Leave' ? 'All' : 'On Leave')} />
          <StatCard label="Inactive" value={stats.inactive} icon={UserMinus} accent={STAT_ACCENTS.DANGER}
            active={filterStatus === 'Inactive'} onClick={() => setFilterStatus(s => s === 'Inactive' ? 'All' : 'Inactive')} />
          <StatCard label="Departments" value={stats.departments} icon={Users} accent={STAT_ACCENTS.PURPLE} />
        </div>
      </div>

      {/* Active filter pill */}

      {/* Filter / Search bar */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3">
        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {departments.map(dept => (
                <button key={dept}
                  onClick={() => setFilterDept(d => d === dept ? 'All' : dept)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: filterDept === dept ? PRIMARY : 'transparent',
                    color: filterDept === dept ? '#fff' : TEXT_MUTE,
                    borderColor: filterDept === dept ? PRIMARY : BORDER,
                  }}>
                  {dept}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <div className="relative w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Name, specialisation, reg. no…" className="pl-8 h-8 text-xs"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Button size="sm" className="h-8 text-xs gap-1.5 flex-shrink-0" onClick={() => openSheet(null, 'add')}>
              <Plus size={13} /> Add Doctor
            </Button>
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Name, specialisation…" className="pl-8 h-8 text-xs"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Button size="sm" className="h-8 text-xs gap-1.5 flex-shrink-0" onClick={() => openSheet(null, 'add')}>
              <Plus size={13} /> Add
            </Button>
          </div>
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {departments.map(dept => (
                <button key={dept}
                  onClick={() => setFilterDept(d => d === dept ? 'All' : dept)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: filterDept === dept ? PRIMARY : 'transparent',
                    color: filterDept === dept ? '#fff' : TEXT_MUTE,
                    borderColor: filterDept === dept ? PRIMARY : BORDER,
                  }}>
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl ring-1 ring-border [overflow:clip]">
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                        <div className="h-2.5 w-20 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl ring-1 ring-border bg-card p-16 text-center">
          <Stethoscope className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No doctors found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <MobileTableView
          data={filtered}
          stickyHeader={true}
          columns={[
            {
              key: 'name',
              label: 'Doctor',
              width: 'w-[20%]',
              render: (_value, item) => {
                const doc = item as Doctor;
                const st = STATUS_STYLES[doc.status];
                return (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <DoctorAvatar doctor={doc} size="sm" />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${st.dot}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: TEXT_MAIN }}>{doc.name}</p>
                      <p className="text-[11px] truncate" style={{ color: TEXT_MUTE }}>{doc.specialisation}</p>
                    </div>
                  </div>
                );
              },
            },
            {
              key: 'department',
              label: 'Department',
              width: 'w-[13%]',
              render: (value) => (
                <Badge className={`${DEPT_COLORS[value as string] ?? 'bg-slate-100 text-slate-700'} border-0 text-[11px] pointer-events-none`}>
                  {value as string}
                </Badge>
              ),
            },
            {
              key: 'qualification',
              label: 'Qualifications',
              width: 'w-[12%]',
              render: (value) => {
                const quals = value as string[];
                return (
                  <div className="flex flex-wrap gap-1">
                    {quals.slice(0, 2).map(q => (
                      <span key={q} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/8 text-primary font-medium">{q}</span>
                    ))}
                    {quals.length > 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{quals.length - 2}</span>
                    )}
                  </div>
                );
              },
            },
            {
              key: 'experience',
              label: 'Exp.',
              width: 'w-[7%]',
              render: (value) => (
                <div>
                  <span className="font-semibold text-sm" style={{ color: TEXT_MAIN }}>{value as number}</span>
                  <span className="text-[11px]" style={{ color: TEXT_MUTE }}> yr</span>
                </div>
              ),
            },
            {
              key: 'activePatients',
              label: 'Patients',
              width: 'w-[8%]',
              render: (value) => (
                <span className="font-semibold text-sm" style={{ color: TEXT_MAIN }}>{value as number}</span>
              ),
            },
            {
              key: 'consultationFee',
              label: 'Fee',
              width: 'w-[9%]',
              render: (value) => (
                <span className="font-semibold text-sm" style={{ color: TEXT_MAIN }}>₹{(value as number).toLocaleString('en-IN')}</span>
              ),
            },
            {
              key: 'schedule',
              label: 'Schedule',
              width: 'w-[12%]',
              render: (value) => {
                const schedule = value as DoctorSchedule[];
                if (!schedule?.length) return <span className="text-[11px] italic" style={{ color: TEXT_MUTE }}>—</span>;
                return (
                  <div className="space-y-1">
                    {[DAYS.slice(0, 4), DAYS.slice(4)].map((row, ri) => (
                      <div key={ri} className="flex gap-1">
                        {row.map(day => {
                          const active = schedule.some(s => s.day === day);
                          const slot = schedule.find(s => s.day === day);
                          return (
                            <span key={day}
                              title={active && slot ? `${day}: ${slot.startTime}–${slot.endTime}` : undefined}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-colors ${
                                active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/30'
                              }`}>
                              {day[0]}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              },
            },
            {
              key: 'status',
              label: 'Status',
              width: 'w-[9%]',
              render: (value) => {
                const st = STATUS_STYLES[value as Doctor['status']];
                return <Badge className={`${st.badge} border text-[11px] pointer-events-none`}>{value as string}</Badge>;
              },
            },
          ]}
          renderMobileItem={(item) => {
            const doc = item as Doctor;
            const st = STATUS_STYLES[doc.status];
            return (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <DoctorAvatar doctor={doc} size="md" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${st.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: TEXT_MAIN }}>{doc.name}</p>
                    <p className="text-xs truncate" style={{ color: TEXT_MUTE }}>{doc.specialisation}</p>
                  </div>
                  <Badge className={`${st.badge} border text-xs pointer-events-none flex-shrink-0`}>{doc.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={`${DEPT_COLORS[doc.department] ?? 'bg-slate-100 text-slate-700'} border-0 text-xs pointer-events-none`}>{doc.department}</Badge>
                  {doc.qualification.slice(0, 2).map(q => (
                    <span key={q} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/8 text-primary font-medium">{q}</span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Exp.', value: `${doc.experience} yr` },
                    { label: 'Patients', value: doc.activePatients },
                    { label: 'Fee', value: `₹${doc.consultationFee.toLocaleString('en-IN')}` },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg bg-muted/40 py-1.5">
                      <p className="text-xs font-semibold" style={{ color: TEXT_MAIN }}>{s.value}</p>
                      <p className="text-[10px]" style={{ color: TEXT_MUTE }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                {doc.schedule.length > 0 && (
                  <div className="flex gap-1">
                    {DAYS.map(day => {
                      const active = doc.schedule.some(s => s.day === day);
                      return (
                        <span key={day} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/30'
                        }`}>{day[0]}</span>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-2 pt-1 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5" onClick={() => openSheet(doc, 'view')}>
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5" onClick={() => openSheet(doc, 'edit')}>
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteTarget(doc)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          }}
          getActions={(item) => [
            { label: 'View', onClick: () => openSheet(item as Doctor, 'view'), icon: Eye },
            { label: 'Edit', onClick: () => openSheet(item as Doctor, 'edit'), icon: Edit },
            { label: 'Delete', onClick: () => setDeleteTarget(item as Doctor), variant: 'destructive' as const, icon: Trash2 },
          ]}
          onRowClick={(item) => openSheet(item as Doctor, 'view')}
        />
      )}

      {/* Doctor Sheet */}
      {sheetMode && (
        <DoctorSheet
          doctor={sheetMode === 'add' ? null : selectedDoctor}
          mode={sheetMode}
          onClose={closeSheet}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Remove ${deleteTarget?.name ?? 'doctor'}?`}
        description="This will permanently remove this doctor from the system. This action cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
};
