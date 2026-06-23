// Diagnostics Service - Handles diagnostic tests and lab work
import apiClient from '@/lib/api-client';
import * as patientService from './patientService';
import * as doctorService from './doctorService';

export interface DiagnosticTest {
  id: string;
  name: string;
  category: 'Blood Test' | 'Radiology' | 'Pathology' | 'Cardiology' | 'Ultrasound' | 'MRI' | 'CT Scan' | 'X-Ray' | 'Other';
  price: number;
  duration: string; // e.g., "30 minutes", "1 hour"
  preparation?: string;
  department: string;
  description?: string;
}

export interface DiagnosticAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'dicom' | 'other';
  mimeType: string;
  size: number;
  url: string; // data URL or remote URL
  uploadedAt: string;
  description?: string;
}

export interface PatientDiagnostic {
  id: string;
  patientId: string;
  patientName: string;
  testId: string;
  testName: string;
  category: string;
  orderedBy: string;
  orderedById?: string;
  orderedDate: string;
  scheduledDate?: string;
  scheduledTime?: string;
  completedDate?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Pending';
  priority: 'Routine' | 'Urgent' | 'Emergency';
  price: number;
  results?: string;
  notes?: string;
  technician?: string;
  attachments?: DiagnosticAttachment[];
}

const BOOKING_STATUS_MAP: Record<string, PatientDiagnostic['status']> = {
  ordered: 'Pending',
  pending: 'Pending',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  'in progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const PRIORITY_MAP: Record<string, PatientDiagnostic['priority']> = {
  routine: 'Routine',
  urgent: 'Urgent',
  emergency: 'Emergency',
  stat: 'Emergency',
};

function mapTest(raw: any): DiagnosticTest {
  return {
    id: raw._id || raw.id || raw.test_code || '',
    name: raw.name || '',
    category: (raw.category as DiagnosticTest['category']) || 'Other',
    price: raw.price ?? 0,
    duration: raw.duration_minutes ? `${raw.duration_minutes} minutes` : (raw.duration || ''),
    preparation: raw.preparation_instructions || raw.preparation,
    department: raw.department || '',
    description: raw.description,
  };
}

function resolvePatientName(raw: any): string {
  const p = raw.patient_id;
  if (p && typeof p === 'object') {
    if (p.name) return p.name;
    if (p.full_name) return p.full_name;
    if (p.first_name || p.last_name) return `${p.first_name || ''} ${p.last_name || ''}`.trim();
  }
  return raw.patient_name || raw.patientName || '';
}

function resolveTestName(raw: any): string {
  const t = raw.test_id;
  if (t && typeof t === 'object' && t.name) return t.name;
  return raw.test_name || raw.testName || '';
}

function resolveCategory(raw: any): string {
  const t = raw.test_id;
  if (t && typeof t === 'object' && t.category) return t.category;
  return raw.category || '';
}

function resolveDoctorName(raw: any): string {
  const d = raw.ordered_by_doctor_id;
  if (d && typeof d === 'object') {
    return d.name || d.full_name || '';
  }
  return raw.ordered_by_name || raw.orderedBy || '';
}

function mapBooking(raw: any): PatientDiagnostic {
  const status = BOOKING_STATUS_MAP[String(raw.status || '').toLowerCase()] || 'Pending';
  const priority = PRIORITY_MAP[String(raw.priority || '').toLowerCase()] || 'Routine';
  const patientRef = raw.patient_id;
  const testRef = raw.test_id;
  const doctorRef = raw.ordered_by_doctor_id;

  // Resolve patient ID first
  const patientId = (patientRef && typeof patientRef === 'object') ? (patientRef._id || '') : (patientRef || raw.patientId || '');

  // Try to get properly formatted patient name from populated object first
  let patientName = '';
  if (patientRef && typeof patientRef === 'object') {
    // If we have a populated patient object with name fields, construct from first/last names (these will be decrypted by backend if needed)
    if (patientRef.name) {
      patientName = patientRef.name;
    } else if (patientRef.full_name) {
      patientName = patientRef.full_name;
    } else if (patientRef.first_name || patientRef.last_name) {
      patientName = `${patientRef.first_name || ''} ${patientRef.last_name || ''}`.trim();
    }
  }

  // Fall back to other sources if not found
  if (!patientName) {
    patientName = raw.patient_name || raw.patientName || '';
  }

  return {
    id: raw._id || raw.id || raw.booking_number || '',
    patientId,
    patientName,
    testId: (testRef && typeof testRef === 'object') ? (testRef._id || '') : (testRef || raw.testId || ''),
    testName: resolveTestName(raw),
    category: resolveCategory(raw),
    orderedBy: resolveDoctorName(raw),
    orderedById: (() => {
      const d = raw.ordered_by_doctor_id;
      if (d && typeof d === 'object') return d._id || '';
      return d || raw.orderedById || '';
    })(),
    orderedDate: raw.ordered_date ? raw.ordered_date.split('T')[0] : (raw.orderedDate || ''),
    scheduledDate: raw.scheduled_date ? raw.scheduled_date.split('T')[0] : raw.scheduledDate,
    scheduledTime: raw.scheduled_time || raw.scheduledTime,
    completedDate: raw.completed_date ? raw.completed_date.split('T')[0] : raw.completedDate,
    status,
    priority,
    price: raw.price ?? 0,
    results: raw.results,
    notes: raw.notes,
    technician: raw.technician,
    attachments: raw.attachments || [],
  };
}

/**
 * Fetch diagnostic tests with pagination
 * GET /diagnostics/tests?page=1&limit=50
 */
export const fetchDiagnosticTests = async (page = 1, limit = 25): Promise<{ data: DiagnosticTest[]; total: number; page: number; limit: number }> => {
  const response = await apiClient.get('/diagnostics/tests', { params: { page, limit } });
  const raw = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return {
    data: raw.map(mapTest),
    total: response.data?.total ?? raw.length,
    page: response.data?.page ?? page,
    limit: response.data?.limit ?? limit,
  };
};

/**
 * Search diagnostic tests
 * GET /diagnostics/tests?search=X
 */
export const searchDiagnosticTests = async (query: string): Promise<DiagnosticTest[]> => {
  const response = await apiClient.get('/diagnostics/tests', { params: { search: query, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapTest);
};

/**
 * Get diagnostic test by ID
 * GET /diagnostics/tests/:id
 */
export const getDiagnosticTestById = async (id: string): Promise<DiagnosticTest | null> => {
  try {
    const response = await apiClient.get(`/diagnostics/tests/${id}`);
    return mapTest(response.data);
  } catch {
    return null;
  }
};

/**
 * Fetch diagnostics for a specific patient
 * GET /diagnostics/bookings?patient_id=X
 */
export const fetchPatientDiagnostics = async (patientId: string): Promise<PatientDiagnostic[]> => {
  const response = await apiClient.get('/diagnostics/bookings', { params: { patient_id: patientId } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapBooking);
};

/**
 * Fetch all patient diagnostics
 * GET /diagnostics/bookings?limit=200
 */
function looksEncrypted(s: string): boolean {
  return /^[0-9a-f]{8,}:[0-9a-f]/i.test(s);
}

export const fetchAllPatientDiagnostics = async (page = 1, limit = 25): Promise<{ data: PatientDiagnostic[]; total: number; page: number; limit: number }> => {
  const response = await apiClient.get('/diagnostics/bookings', { params: { page, limit } });
  const raw = Array.isArray(response.data) ? response.data : response.data?.data || [];
  const bookings = raw.map(mapBooking);

  // Batch-resolve encrypted patient names
  const encryptedPatientIds = [...new Set(
    bookings.filter(b => b.patientId && looksEncrypted(b.patientName)).map(b => b.patientId)
  )];

  // Batch-resolve encrypted doctor names (ordered_by field)
  const encryptedDoctorIds = [...new Set(
    bookings.filter(b => b.orderedById && looksEncrypted(b.orderedBy)).map(b => b.orderedById as string)
  )];

  const resolvedPatients: Record<string, string> = {};
  const resolvedDoctors: Record<string, string> = {};

  await Promise.all([
    ...encryptedPatientIds.map(async id => {
      try {
        const patient = await patientService.fetchPatientById(id);
        if (patient?.name) resolvedPatients[id] = patient.name;
      } catch { /* skip */ }
    }),
    ...encryptedDoctorIds.map(async id => {
      try {
        const doctor = await doctorService.getDoctorById(id);
        if (doctor?.name) resolvedDoctors[id] = doctor.name;
      } catch { /* skip */ }
    }),
  ]);

  return {
    data: bookings.map(b => ({
      ...b,
      patientName: (b.patientId && resolvedPatients[b.patientId]) || b.patientName,
      orderedBy:   (b.orderedById && resolvedDoctors[b.orderedById as string]) || b.orderedBy,
    })),
    total: response.data?.total ?? raw.length,
    page: response.data?.page ?? page,
    limit: response.data?.limit ?? limit,
  };
};

/**
 * Book a diagnostic test for a patient
 * POST /diagnostics/bookings
 */
export const bookDiagnosticTest = async (diagnostic: Omit<PatientDiagnostic, 'id'>): Promise<PatientDiagnostic> => {
  const body = {
    patient_id: diagnostic.patientId,
    test_id: diagnostic.testId,
    ordered_by_doctor_id: diagnostic.orderedById || diagnostic.orderedBy,
    ordered_date: diagnostic.orderedDate,
    scheduled_date: diagnostic.scheduledDate,
    scheduled_time: diagnostic.scheduledTime,
    status: diagnostic.status.toLowerCase().replace(' ', '_'),
    priority: diagnostic.priority.toLowerCase(),
    price: diagnostic.price,
    notes: diagnostic.notes,
  };
  const response = await apiClient.post('/diagnostics/bookings', body);
  return mapBooking(response.data);
};

/**
 * Update patient diagnostic
 * PATCH /diagnostics/bookings/:id
 */
export const updatePatientDiagnostic = async (id: string, updates: Partial<PatientDiagnostic>): Promise<PatientDiagnostic> => {
  const body: any = {};
  if (updates.status !== undefined) body.status = updates.status.toLowerCase().replace(' ', '_');
  if (updates.priority !== undefined) body.priority = updates.priority.toLowerCase();
  if (updates.scheduledDate !== undefined) body.scheduled_date = updates.scheduledDate;
  if (updates.scheduledTime !== undefined) body.scheduled_time = updates.scheduledTime;
  if (updates.results !== undefined) body.results = updates.results;
  if (updates.notes !== undefined) body.notes = updates.notes;
  if (updates.technician !== undefined) body.technician = updates.technician;
  if (updates.attachments !== undefined) body.attachments = updates.attachments;
  const response = await apiClient.patch(`/diagnostics/bookings/${id}`, body);
  return mapBooking(response.data);
};

/**
 * Cancel diagnostic test
 * PATCH /diagnostics/bookings/:id with status=cancelled
 */
export const cancelDiagnosticTest = async (id: string): Promise<void> => {
  await apiClient.patch(`/diagnostics/bookings/${id}`, { status: 'cancelled' });
};

/**
 * Get diagnostic statistics
 * GET /diagnostics/bookings/stats
 */
export const getDiagnosticStats = async () => {
  const response = await apiClient.get('/diagnostics/bookings/stats');
  return response.data;
};

/**
 * Create a new diagnostic test in the catalog
 * POST /diagnostics/tests
 */
export const createDiagnosticTest = async (test: Omit<DiagnosticTest, 'id'>): Promise<DiagnosticTest> => {
  const body: any = {
    test_code: (test as any).testCode || `TST-${Date.now()}`,
    name: test.name,
    category: test.category,
    price: test.price,
    duration_minutes: test.duration ? parseInt(test.duration) || undefined : undefined,
    preparation_instructions: test.preparation,
    department: test.department,
    description: test.description,
    is_active: true,
  };
  const response = await apiClient.post('/diagnostics/tests', body);
  return mapTest(response.data);
};

/**
 * Update a diagnostic test in the catalog
 * PATCH /diagnostics/tests/:id
 */
export const updateDiagnosticTest = async (id: string, updates: Partial<DiagnosticTest>): Promise<DiagnosticTest> => {
  const body: any = {};
  if (updates.name !== undefined) body.name = updates.name;
  if (updates.category !== undefined) body.category = updates.category;
  if (updates.price !== undefined) body.price = updates.price;
  if (updates.duration !== undefined) body.duration_minutes = parseInt(updates.duration) || undefined;
  if (updates.preparation !== undefined) body.preparation_instructions = updates.preparation;
  if (updates.department !== undefined) body.department = updates.department;
  if (updates.description !== undefined) body.description = updates.description;
  const response = await apiClient.patch(`/diagnostics/tests/${id}`, body);
  return mapTest(response.data);
};

/**
 * Delete a diagnostic test from the catalog
 * DELETE /diagnostics/tests/:id
 */
export const deleteDiagnosticTest = async (id: string): Promise<void> => {
  await apiClient.delete(`/diagnostics/tests/${id}`);
};
