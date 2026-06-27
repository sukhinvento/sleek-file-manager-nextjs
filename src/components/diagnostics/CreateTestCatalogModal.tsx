import React, { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FlaskConical, Tag, DollarSign, Clock, Stethoscope,
  FileText, ClipboardList, X,
} from 'lucide-react';
import * as diagnosticService from '@/services/diagnosticService';
import type { DiagnosticTest } from '@/services/diagnosticService';
import { toast } from '@/hooks/use-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Haematology', 'Biochemistry', 'Microbiology', 'Radiology',
  'Cardiology', 'Pathology', 'Ultrasound', 'MRI', 'CT Scan', 'X-Ray', 'Other',
];

// ─── Form state ───────────────────────────────────────────────────────────────
interface CatalogForm {
  testCode: string;
  name: string;
  category: string;
  department: string;
  price: string;
  durationMinutes: string;
  description: string;
  preparation: string;
}

const INITIAL: CatalogForm = {
  testCode: '', name: '', category: '', department: '',
  price: '', durationMinutes: '', description: '', preparation: '',
};

type Errors = Partial<Record<keyof CatalogForm, string>>;

function validate(form: CatalogForm, isEdit: boolean): Errors {
  const e: Errors = {};
  if (!isEdit && !form.testCode.trim()) e.testCode = 'Test code is required';
  if (!form.name.trim())     e.name     = 'Test name is required';
  if (!form.category)        e.category = 'Category is required';
  if (!form.department.trim()) e.department = 'Department is required';
  if (form.price && isNaN(Number(form.price)))
    e.price = 'Must be a valid number';
  if (form.durationMinutes && isNaN(Number(form.durationMinutes)))
    e.durationMinutes = 'Must be a valid number';
  return e;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (test: DiagnosticTest) => void;
  editTest?: DiagnosticTest | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const CreateTestCatalogModal = ({ isOpen, onClose, onSaved, editTest }: Props) => {
  const isEdit = !!editTest;

  const [form, setForm] = useState<CatalogForm>(() =>
    editTest
      ? {
          testCode: (editTest as any).testCode || '',
          name: editTest.name,
          category: editTest.category || '',
          department: editTest.department || '',
          price: editTest.price?.toString() || '',
          durationMinutes: editTest.duration ? editTest.duration.replace(/[^0-9]/g, '') : '',
          description: editTest.description || '',
          preparation: editTest.preparation || '',
        }
      : { ...INITIAL }
  );
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof CatalogForm>(key: K, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleClose = () => {
    setForm(INITIAL);
    setErrors({});
    onClose();
  };

  const handleSave = async () => {
    const errs = validate(form, isEdit);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const payload = {
        testCode: form.testCode.trim(),
        name: form.name.trim(),
        category: form.category as DiagnosticTest['category'],
        department: form.department.trim(),
        price: form.price ? Number(form.price) : 0,
        duration: form.durationMinutes ? `${form.durationMinutes} minutes` : '',
        description: form.description.trim() || undefined,
        preparation: form.preparation.trim() || undefined,
      };

      let result: DiagnosticTest;
      if (isEdit && editTest) {
        result = await diagnosticService.updateDiagnosticTest(editTest.id, payload);
        toast({ title: 'Test Updated', description: `"${result.name}" has been updated in the catalog.`, variant: 'success' });
      } else {
        result = await diagnosticService.createDiagnosticTest(payload);
        toast({ title: 'Test Added', description: `"${result.name}" has been added to the catalog.`, variant: 'success' });
      }

      onSaved(result);
      handleClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to save test. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) handleClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:w-[85vw] sm:max-w-[680px] p-0 flex flex-col h-full bg-background"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <FlaskConical className="h-3.5 w-3.5 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                {isEdit ? 'Edit Test' : 'Add Test to Catalog'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground ml-9">
              {isEdit
                ? 'Update the details for this diagnostic test'
                : 'Create a new test that patients can book through the system'}
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

          {/* Test Identity */}
          <Section title="Test Identity" icon={Tag}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isEdit && (
                <Field label="Test Code" required error={errors.testCode}>
                  <Input
                    value={form.testCode}
                    onChange={e => update('testCode', e.target.value)}
                    placeholder="e.g. CBC-001"
                    className={`h-9 text-sm ${errors.testCode ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                  />
                </Field>
              )}
              <Field label="Test Name" required error={errors.name}>
                <Input
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="e.g. Complete Blood Count"
                  className={`h-9 text-sm ${errors.name ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                />
              </Field>
              <Field label="Category" required error={errors.category}>
                <Select value={form.category} onValueChange={v => update('category', v)}>
                  <SelectTrigger className={`h-9 text-sm ${errors.category ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Department" required error={errors.department}>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    value={form.department}
                    onChange={e => update('department', e.target.value)}
                    placeholder="e.g. Pathology Lab"
                    className={`pl-9 h-9 text-sm ${errors.department ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                  />
                </div>
              </Field>
            </div>
          </Section>

          {/* Pricing & Duration */}
          <Section title="Pricing & Duration" icon={DollarSign}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Price (₹)" error={errors.price}>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-muted-foreground pointer-events-none">₹</span>
                  <Input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={e => update('price', e.target.value)}
                    placeholder="0"
                    className={`pl-7 h-9 text-sm ${errors.price ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                  />
                </div>
              </Field>
              <Field label="Duration (minutes)" error={errors.durationMinutes}>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="number"
                    min="0"
                    value={form.durationMinutes}
                    onChange={e => update('durationMinutes', e.target.value)}
                    placeholder="e.g. 30"
                    className={`pl-9 h-9 text-sm ${errors.durationMinutes ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                  />
                </div>
              </Field>
            </div>
          </Section>

          {/* Description */}
          <Section title="Description" icon={FileText}>
            <Field label="Test Description">
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe what this test measures or diagnoses…"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
              />
            </Field>
          </Section>

          {/* Patient Preparation */}
          <Section title="Patient Preparation" icon={ClipboardList}>
            <Field label="Preparation Instructions">
              <textarea
                value={form.preparation}
                onChange={e => update('preparation', e.target.value)}
                placeholder="e.g. Fast for 8 hours before the test. Avoid strenuous activity…"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
              />
            </Field>
          </Section>

        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card/50 flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={submitting} className="gap-1.5 min-w-20">
            <X className="h-3.5 w-3.5" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitting} className="min-w-44 gap-2">
            {submitting
              ? <><div className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Saving…</>
              : <><FlaskConical className="h-3.5 w-3.5" /> {isEdit ? 'Save Changes' : 'Add to Catalog'}</>
            }
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
