import React, { useState, useEffect, useRef } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { X, Calendar, Clock, AlertCircle, Search, Save, Edit3, User, FileText, DollarSign, Activity, Printer, Paperclip, Upload, Image, File, Trash2, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
// Card components removed — using tinted section headers pattern
import { PatientDiagnostic, DiagnosticTest, DiagnosticAttachment } from '@/services/diagnosticService';
import * as diagnosticService from '@/services/diagnosticService';
import * as patientService from '@/services/patientService';
import * as doctorService from '@/services/doctorService';
import { ModernInventoryOverlay } from '../inventory/ModernInventoryOverlay';
import DocumentPreviewDialog from '@/components/shared/DocumentPreviewDialog';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { toast } from '@/hooks/use-toast';
// Separator removed — using border-based dividers

interface ModernDiagnosticOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostic?: PatientDiagnostic;
  isEditMode?: boolean;
  onSave: (diagnostic: Omit<PatientDiagnostic, 'id'> | PatientDiagnostic) => Promise<void>;
  preselectedTest?: DiagnosticTest;
}

export const ModernDiagnosticOverlay = ({
  isOpen,
  onClose,
  diagnostic,
  isEditMode: initialIsEditMode = false,
  onSave,
  preselectedTest,
}: ModernDiagnosticOverlayProps) => {
  const { displayName } = useCurrentUser();
  const [formData, setFormData] = useState<Partial<PatientDiagnostic>>({
    patientId: '',
    patientName: '',
    testId: '',
    testName: '',
    category: '',
    orderedBy: displayName,
    orderedDate: new Date().toISOString().split('T')[0],
    scheduledDate: '',
    scheduledTime: '',
    status: 'Scheduled',
    priority: 'Routine',
    price: 0,
    notes: '',
  });

  const [availableTests, setAvailableTests] = useState<DiagnosticTest[]>([]);
  const [searchTest, setSearchTest] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [filteredTests, setFilteredTests] = useState<DiagnosticTest[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [showTestSuggestions, setShowTestSuggestions] = useState(false);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [availablePatients, setAvailablePatients] = useState<any[]>([]);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);
  const [selectedPatientDisplay, setSelectedPatientDisplay] = useState<string>('');
  const patientJustSelected = useRef(false);
  const [showDoctorSuggestions, setShowDoctorSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(initialIsEditMode);
  const [orderedDate, setOrderedDate] = useState<Date | undefined>(undefined);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [isNarrowLayout, setIsNarrowLayout] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [attachments, setAttachments] = useState<DiagnosticAttachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<DiagnosticAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadTests();
      loadDoctors();
      loadPatients();
      if (diagnostic) {
        setFormData(diagnostic);
        setSearchTest(diagnostic.testName);
        setSearchPatient(diagnostic.patientName);
        setSearchDoctor(diagnostic.orderedBy);
        setIsEditMode(initialIsEditMode);
        setAttachments(diagnostic.attachments || []);

        // Convert string dates to Date objects
        if (diagnostic.orderedDate) {
          setOrderedDate(new Date(diagnostic.orderedDate));
        }
        if (diagnostic.scheduledDate) {
          setScheduledDate(new Date(diagnostic.scheduledDate));
        }
      } else {
        // Reset form
        setFormData({
          patientId: '',
          patientName: '',
          testId: '',
          testName: '',
          category: '',
          orderedBy: displayName,
          orderedDate: new Date().toISOString().split('T')[0],
          scheduledDate: '',
          scheduledTime: '',
          status: 'Scheduled',
          priority: 'Routine',
          price: 0,
          notes: '',
        });
        setSearchTest('');
        setSearchPatient('');
        setSelectedPatientDisplay('');
        setIsEditMode(false);
        setAttachments([]);
        setOrderedDate(new Date());
        setScheduledDate(undefined);
      }
      setErrors({});
    }
  }, [isOpen, diagnostic, initialIsEditMode]);

  // Auto-populate form when a preselected test is provided (booking from Tests tab)
  useEffect(() => {
    if (isOpen && preselectedTest && !diagnostic) {
      setFormData(prev => ({
        ...prev,
        testId: preselectedTest.id,
        testName: preselectedTest.name,
        category: preselectedTest.category || '',
        price: preselectedTest.price || 0,
      }));
      setSearchTest(preselectedTest.name);
    }
  }, [isOpen, preselectedTest, diagnostic]);

  // Responsive layout detection — mirrors PO overlay behaviour
  useEffect(() => {
    if (!isOpen) return;
    const mq = window.matchMedia('(max-width: 1300px)');
    const handleMQ = (e: MediaQueryListEvent | MediaQueryList) => setIsNarrowLayout(e.matches);
    handleMQ(mq);
    mq.addEventListener('change', handleMQ as any);
    const el = containerRef.current;
    let ro: ResizeObserver | null = null;
    if (el) {
      const measure = () => { if (el.getBoundingClientRect().width < 600 && !mq.matches) setIsNarrowLayout(true); };
      measure();
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
    return () => { mq.removeEventListener('change', handleMQ as any); ro?.disconnect(); };
  }, [isOpen]);

  const loadTests = async () => {
    try {
      const res = await diagnosticService.fetchDiagnosticTests(1, 100);
      const tests = Array.isArray(res) ? res : (res as any).data ?? [];
      setAvailableTests(tests);
      setFilteredTests(tests);
    } catch (error) {
      console.error('Failed to load tests:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await doctorService.fetchDoctors(1, 100);
      const doctors = Array.isArray(res) ? res : (res as any).data ?? [];
      setAvailableDoctors(doctors);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  };

  const loadPatients = async () => {
    if (availablePatients.length > 0) return;
    setIsPatientsLoading(true);
    try {
      const res = await patientService.fetchPatients(1, 200);
      setAvailablePatients(res.data ?? []);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setIsPatientsLoading(false);
    }
  };

  // Search tests
  useEffect(() => {
    if (searchTest) {
      const filtered = availableTests.filter(test =>
        test.name.toLowerCase().includes(searchTest.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTest.toLowerCase())
      );
      setFilteredTests(filtered);
    } else {
      setFilteredTests(availableTests);
    }
  }, [searchTest, availableTests]);

  // Search patients — local filter on decrypted names (names are PII-encrypted server-side)
  // Visibility is controlled only by onChange/handlePatientSelect, not here
  useEffect(() => {
    if (patientJustSelected.current) {
      patientJustSelected.current = false;
      return;
    }
    if (searchPatient.trim().length < 2) {
      setFilteredPatients([]);
      setShowPatientSuggestions(false);
      return;
    }
    const q = searchPatient.toLowerCase().trim();
    const results = availablePatients.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.patientId || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q)
    );
    setFilteredPatients(results);
    // Don't call setShowPatientSuggestions here — onChange controls opening,
    // handlePatientSelect controls closing
  }, [searchPatient, availablePatients]);

  // Search doctors — visibility is controlled only by onChange/onFocus/handleDoctorSelect
  useEffect(() => {
    if (searchDoctor.length >= 1) {
      const filtered = availableDoctors.filter(doc => {
        const nameMatch = doc?.name ? doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) : false;
        const specMatch = doc?.specialisation ? doc.specialisation.toLowerCase().includes(searchDoctor.toLowerCase()) : false;
        return nameMatch || specMatch;
      });
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
      setShowDoctorSuggestions(false);
    }
  }, [searchDoctor, availableDoctors]);

  const handleTestSelect = (test: DiagnosticTest) => {
    setFormData(prev => ({
      ...prev,
      testId: test.id,
      testName: test.name,
      category: test.category,
      price: test.price,
    }));
    setSearchTest(test.name);
    setShowTestSuggestions(false);
  };

  const handlePatientSelect = (patient: any) => {
    patientJustSelected.current = true;
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,          // MongoDB ObjectId — FK sent to API
      patientName: patient.name,
    }));
    setSearchPatient(patient.name);
    setSelectedPatientDisplay(patient.patientId || '');
    setShowPatientSuggestions(false);
    setFilteredPatients([]);
  };

  const handleDoctorSelect = (doctor: any) => {
    setFormData(prev => ({
      ...prev,
      orderedBy: doctor.name,
      orderedById: doctor.id || doctor._id || '',
    }));
    setSearchDoctor(doctor.name);
    setShowDoctorSuggestions(false);
  };

  const handleInputChange = (field: keyof PatientDiagnostic, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Attachment handling
  const getFileType = (mimeType: string): DiagnosticAttachment['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType === 'application/dicom') return 'dicom';
    return 'other';
  };

  const getFileIcon = (type: DiagnosticAttachment['type']) => {
    switch (type) {
      case 'image': return Image;
      case 'pdf': return File;
      default: return FileText;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File Too Large', description: `${file.name} exceeds 10MB limit.`, variant: 'destructive' });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: DiagnosticAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: getFileType(file.type),
          mimeType: file.type,
          size: file.size,
          url: reader.result as string,
          uploadedAt: new Date().toISOString(),
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) newErrors.patientId = 'Patient is required';
    if (!formData.testId) newErrors.testId = 'Test is required';
    if (!formData.orderedBy) newErrors.orderedBy = 'Ordering doctor is required';
    if (!scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Scheduled time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Print ────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const d = formData;
    const testPrep = availableTests.find(t => t.id === d.testId)?.preparation || '';
    const scheduledTime = d.scheduledTime
      ? (() => {
          const [h, m] = d.scheduledTime.split(':');
          const n = parseInt(h, 10);
          return `${n % 12 || 12}:${m} ${n >= 12 ? 'PM' : 'AM'}`;
        })()
      : '—';

    const priorityColor: Record<string, string> = {
      Emergency: '#dc2626',
      Urgent:    '#d97706',
      Routine:   '#2563eb',
    };
    const statusColor: Record<string, string> = {
      Completed: '#059669',
      Scheduled: '#2563eb',
      'In Progress': '#d97706',
      Cancelled: '#dc2626',
      Pending:   '#6b7280',
    };
    const pColor = priorityColor[d.priority || ''] || '#2563eb';
    const sColor = statusColor[d.status || ''] || '#6b7280';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Lab Test Requisition – ${d.testName || 'Diagnostic'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1f2937;
      font-size: 12px;
      line-height: 1.5;
      padding: 36px;
      background: #fff;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 16px;
      border-bottom: 3px solid #385a9f;
      margin-bottom: 20px;
    }
    .header-org { font-size: 20px; font-weight: 700; color: #385a9f; }
    .header-sub { font-size: 10px; color: #6b7280; margin-top: 2px; }
    .header-right { text-align: right; }
    .doc-title { font-size: 18px; font-weight: 700; color: #385a9f; letter-spacing: -0.3px; }
    .booking-id { font-size: 11px; color: #6b7280; margin-top: 2px; font-family: monospace; }
    .badges { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;
      border: 1px solid;
    }

    /* ── Two-col info grid ── */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      margin-bottom: 18px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .info-section {
      padding: 14px 16px;
    }
    .info-section:first-child {
      border-right: 1px solid #e5e7eb;
    }
    .section-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #385a9f;
      background: #eff6ff;
      margin: -14px -16px 10px;
      padding: 6px 16px;
      border-bottom: 1px solid #dbeafe;
    }
    .field { margin-bottom: 8px; }
    .field-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: #9ca3af; margin-bottom: 1px; }
    .field-value { font-size: 12px; font-weight: 500; color: #1f2937; }
    .field-value.large { font-size: 14px; font-weight: 700; }

    /* ── Full-width section ── */
    .full-section {
      margin-bottom: 14px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .full-section-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #385a9f;
      background: #eff6ff;
      padding: 6px 16px;
      border-bottom: 1px solid #dbeafe;
    }
    .full-section-body {
      padding: 12px 16px;
      font-size: 12px;
      color: #374151;
      line-height: 1.6;
    }

    /* ── Order row ── */
    .order-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 12px;
      padding: 12px 16px;
    }

    /* ── Price strip ── */
    .price-strip {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 16px;
      padding: 10px 16px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 14px;
    }
    .price-label { font-size: 11px; color: #6b7280; }
    .price-value { font-size: 18px; font-weight: 700; color: #385a9f; }

    /* ── Signature row ── */
    .sig-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }
    .sig-box { text-align: center; }
    .sig-line { border-top: 1px solid #374151; margin-bottom: 6px; }
    .sig-label { font-size: 9px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }

    /* ── Footer ── */
    .footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 9px;
      color: #9ca3af;
    }
    .footer span { margin: 0 6px; }

    @media print {
      body { padding: 16px; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="header-org">MedSystem</div>
      <div class="header-sub">Healthcare Management System</div>
    </div>
    <div class="header-right">
      <div class="doc-title">Lab Test Requisition</div>
      <div class="booking-id">${d.id ? `Booking #${d.id.slice(-8).toUpperCase()}` : 'New Requisition'}</div>
      <div class="badges">
        <span class="badge" style="color:${pColor};border-color:${pColor};background:${pColor}18">${d.priority || 'Routine'}</span>
        <span class="badge" style="color:${sColor};border-color:${sColor};background:${sColor}18">${d.status || 'Scheduled'}</span>
      </div>
    </div>
  </div>

  <!-- Patient + Test info -->
  <div class="info-grid">
    <div class="info-section">
      <div class="section-title">Patient Information</div>
      <div class="field">
        <div class="field-label">Full Name</div>
        <div class="field-value large">${d.patientName || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Patient ID</div>
        <div class="field-value">${selectedPatientDisplay || '—'}</div>
      </div>
    </div>
    <div class="info-section">
      <div class="section-title">Test Information</div>
      <div class="field">
        <div class="field-label">Test Name</div>
        <div class="field-value large">${d.testName || '—'}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="field">
          <div class="field-label">Category</div>
          <div class="field-value">${d.category || '—'}</div>
        </div>
        <div class="field">
          <div class="field-label">Department</div>
          <div class="field-value">${availableTests.find(t => t.id === d.testId)?.department || '—'}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Order details -->
  <div class="full-section">
    <div class="full-section-title">Order Details</div>
    <div class="order-grid">
      <div class="field">
        <div class="field-label">Ordered By</div>
        <div class="field-value">${d.orderedBy || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Ordered Date</div>
        <div class="field-value">${d.orderedDate || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Scheduled Date</div>
        <div class="field-value">${d.scheduledDate || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Scheduled Time</div>
        <div class="field-value">${scheduledTime}</div>
      </div>
    </div>
  </div>

  ${testPrep ? `
  <!-- Preparation Instructions -->
  <div class="full-section">
    <div class="full-section-title">Patient Preparation Instructions</div>
    <div class="full-section-body">${testPrep}</div>
  </div>
  ` : ''}

  ${d.notes ? `
  <!-- Special Notes -->
  <div class="full-section">
    <div class="full-section-title">Special Instructions / Notes</div>
    <div class="full-section-body">${d.notes}</div>
  </div>
  ` : ''}

  ${d.results ? `
  <!-- Results -->
  <div class="full-section">
    <div class="full-section-title">Test Results</div>
    <div class="full-section-body" style="white-space:pre-wrap">${d.results}</div>
  </div>
  ` : ''}

  <!-- Price -->
  <div class="price-strip">
    <div class="price-label">Test Fee</div>
    <div class="price-value">₹${(d.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
  </div>

  <!-- Signature row -->
  <div class="sig-row">
    <div class="sig-box">
      <div class="sig-line" style="margin-bottom:28px"></div>
      <div class="sig-label">Patient / Guardian Signature</div>
    </div>
    <div class="sig-box">
      <div class="sig-line" style="margin-bottom:28px"></div>
      <div class="sig-label">Ordering Physician</div>
    </div>
    <div class="sig-box">
      <div class="sig-line" style="margin-bottom:28px"></div>
      <div class="sig-label">Lab Technician</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Generated: ${new Date().toLocaleString('en-IN')}</span>
    <span>·</span>
    <span>This is a computer-generated document.</span>
    <span>·</span>
    <span>MedSystem Healthcare Management System</span>
  </div>

</body>
</html>`;

    const w = window.open('', '_blank', 'width=900,height=1000');
    if (!w) { toast({ title: 'Popup blocked', description: 'Please allow popups for this site to print.', variant: 'destructive' }); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        orderedDate: orderedDate ? orderedDate.toISOString().split('T')[0] : formData.orderedDate,
        scheduledDate: scheduledDate ? scheduledDate.toISOString().split('T')[0] : formData.scheduledDate,
        attachments,
      };
      
      if (isEditMode && diagnostic) {
        await onSave({ ...diagnostic, ...dataToSave } as PatientDiagnostic);
      } else {
        await onSave(dataToSave as Omit<PatientDiagnostic, 'id'>);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save diagnostic:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Scheduled': return 'pending';
      case 'Pending': return 'pending';
      case 'In Progress': return 'approved';
      case 'Completed': return 'delivered';
      case 'Cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      {(isEditMode || !diagnostic) && (
        <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {isSaving ? (
            <>
              <div className="animate-spin h-4 w-4 mr-1 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              {diagnostic ? 'Update' : 'Book'}
            </>
          )}
        </Button>
      )}

      {!isEditMode && diagnostic && (
        <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
          <Edit3 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}
    </div>
  );

  const quickActions = (
    <>
      <Button variant="ghost" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button variant="ghost" size="sm" onClick={handlePrint}>
        <FileText className="h-4 w-4 mr-2" />
        Export
      </Button>
    </>
  );

  if (!isOpen) return null;

  return (
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={diagnostic ? `Diagnostic Test ${diagnostic.id || ''}` : 'New Diagnostic Test'}
      subtitle={diagnostic ? `Patient: ${diagnostic.patientName} • Test: ${diagnostic.testName}` : 'Book a new diagnostic test'}
      icon={<Activity className="h-5 w-5 text-primary" />}
      status={formData.status}
      statusColor={getStatusColor(formData.status)}
      headerActions={headerActions}
      quickActions={quickActions}
      size="wide"
    >
      <div ref={containerRef}>

      {/* ── VIEW MODE ── Clean read-only display ── */}
      {diagnostic && !isEditMode ? (
        <div className="flex flex-col gap-5 p-6">

          {/* Stat cards row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Category', value: formData.category || '—', icon: Activity },
              { label: 'Priority', value: formData.priority || '—', icon: AlertCircle },
              { label: 'Price', value: `₹${(formData.price || 0).toLocaleString('en-IN')}`, icon: DollarSign },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-base font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Test Details */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Test Details</span>
            </div>
            {[
              ['Test Name', formData.testName],
              ['Test ID', formData.testId],
              ['Category', formData.category],
              ['Price', `₹${formData.price || 0}`],
            ].map(([label, value], i) => (
              <div key={label} className={`flex px-4 py-2.5 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{label}</span>
                <span className="text-xs font-semibold text-foreground">{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Patient Details */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Patient Information</span>
            </div>
            {[
              ['Patient Name', formData.patientName],
              ['Patient ID', formData.patientId],
            ].map(([label, value], i) => (
              <div key={label} className={`flex px-4 py-2.5 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{label}</span>
                <span className="text-xs font-semibold text-foreground">{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Schedule & Ordering */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Schedule & Ordering</span>
            </div>
            {[
              ['Ordered By', formData.orderedBy],
              ['Ordered Date', formData.orderedDate],
              ['Scheduled Date', formData.scheduledDate],
              ['Scheduled Time', formData.scheduledTime],
              ['Status', formData.status],
              ...(diagnostic.completedDate ? [['Completed Date', diagnostic.completedDate]] : []),
              ...(diagnostic.technician ? [['Technician', diagnostic.technician]] : []),
            ].map(([label, value], i) => (
              <div key={label} className={`flex px-4 py-2.5 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{label}</span>
                <span className="text-xs font-semibold text-foreground">{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Results (if completed) */}
          {diagnostic.results && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Results</span>
              </div>
              <div className="px-4 py-3 bg-card">
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{diagnostic.results}</p>
              </div>
            </div>
          )}

          {/* Attachments */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-primary/[0.06]">
              <div className="flex items-center gap-2">
                <Paperclip className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">
                  Attachments {attachments.length > 0 && `(${attachments.length})`}
                </span>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.dcm,application/dicom"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </Button>
              </div>
            </div>
            {attachments.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Paperclip className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No attachments yet</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Upload MRI scans, X-rays, lab reports, and more</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 h-7 text-xs gap-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3 w-3" />
                  Add Files
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {attachments.map((att, i) => {
                  const IconComponent = getFileIcon(att.type);
                  return (
                    <div key={att.id} className={`flex items-center gap-3 px-4 py-2.5 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                      {/* Thumbnail or icon */}
                      <div className="w-10 h-10 rounded border border-border flex items-center justify-center bg-muted/30 flex-shrink-0 overflow-hidden">
                        {att.type === 'image' ? (
                          <img src={att.url} alt={att.name} className="w-full h-full object-cover rounded" />
                        ) : (
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{att.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {att.type.toUpperCase()} · {formatFileSize(att.size)} · {new Date(att.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => setPreviewAttachment(att)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <a href={att.url} download={att.name} onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeAttachment(att.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          {formData.notes && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Notes & Instructions</span>
              </div>
              <div className="px-4 py-3 bg-card">
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{formData.notes}</p>
              </div>
            </div>
          )}
        </div>

      ) : !isNarrowLayout ? (
      /* ── EDIT/ADD MODE — Desktop 2-col layout ── */
      <div className="grid h-full" style={{ gridTemplateColumns: '35% 65%' }}>
        {/* Left Column - Test Summary & Patient Info */}
        <div className="flex flex-col gap-4 p-6 overflow-y-auto border-r border-border">

          {/* Test Summary */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Test Summary</span>
            </div>
            <div className="divide-y divide-border/50">
              <div className="flex justify-between items-center px-4 py-2.5 bg-card">
                <span className="text-xs text-muted-foreground">Test Name</span>
                <span className="text-xs font-medium text-foreground max-w-[60%] truncate text-right">{formData.testName || 'Not selected'}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 bg-primary/[0.02]">
                <span className="text-xs text-muted-foreground">Category</span>
                <span className="text-xs font-medium text-foreground">{formData.category || '—'}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 bg-card">
                <span className="text-xs text-muted-foreground">Price</span>
                <span className="text-xs font-medium text-foreground">₹{formData.price || 0}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-primary/[0.06]">
                <span className="text-[13px] font-semibold text-primary">Total</span>
                <span className="text-[15px] font-bold text-primary">₹{formData.price || 0}</span>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="rounded-lg border border-border overflow-visible">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Patient</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="patient" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  Search Patient
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="patient"
                    placeholder="Type name or patient ID…"
                    value={searchPatient}
                    onChange={(e) => {
                      setSearchPatient(e.target.value);
                      setShowPatientSuggestions(true);
                    }}
                    className={errors.patientId ? 'border-red-500' : ''}
                    autoComplete="off"
                  />
                  {searchPatient.trim().length >= 2 && (
                    <>
                      {isPatientsLoading && (
                        <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg px-3 py-2.5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            Loading patients…
                          </div>
                        </div>
                      )}
                      {!isPatientsLoading && showPatientSuggestions && filteredPatients.length > 0 && (
                        <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredPatients.map((patient) => (
                            <div
                              key={patient.id}
                              className="p-3 hover:bg-muted/80 cursor-pointer border-b border-border/50 last:border-b-0"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handlePatientSelect(patient);
                              }}
                            >
                              <div className="font-medium text-sm">{patient.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {patient.patientId}{patient.age > 0 ? ` · ${patient.age}y` : ''}{patient.gender ? `, ${patient.gender}` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {!isPatientsLoading && showPatientSuggestions && filteredPatients.length === 0 && (
                        <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg px-3 py-2.5">
                          <p className="text-xs text-muted-foreground">No patients found for "{searchPatient}"</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {errors.patientId && <p className="text-xs text-red-500 mt-1">{errors.patientId}</p>}
              </div>

              {formData.patientName && (
                <div className="rounded-lg border border-primary/20 bg-primary/[0.03] overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/10">
                    <User className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="text-xs font-semibold text-foreground">{formData.patientName}</span>
                  </div>
                  <div className="px-3 py-1.5">
                    <span className="text-[11px] text-muted-foreground">
                      {selectedPatientDisplay || 'Patient selected'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scheduling Details */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Schedule</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <Label htmlFor="orderedDate" className="text-xs font-medium text-muted-foreground">Ordered Date</Label>
                <div className="mt-1">
                  <DatePicker
                    date={orderedDate}
                    onDateChange={setOrderedDate}
                    placeholder="Select ordered date"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="scheduledDate" className="text-xs font-medium text-muted-foreground">Scheduled Date</Label>
                <div className="mt-1">
                  <DatePicker
                    date={scheduledDate}
                    onDateChange={setScheduledDate}
                    placeholder="Select scheduled date"
                  />
                </div>
                {errors.scheduledDate && <p className="text-xs text-red-500 mt-1">{errors.scheduledDate}</p>}
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Scheduled Time</Label>
                <div className="mt-1">
                  <TimePicker
                    value={formData.scheduledTime || ''}
                    onChange={(v) => handleInputChange('scheduledTime', v)}
                    placeholder="Select time"
                    hasError={!!errors.scheduledTime}
                  />
                </div>
                {errors.scheduledTime && <p className="text-xs text-red-500 mt-1">{errors.scheduledTime}</p>}
              </div>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Status & Priority</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <Label htmlFor="priority" className="text-xs font-medium text-muted-foreground">Priority</Label>
                <Select
                  value={formData.priority || 'Routine'}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">Status</Label>
                <Select
                  value={formData.status || 'Scheduled'}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Test Selection & Details */}
        <div className="flex flex-col gap-4 p-6 h-full overflow-y-auto">

          {/* Test Selection */}
          <div className="rounded-lg border border-border overflow-visible">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Test Selection</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="relative">
                <Label htmlFor="test" className="text-xs font-medium flex items-center gap-1">
                  <Search className="h-3 w-3 text-muted-foreground" />
                  Search Diagnostic Test
                </Label>
                <Input
                  id="test"
                  placeholder="Search test by name..."
                  value={searchTest}
                  onChange={(e) => {
                    setSearchTest(e.target.value);
                    setShowTestSuggestions(true);
                  }}
                  onFocus={() => setShowTestSuggestions(true)}
                  className={`mt-1 ${errors.testId ? 'border-red-500' : ''}`}
                />
                {showTestSuggestions && filteredTests.length > 0 && (
                  <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredTests.map((test) => (
                      <div
                        key={test.id}
                        className="p-3 hover:bg-muted/80 cursor-pointer border-b border-border/50 last:border-b-0"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleTestSelect(test);
                        }}
                      >
                        <div className="font-medium text-sm">{test.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {test.category} | ₹{test.price} | {test.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.testId && <p className="text-xs text-red-500 mt-1">{errors.testId}</p>}
              </div>

              {formData.testId && (
                <div className="rounded-lg border border-blue-200 overflow-hidden">
                  <div className="bg-blue-50 px-4 py-2.5 border-b border-blue-200 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">Selected Test</span>
                  </div>
                  <div className="px-4 py-3 space-y-1 bg-blue-50/30">
                    <p className="text-xs font-semibold text-foreground">{formData.testName}</p>
                    <p className="text-xs text-muted-foreground">{formData.category} · ₹{formData.price}</p>
                    {availableTests.find(t => t.id === formData.testId)?.preparation && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Prep:</strong> {availableTests.find(t => t.id === formData.testId)?.preparation}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Information */}
          <div className="rounded-lg border border-border overflow-visible">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Doctor</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="relative">
                <Label htmlFor="orderedBy" className="text-xs font-medium text-muted-foreground">
                  Ordered By (Doctor) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="orderedBy"
                  placeholder="Search doctor by name or specialization..."
                  value={searchDoctor}
                  onChange={(e) => {
                    setSearchDoctor(e.target.value);
                    setShowDoctorSuggestions(true);
                  }}
                  onFocus={() => setShowDoctorSuggestions(true)}
                  className={`mt-1 ${errors.orderedBy ? 'border-red-500' : ''}`}
                />
                {showDoctorSuggestions && filteredDoctors.length > 0 && (
                  <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="p-3 hover:bg-muted/80 cursor-pointer border-b border-border/50 last:border-b-0"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleDoctorSelect(doctor);
                        }}
                      >
                        <div className="font-medium text-sm">{doctor.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {doctor.specialisation || 'General'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.orderedBy && <p className="text-xs text-red-500 mt-1">{errors.orderedBy}</p>}
              </div>
            </div>
          </div>

          {/* Notes & Instructions */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Notes & Instructions</span>
            </div>
            <div className="p-4">
              <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground">Special Instructions</Label>
              <Textarea
                id="notes"
                placeholder="Enter any special instructions or notes..."
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>
      ) : (
        /* ── EDIT/ADD MODE — Narrow / mobile layout ── */
        <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">

          {/* Test Summary */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Test Summary</span>
            </div>
            <div className="divide-y divide-border/50">
              <div className="flex justify-between items-center px-4 py-2.5 bg-card">
                <span className="text-xs text-muted-foreground">Test Name</span>
                <span className="text-xs font-medium text-foreground max-w-[60%] truncate text-right">{formData.testName || 'Not selected'}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 bg-primary/[0.02]">
                <span className="text-xs text-muted-foreground">Category</span>
                <span className="text-xs font-medium text-foreground">{formData.category || '—'}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 bg-card">
                <span className="text-xs text-muted-foreground">Price</span>
                <span className="text-xs font-medium text-foreground">₹{formData.price || 0}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-primary/[0.06]">
                <span className="text-[13px] font-semibold text-primary">Total</span>
                <span className="text-[15px] font-bold text-primary">₹{formData.price || 0}</span>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="rounded-lg border border-border overflow-visible">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Patient</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Search Patient</Label>
                <div className="relative mt-1">
                  <Input
                    placeholder="Search patient by name or ID..."
                    value={searchPatient}
                    onChange={(e) => { setSearchPatient(e.target.value); setShowPatientSuggestions(true); }}
                    onFocus={() => setShowPatientSuggestions(true)}
                    className={errors.patientId ? 'border-red-500' : ''}
                  />
                  {showPatientSuggestions && filteredPatients.length > 0 && (
                    <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <div key={patient.id} className="p-3 hover:bg-muted/80 cursor-pointer border-b border-border/50 last:border-b-0"
                          onMouseDown={(e) => { e.preventDefault(); handlePatientSelect(patient); }}>
                          <div className="font-medium text-sm">{patient.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {patient.patientId} | {patient.age}y, {patient.gender}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.patientId && <p className="text-xs text-red-500 mt-1">{errors.patientId}</p>}
              </div>
              {formData.patientName && (
                <div className="rounded-lg border border-primary/20 bg-primary/[0.03] overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/10">
                    <User className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="text-xs font-semibold text-foreground">{formData.patientName}</span>
                  </div>
                  <div className="px-3 py-1.5">
                    <span className="text-[11px] text-muted-foreground">
                      {selectedPatientDisplay || 'Patient selected'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Test Selection */}
          <div className="rounded-lg border border-border overflow-visible">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Test Selection</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="relative">
                <Label className="text-xs font-medium text-muted-foreground">Search Diagnostic Test</Label>
                <Input
                  placeholder="Search test by name..."
                  value={searchTest}
                  onChange={(e) => { setSearchTest(e.target.value); setShowTestSuggestions(true); }}
                  onFocus={() => setShowTestSuggestions(true)}
                  className={`mt-1 ${errors.testId ? 'border-red-500' : ''}`}
                />
                {showTestSuggestions && filteredTests.length > 0 && (
                  <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredTests.map((test) => (
                      <div key={test.id} className="p-3 hover:bg-muted/80 cursor-pointer border-b border-border/50 last:border-b-0"
                        onMouseDown={(e) => { e.preventDefault(); handleTestSelect(test); }}>
                        <div className="font-medium text-sm">{test.name}</div>
                        <div className="text-xs text-muted-foreground">{test.category} | ₹{test.price} | {test.duration}</div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.testId && <p className="text-xs text-red-500 mt-1">{errors.testId}</p>}
              </div>
              {formData.testId && (
                <div className="rounded-lg border border-blue-200 overflow-hidden">
                  <div className="bg-blue-50 px-4 py-2.5 border-b border-blue-200 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">Selected Test</span>
                  </div>
                  <div className="px-4 py-3 space-y-1 bg-blue-50/30">
                    <p className="text-xs font-semibold text-foreground truncate">{formData.testName}</p>
                    <p className="text-xs text-muted-foreground">{formData.category} · ₹{formData.price}</p>
                    {availableTests.find(t => t.id === formData.testId)?.preparation && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        <strong>Prep:</strong> {availableTests.find(t => t.id === formData.testId)?.preparation}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Information */}
          <div className="rounded-lg border border-border overflow-visible">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Doctor</span>
            </div>
            <div className="p-4">
              <Label className="text-xs font-medium text-muted-foreground">
                Ordered By (Doctor) <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Input
                  placeholder="Search doctor by name or specialization..."
                  value={searchDoctor}
                  onChange={(e) => {
                    setSearchDoctor(e.target.value);
                    setShowDoctorSuggestions(true);
                  }}
                  onFocus={() => setShowDoctorSuggestions(true)}
                  className={errors.orderedBy ? 'border-red-500' : ''}
                />
                {showDoctorSuggestions && filteredDoctors.length > 0 && (
                  <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="p-3 hover:bg-muted/80 cursor-pointer border-b border-border/50 last:border-b-0"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleDoctorSelect(doctor);
                        }}
                      >
                        <div className="font-medium text-sm">{doctor.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {doctor.specialisation || 'General'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.orderedBy && <p className="text-xs text-red-500 mt-1">{errors.orderedBy}</p>}
            </div>
          </div>

          {/* Scheduling Details */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Schedule</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Ordered Date</Label>
                <div className="mt-1">
                  <DatePicker date={orderedDate} onDateChange={setOrderedDate} placeholder="Select ordered date" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Scheduled Date</Label>
                <div className="mt-1">
                  <DatePicker date={scheduledDate} onDateChange={setScheduledDate} placeholder="Select scheduled date" />
                </div>
                {errors.scheduledDate && <p className="text-xs text-red-500 mt-1">{errors.scheduledDate}</p>}
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Scheduled Time</Label>
                <Input
                  type="time"
                  value={formData.scheduledTime || ''}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  className={`mt-1 ${errors.scheduledTime ? 'border-red-500' : ''}`}
                />
                {errors.scheduledTime && <p className="text-xs text-red-500 mt-1">{errors.scheduledTime}</p>}
              </div>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Status & Priority</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
                <Select value={formData.priority || 'Routine'} onValueChange={(v) => handleInputChange('priority', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <Select value={formData.status || 'Scheduled'} onValueChange={(v) => handleInputChange('status', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes & Instructions */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Notes & Instructions</span>
            </div>
            <div className="p-4">
              <Label className="text-xs font-medium text-muted-foreground">Special Instructions</Label>
              <Textarea
                placeholder="Enter any special instructions or notes..."
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="mt-1 resize-none"
              />
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewAttachment(null)}>
          <div className="relative max-w-4xl max-h-[90vh] bg-background rounded-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground truncate">{previewAttachment.name}</span>
                <Badge variant="outline" className="text-[10px] flex-shrink-0">{previewAttachment.type.toUpperCase()}</Badge>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={previewAttachment.url} download={previewAttachment.name}>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Download className="h-3 w-3" /> Download
                  </Button>
                </a>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPreviewAttachment(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-56px)] flex items-center justify-center p-4">
              {previewAttachment.type === 'image' ? (
                <img src={previewAttachment.url} alt={previewAttachment.name} className="max-w-full max-h-[80vh] object-contain rounded" />
              ) : previewAttachment.type === 'pdf' ? (
                <iframe src={previewAttachment.url} className="w-full h-[80vh] rounded" title={previewAttachment.name} />
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
                  <a href={previewAttachment.url} download={previewAttachment.name}>
                    <Button variant="outline" size="sm" className="mt-4 gap-1">
                      <Download className="h-3.5 w-3.5" /> Download File
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {diagnostic && showPreview && (
        <DocumentPreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          doc={{
            documentType: 'Diagnostic Report',
            documentNumber: diagnostic.id || '—',
            status: diagnostic.status,
            partyLabel: 'Patient',
            partyName: diagnostic.patientName,
            details: [
              { label: 'Patient ID', value: diagnostic.patientId || '—' },
              { label: 'Ordered By', value: diagnostic.orderedBy || '—' },
              { label: 'Ordered Date', value: diagnostic.orderedDate || '—' },
              { label: 'Scheduled', value: `${diagnostic.scheduledDate || '—'} ${diagnostic.scheduledTime || ''}`.trim() },
              { label: 'Priority', value: diagnostic.priority || '—' },
              { label: 'Category', value: diagnostic.category || '—' },
              ...(diagnostic.completedDate ? [{ label: 'Completed', value: diagnostic.completedDate }] : []),
              ...(diagnostic.technician ? [{ label: 'Technician', value: diagnostic.technician }] : []),
            ],
            lineItems: [
              {
                description: diagnostic.testName,
                quantity: 1,
                unitPrice: diagnostic.price,
                amount: diagnostic.price,
              },
            ],
            subtotal: diagnostic.price,
            grandTotal: diagnostic.price,
            notes: [diagnostic.notes, diagnostic.results ? `Results: ${diagnostic.results}` : ''].filter(Boolean).join('\n') || undefined,
            footerText: 'This is a computer-generated diagnostic report.',
          }}
        />
      )}
    </ModernInventoryOverlay>
  );
};
