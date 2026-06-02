// Diagnostics Service - Handles diagnostic tests and lab work
import apiClient from '@/lib/api-client';

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
  return {
    id: raw._id || raw.id || raw.booking_number || '',
    patientId: (patientRef && typeof patientRef === 'object') ? (patientRef._id || '') : (patientRef || raw.patientId || ''),
    patientName: resolvePatientName(raw),
    testId: (testRef && typeof testRef === 'object') ? (testRef._id || '') : (testRef || raw.testId || ''),
    testName: resolveTestName(raw),
    category: resolveCategory(raw),
    orderedBy: resolveDoctorName(raw),
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
export const fetchDiagnosticTests = async (page: number = 1, limit: number = 50): Promise<DiagnosticTest[]> => {
  const response = await apiClient.get('/diagnostics/tests', { params: { page, limit } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapTest);
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
export const fetchAllPatientDiagnostics = async (): Promise<PatientDiagnostic[]> => {
  const response = await apiClient.get('/diagnostics/bookings', { params: { limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapBooking);
};

/**
 * Book a diagnostic test for a patient
 * POST /diagnostics/bookings
 */
export const bookDiagnosticTest = async (diagnostic: Omit<PatientDiagnostic, 'id'>): Promise<PatientDiagnostic> => {
  const body = {
    patient_id: diagnostic.patientId,
    test_id: diagnostic.testId,
    ordered_by_doctor_id: diagnostic.orderedBy,
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
