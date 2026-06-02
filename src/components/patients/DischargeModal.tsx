import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  X, ChevronRight, ChevronLeft, Check, Sparkles, Loader2,
  BedDouble, FlaskConical, Stethoscope, DollarSign, FileText, Printer
} from 'lucide-react';
import { Patient } from '@/services/patientService';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChargeItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  editable: boolean;
}

interface DischargeState {
  roomCharges: ChargeItem[];
  medicationCharges: ChargeItem[];
  doctorCharges: ChargeItem[];
  diagnosticCharges: ChargeItem[];
  aiSummary: string;
  diagnosis: string;
  treatment: string;
  followUp: string;
  dischargeNotes: string;
  aiGenerated: boolean;
}

const DISCHARGE_STEPS = [
  { id: 1, label: 'Room & Stay', icon: BedDouble },
  { id: 2, label: 'Medications', icon: FlaskConical },
  { id: 3, label: 'Doctors & Diagnostics', icon: Stethoscope },
  { id: 4, label: 'AI Summary', icon: Sparkles },
  { id: 5, label: 'Bill Review', icon: DollarSign },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const daysBetween = (a: string, b: string) => {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86400000));
};

const generateMockDischargeData = (patient: Patient): DischargeState => {
  const admitDate = patient.admissionDate || '2026-05-09';
  const today = new Date().toISOString().split('T')[0];
  const days = daysBetween(admitDate, today);
  const rate = patient.roomType === 'ICU' ? 8000 : patient.roomType === 'Private' ? 4000 : 2000;

  return {
    roomCharges: [
      {
        id: 'RC1',
        description: `${patient.roomType || 'General'} Ward — Room ${patient.roomNumber || '101'}`,
        quantity: days,
        unitPrice: rate,
        total: days * rate,
        editable: false,
      },
      {
        id: 'RC2',
        description: 'Nursing Care Charges',
        quantity: days,
        unitPrice: 500,
        total: days * 500,
        editable: false,
      },
      {
        id: 'RC3',
        description: 'Meals & Dietary',
        quantity: days,
        unitPrice: 300,
        total: days * 300,
        editable: true,
      },
    ],
    medicationCharges: [
      { id: 'MC1', description: 'IV Antibiotics (Cefuroxime 750mg × 3/day)', quantity: days * 3, unitPrice: 85, total: days * 3 * 85, editable: true },
      { id: 'MC2', description: 'Pantoprazole 40mg', quantity: days, unitPrice: 12, total: days * 12, editable: true },
      { id: 'MC3', description: 'IV Fluids (Normal Saline 500ml)', quantity: days * 2, unitPrice: 45, total: days * 2 * 45, editable: true },
    ],
    doctorCharges: [
      { id: 'DC1', description: `Attending Physician — ${patient.doctor || 'Dr. Johnson'}`, quantity: days, unitPrice: 1200, total: days * 1200, editable: false },
      { id: 'DC2', description: 'Specialist Consultation (Cardiology)', quantity: 2, unitPrice: 2000, total: 4000, editable: true },
      { id: 'DC3', description: 'Anaesthesia Charges', quantity: 1, unitPrice: 5000, total: 5000, editable: true },
    ],
    diagnosticCharges: [
      { id: 'DG1', description: 'Complete Blood Count (CBC)', quantity: 2, unitPrice: 450, total: 900, editable: true },
      { id: 'DG2', description: 'ECG', quantity: 1, unitPrice: 350, total: 350, editable: true },
      { id: 'DG3', description: 'Chest X-Ray', quantity: 1, unitPrice: 600, total: 600, editable: true },
      { id: 'DG4', description: 'Blood Culture', quantity: 1, unitPrice: 800, total: 800, editable: true },
    ],
    aiSummary: '',
    diagnosis: '',
    treatment: '',
    followUp: '',
    dischargeNotes: '',
    aiGenerated: false,
  };
};

// ─── Editable Charge Table ────────────────────────────────────────────────────

const ChargeTable = ({
  title, icon: Icon, items, onUpdate, onAdd
}: {
  title: string;
  icon: React.ElementType;
  items: ChargeItem[];
  onUpdate: (id: string, field: 'quantity' | 'unitPrice', val: number) => void;
  onAdd?: () => void;
}) => {
  const total = items.reduce((s, i) => s + i.total, 0);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <span className="text-xs font-bold text-primary">{formatCurrency(total)}</span>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-primary/6 border-b border-border">
              <th className="text-left px-3 py-2 font-semibold text-primary uppercase tracking-wider">Description</th>
              <th className="text-center px-2 py-2 font-semibold text-primary uppercase tracking-wider w-16">Qty</th>
              <th className="text-right px-2 py-2 font-semibold text-primary uppercase tracking-wider w-24">Unit ₹</th>
              <th className="text-right px-3 py-2 font-semibold text-primary uppercase tracking-wider w-24">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}>
                <td className="px-3 py-2 text-foreground">{item.description}</td>
                <td className="px-2 py-1.5 text-center">
                  {item.editable ? (
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => onUpdate(item.id, 'quantity', Number(e.target.value))}
                      className="w-14 text-center rounded border border-input bg-background px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  ) : (
                    <span className="text-muted-foreground">{item.quantity}</span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-right">
                  {item.editable ? (
                    <input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={e => onUpdate(item.id, 'unitPrice', Number(e.target.value))}
                      className="w-20 text-right rounded border border-input bg-background px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  ) : (
                    <span className="text-muted-foreground">{item.unitPrice.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Stepper ──────────────────────────────────────────────────────────────────

const StepHeader = ({ current }: { current: number }) => (
  <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
    {DISCHARGE_STEPS.map((step, idx) => {
      const done = current > step.id;
      const active = current === step.id;
      const Icon = step.icon;
      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs font-bold ${
              done ? 'bg-primary text-primary-foreground' :
              active ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
              'bg-muted text-muted-foreground'
            }`}>
              {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
            </div>
            <span className={`text-[10px] font-semibold hidden sm:block ${active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
          </div>
          {idx < DISCHARGE_STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 transition-all ${done ? 'bg-primary' : 'bg-border'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── AI Generation Hook (simulated) ──────────────────────────────────────────

const useAIGenerate = () => {
  const [generating, setGenerating] = useState(false);
  const generate = async (patient: Patient): Promise<{ summary: string; diagnosis: string; treatment: string; followUp: string }> => {
    setGenerating(true);
    await new Promise(res => setTimeout(res, 2800));
    setGenerating(false);
    const name = `${patient.name}`;
    return {
      summary: `Patient ${name}, ${patient.age || 'Adult'} years, presented to our facility and was admitted under the care of ${patient.doctor || 'the attending physician'} (${patient.department || 'General Medicine'}). The patient remained haemodynamically stable throughout the admission period. All vital parameters were within acceptable range by Day 3. The patient responded well to treatment and is now fit for discharge.`,
      diagnosis: `Primary: Acute Illness — ${patient.department || 'General Medicine'}\nSecondary: Mild dehydration, resolved on Day 2`,
      treatment: `1. IV Antibiotics (Cefuroxime 750mg TID × ${daysBetween(patient.admissionDate || '2026-05-09', new Date().toISOString().split('T')[0])} days)\n2. IV Fluid resuscitation — Normal Saline 500ml BD\n3. Antipyretics PRN — Paracetamol 500mg\n4. Proton Pump Inhibitor — Pantoprazole 40mg OD\n5. Physiotherapy — chest physiotherapy daily`,
      followUp: `• OPD review in 7 days — ${patient.doctor || 'Dr. Johnson'}\n• Repeat CBC and CRP at follow-up\n• Avoid strenuous activities for 2 weeks\n• Resume normal diet; adequate hydration\n• Return immediately if fever > 38.5°C or breathlessness worsens`,
    };
  };
  return { generating, generate };
};

// ─── Print / PDF Helper ───────────────────────────────────────────────────────

const openPrintWindow = (patient: Patient, state: DischargeState, grandTotal: number) => {
  const sections = [
    { title: 'Room &amp; Stay Charges', items: state.roomCharges },
    { title: 'Medications &amp; Pharmacy', items: state.medicationCharges },
    { title: 'Doctor &amp; Consultant Fees', items: state.doctorCharges },
    { title: 'Diagnostics &amp; Lab', items: state.diagnosticCharges },
  ];

  const tableRows = (items: ChargeItem[]) => items.map(i => `
    <tr>
      <td>${i.description}</td>
      <td style="text-align:center">${i.quantity}</td>
      <td style="text-align:right">₹${i.unitPrice.toLocaleString('en-IN')}</td>
      <td style="text-align:right;font-weight:600">₹${i.total.toLocaleString('en-IN')}</td>
    </tr>`).join('');

  const summaryHtml = state.aiGenerated ? `
    <div style="margin-top:28px;page-break-before:auto">
      <h2 style="font-size:13px;font-weight:700;margin:0 0 12px;padding-bottom:6px;border-bottom:1px solid #e5e7eb">Discharge Summary</h2>
      ${[
        ['Diagnosis', state.diagnosis],
        ['Treatment Provided', state.treatment],
        ['Follow-Up Instructions', state.followUp],
        ...(state.dischargeNotes ? [['Doctor\'s Notes', state.dischargeNotes]] : []),
      ].map(([label, val]) => `
        <div style="margin-bottom:10px">
          <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;margin:0 0 4px">${label}</p>
          <p style="font-size:12px;line-height:1.6;margin:0;white-space:pre-line">${val}</p>
        </div>`).join('')}
    </div>` : '';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Discharge Bill — ${patient.name}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;color:#111;padding:32px;max-width:800px;margin:0 auto}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid hsl(220,48%,42%)}
    .hosp{font-size:22px;font-weight:800;color:hsl(220,48%,42%)}
    .sub{font-size:11px;color:#6b7280;margin-top:2px}
    .info-r{text-align:right;font-size:11px;color:#374151;line-height:1.7}
    h2{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:hsl(220,48%,42%);margin:18px 0 6px;padding-bottom:4px;border-bottom:1px solid #e5e7eb}
    table{width:100%;border-collapse:collapse;margin-bottom:4px}
    th{font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;border-bottom:1px solid #e5e7eb;padding:5px 6px;text-align:left;font-weight:600}
    th:nth-child(2){text-align:center}th:nth-child(3),th:nth-child(4){text-align:right}
    td{padding:5px 6px;border-bottom:1px solid #f3f4f6;font-size:11px}
    .grand{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:16px;padding:10px 14px;background:hsl(220,48%,95%);border-radius:6px;border-left:3px solid hsl(220,48%,42%)}
    .grand-label{font-size:13px;font-weight:700;color:#111}
    .grand-amount{font-size:18px;font-weight:800;color:hsl(220,48%,42%)}
    .footer{margin-top:32px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;text-align:center}
    @media print{body{padding:16px}@page{margin:12mm}}
  </style></head><body>
  <div class="hdr">
    <div><div class="hosp">City Hospital</div><div class="sub">Discharge Invoice &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div></div>
    <div class="info-r">
      <strong>${patient.name}</strong><br>
      ID: ${patient.patientId ?? 'N/A'} &nbsp;|&nbsp; Age: ${patient.age ?? 'N/A'}<br>
      Admitted: ${patient.admissionDate ?? 'N/A'}<br>
      Doctor: ${patient.doctor ?? 'N/A'} &nbsp;|&nbsp; ${patient.department ?? ''}
    </div>
  </div>
  ${sections.map(s => `<h2>${s.title}</h2><table><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${tableRows(s.items)}</tbody></table>`).join('')}
  <div class="grand"><span class="grand-label">Grand Total</span><span class="grand-amount">₹${grandTotal.toLocaleString('en-IN')}</span></div>
  ${summaryHtml}
  <div class="footer">This is a computer-generated invoice. For queries contact the billing department.</div>
  </body></html>`;

  const w = window.open('', '_blank', 'width=860,height=700');
  if (w) {
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface DischargeModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DischargeModal = ({ patient, isOpen, onClose }: DischargeModalProps) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<DischargeState | null>(null);
  const { generating, generate } = useAIGenerate();

  useEffect(() => {
    if (patient && isOpen) {
      setStep(1);
      setState(generateMockDischargeData(patient));
    }
  }, [patient, isOpen]);

  const updateChargeItem = (
    section: 'roomCharges' | 'medicationCharges' | 'doctorCharges' | 'diagnosticCharges',
    id: string,
    field: 'quantity' | 'unitPrice',
    val: number
  ) => {
    setState(prev => {
      if (!prev) return prev;
      const items = prev[section].map(item =>
        item.id === id ? { ...item, [field]: val, total: field === 'quantity' ? val * item.unitPrice : item.quantity * val } : item
      );
      return { ...prev, [section]: items };
    });
  };

  const handleGenerate = async () => {
    if (!patient) return;
    const result = await generate(patient);
    setState(prev => prev ? {
      ...prev,
      aiSummary: result.summary,
      diagnosis: result.diagnosis,
      treatment: result.treatment,
      followUp: result.followUp,
      aiGenerated: true,
    } : prev);
  };

  const subtotalBeforeTax = state ? [
    ...state.roomCharges,
    ...state.medicationCharges,
    ...state.doctorCharges,
    ...state.diagnosticCharges,
  ].reduce((s, i) => s + i.total, 0) : 0;

  const GST_RATE = 0.18;
  const taxAmount = Math.round(subtotalBeforeTax * GST_RATE * 100) / 100;
  const grandTotal = subtotalBeforeTax + taxAmount;

  const sectionTotals = {
    room: state?.roomCharges.reduce((s, i) => s + i.total, 0) ?? 0,
    meds: state?.medicationCharges.reduce((s, i) => s + i.total, 0) ?? 0,
    docs: state?.doctorCharges.reduce((s, i) => s + i.total, 0) ?? 0,
    diag: state?.diagnosticCharges.reduce((s, i) => s + i.total, 0) ?? 0,
  };

  const stepTitles: Record<number, { title: string; subtitle: string }> = {
    1: { title: 'Room & Stay Charges', subtitle: 'Review bed, nursing, and accommodation charges — auto-populated from room assignment' },
    2: { title: 'Medication Charges', subtitle: 'Pharmacy charges pulled from dispensing records — adjust quantities as needed' },
    3: { title: 'Doctor & Diagnostic Charges', subtitle: 'Physician fees and lab/imaging charges — edit or add any additional charges' },
    4: { title: 'AI-Generated Discharge Summary', subtitle: 'Premium feature — AI generates clinical summary, diagnosis, treatment, and follow-up instructions' },
    5: { title: 'Final Bill Review', subtitle: 'Review consolidated bill before finalising discharge' },
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:w-[70vw] sm:max-w-[70vw] p-0 flex flex-col h-full bg-background"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Discharge Patient</h2>
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-bold pointer-events-none">PREMIUM</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {patient?.name} · {patient?.patientId} · Admitted: {patient?.admissionDate || 'N/A'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <StepHeader current={step} />

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-foreground">{stepTitles[step].title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{stepTitles[step].subtitle}</p>
          </div>

          {/* Step 1: Room */}
          {step === 1 && state && (
            <ChargeTable
              title="Room & Stay"
              icon={BedDouble}
              items={state.roomCharges}
              onUpdate={(id, field, val) => updateChargeItem('roomCharges', id, field, val)}
            />
          )}

          {/* Step 2: Medications */}
          {step === 2 && state && (
            <ChargeTable
              title="Medications & Pharmacy"
              icon={FlaskConical}
              items={state.medicationCharges}
              onUpdate={(id, field, val) => updateChargeItem('medicationCharges', id, field, val)}
            />
          )}

          {/* Step 3: Doctor + Diagnostics */}
          {step === 3 && state && (
            <div className="space-y-5">
              <ChargeTable
                title="Doctor & Consultant Fees"
                icon={Stethoscope}
                items={state.doctorCharges}
                onUpdate={(id, field, val) => updateChargeItem('doctorCharges', id, field, val)}
              />
              <ChargeTable
                title="Diagnostics & Lab"
                icon={FlaskConical}
                items={state.diagnosticCharges}
                onUpdate={(id, field, val) => updateChargeItem('diagnosticCharges', id, field, val)}
              />
            </div>
          )}

          {/* Step 4: AI Summary */}
          {step === 4 && state && (
            <div className="space-y-4">
              {!state.aiGenerated && !generating && (
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center">
                  <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-foreground mb-1">AI Discharge Summary</h4>
                  <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
                    Click below to let the AI auto-generate a clinical discharge summary, diagnosis, treatment record, and follow-up instructions based on this patient's stay.
                  </p>
                  <Button onClick={handleGenerate} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </Button>
                </div>
              )}

              {generating && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
                  <Loader2 className="h-8 w-8 text-primary mx-auto mb-3 animate-spin" />
                  <p className="text-sm font-semibold text-foreground">Generating discharge summary…</p>
                  <p className="text-xs text-muted-foreground mt-1">AI is analysing admission records, diagnoses, and treatment history</p>
                </div>
              )}

              {state.aiGenerated && !generating && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
                    <Check className="h-3.5 w-3.5" /> AI summary generated — review and edit before finalising
                  </div>

                  {[
                    { label: 'Clinical Summary', key: 'aiSummary', rows: 4 },
                    { label: 'Diagnosis', key: 'diagnosis', rows: 2 },
                    { label: 'Treatment Provided', key: 'treatment', rows: 4 },
                    { label: 'Follow-Up Instructions', key: 'followUp', rows: 4 },
                    { label: 'Discharge Notes (Doctor)', key: 'dischargeNotes', rows: 2 },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">{field.label}</label>
                      <textarea
                        value={(state as any)[field.key]}
                        onChange={e => setState(prev => prev ? { ...prev, [field.key]: e.target.value } : prev)}
                        rows={field.rows}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      />
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-2 text-xs">
                    <Sparkles className="h-3.5 w-3.5" /> Regenerate
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Bill Review */}
          {step === 5 && state && (
            <div className="space-y-4">
              {[
                { label: 'Room & Stay', amount: sectionTotals.room, icon: BedDouble },
                { label: 'Medications', amount: sectionTotals.meds, icon: FlaskConical },
                { label: 'Doctor Fees', amount: sectionTotals.docs, icon: Stethoscope },
                { label: 'Diagnostics', amount: sectionTotals.diag, icon: FlaskConical },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <row.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{row.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(row.amount)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Subtotal</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(subtotalBeforeTax)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">GST (18%)</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(taxAmount)}</span>
              </div>

              <div className="rounded-lg bg-primary/8 border border-primary/20 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Grand Total (incl. GST)</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
              </div>

              {!state?.aiGenerated && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    AI discharge summary was not generated. Go back to Step 4 to add clinical documentation, or proceed without it.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="gap-2 flex-1"
                  onClick={() => patient && state && openPrintWindow(patient, state, grandTotal)}>
                  <Printer className="h-4 w-4" /> Print Bill
                </Button>
                <Button className="gap-2 flex-1"
                  onClick={() => patient && state && openPrintWindow(patient, state, grandTotal)}>
                  <FileText className="h-4 w-4" /> Export PDF
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card flex-shrink-0">
          <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <span className="text-xs text-muted-foreground">Step {step} of {DISCHARGE_STEPS.length}</span>
          {step < 5 ? (
            <Button onClick={() => setStep(s => Math.min(5, s + 1))} disabled={generating}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 gap-2">
              <Check className="h-4 w-4" /> Confirm Discharge
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
