// Patient Service - Handles all patient-related API calls
import apiClient from '@/lib/api-client';

export interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  lastVisit: string;
  status: 'Active' | 'Admitted' | 'Discharged' | 'Critical';
  doctor: string;
  department: string;
  // Tracking codes
  barcode?: string;
  barcodeType?: string;
  qrCode?: string;
  rfidTag?: string;
  trackingEnabled?: boolean;
  // Room assignment
  assignedRoom?: string;
  roomNumber?: string;
  roomType?: string;
  admissionDate?: string;
}

const STATUS_MAP: Record<string, Patient['status']> = {
  active: 'Active',
  admitted: 'Admitted',
  discharged: 'Discharged',
  deceased: 'Critical',
  critical: 'Critical',
};

function computeAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function mapPatient(raw: any): Patient {
  const status = STATUS_MAP[String(raw.status || '').toLowerCase()] || 'Active';
  return {
    id: raw._id || raw.id || '',
    patientId: raw.patient_id || '',
    name: [raw.first_name, raw.last_name].filter(Boolean).join(' '),
    age: computeAge(raw.dob),
    gender: raw.gender || '',
    phone: raw.phone || '',
    email: raw.email || '',
    address: raw.address || '',
    bloodGroup: raw.blood_group || '',
    lastVisit: raw.updatedAt ? raw.updatedAt.split('T')[0] : '',
    status,
    doctor: '',
    department: raw.department || '',
    barcode: raw.barcode,
    rfidTag: raw.rfid_tag,
    trackingEnabled: !!(raw.barcode || raw.rfid_tag),
  };
}

/**
 * Fetch patients with pagination
 * GET /patients?page=1&limit=50
 */
export const fetchPatients = async (page: number = 1, limit: number = 50): Promise<Patient[]> => {
  const response = await apiClient.get('/patients', { params: { page, limit } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapPatient);
};

/**
 * Fetch a single patient by ID
 * GET /patients/:id
 */
export const fetchPatientById = async (id: string): Promise<Patient | null> => {
  try {
    const response = await apiClient.get(`/patients/${id}`);
    return mapPatient(response.data);
  } catch {
    return null;
  }
};

/**
 * Create a new patient
 * POST /patients
 */
export const createPatient = async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
  const nameParts = patient.name.split(' ');
  const body = {
    first_name: nameParts[0] || '',
    last_name: nameParts.slice(1).join(' ') || '',
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email,
    address: patient.address,
    blood_group: patient.bloodGroup,
    department: patient.department,
    barcode: patient.barcode,
    rfid_tag: patient.rfidTag,
  };
  const response = await apiClient.post('/patients', body);
  return mapPatient(response.data);
};

/**
 * Update an existing patient
 * PATCH /patients/:id
 */
export const updatePatient = async (id: string, patient: Partial<Patient>): Promise<Patient | null> => {
  try {
    const body: any = {};
    if (patient.name !== undefined) {
      const parts = patient.name.split(' ');
      body.first_name = parts[0] || '';
      body.last_name = parts.slice(1).join(' ') || '';
    }
    if (patient.gender !== undefined) body.gender = patient.gender;
    if (patient.phone !== undefined) body.phone = patient.phone;
    if (patient.email !== undefined) body.email = patient.email;
    if (patient.address !== undefined) body.address = patient.address;
    if (patient.bloodGroup !== undefined) body.blood_group = patient.bloodGroup;
    if (patient.department !== undefined) body.department = patient.department;
    if (patient.barcode !== undefined) body.barcode = patient.barcode;
    if (patient.rfidTag !== undefined) body.rfid_tag = patient.rfidTag;
    if (patient.status !== undefined) {
      const reverseStatus: Record<string, string> = {
        Active: 'active', Admitted: 'admitted', Discharged: 'discharged', Critical: 'critical',
      };
      body.status = reverseStatus[patient.status] || patient.status.toLowerCase();
    }
    const response = await apiClient.patch(`/patients/${id}`, body);
    return mapPatient(response.data);
  } catch {
    return null;
  }
};

/**
 * Delete a patient
 * DELETE /patients/:id
 */
export const deletePatient = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/patients/${id}`);
    return true;
  } catch {
    return false;
  }
};

/**
 * Fetch patient statistics
 * GET /patients/stats
 */
export const fetchPatientStats = async () => {
  const response = await apiClient.get('/patients/stats');
  return response.data;
};

/**
 * Search patients by query
 * GET /patients?search=X
 */
export const searchPatients = async (query: string): Promise<Patient[]> => {
  const response = await apiClient.get('/patients', { params: { search: query, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapPatient);
};

/**
 * Get patients by status
 * GET /patients?status=X
 */
export const getPatientsByStatus = async (status: string): Promise<Patient[]> => {
  if (status === 'All') return fetchPatients(1, 100);
  const reverseStatus: Record<string, string> = {
    Active: 'active', Admitted: 'admitted', Discharged: 'discharged', Critical: 'critical',
  };
  const backendStatus = reverseStatus[status] || status.toLowerCase();
  const response = await apiClient.get('/patients', { params: { status: backendStatus, page: 1, limit: 100 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapPatient);
};

/**
 * Get patients by department
 * GET /patients?department=X
 */
export const getPatientsByDepartment = async (department: string): Promise<Patient[]> => {
  const response = await apiClient.get('/patients', { params: { department, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapPatient);
};
