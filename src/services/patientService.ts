// Patient Service - Handles all patient-related API calls
// This service provides CRUD operations and statistics for patient management

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

// Mock data for development
const mockPatients: Patient[] = [
  {
    id: '1',
    patientId: 'P001',
    name: 'John Smith',
    age: 45,
    gender: 'Male',
    phone: '+1-555-0123',
    email: 'john.smith@email.com',
    address: '123 Main St, City, State 12345',
    bloodGroup: 'O+',
    lastVisit: '2024-01-15',
    status: 'Active',
    doctor: 'Dr. Sarah Johnson',
    department: 'Cardiology',
    barcode: '1001234567890',
    barcodeType: 'CODE-128',
    qrCode: 'QR-PAT-001',
    rfidTag: 'RFID1234567890ABCDEF01',
    trackingEnabled: true
  },
  {
    id: '2',
    patientId: 'P002',
    name: 'Emily Davis',
    age: 32,
    gender: 'Female',
    phone: '+1-555-0124',
    email: 'emily.davis@email.com',
    address: '456 Oak Ave, City, State 12345',
    bloodGroup: 'A-',
    lastVisit: '2024-01-16',
    status: 'Active',
    doctor: 'Dr. Michael Brown',
    department: 'Orthopedics'
  },
  {
    id: '3',
    patientId: 'P003',
    name: 'Robert Wilson',
    age: 67,
    gender: 'Male',
    phone: '+1-555-0125',
    email: 'robert.wilson@email.com',
    address: '789 Pine St, City, State 12345',
    bloodGroup: 'B+',
    lastVisit: '2024-01-17',
    status: 'Discharged',
    doctor: 'Dr. Lisa Anderson',
    department: 'Emergency'
  },
  {
    id: '4',
    patientId: 'P004',
    name: 'Sarah Miller',
    age: 28,
    gender: 'Female',
    phone: '+1-555-0126',
    email: 'sarah.miller@email.com',
    address: '321 Elm St, City, State 12345',
    bloodGroup: 'AB+',
    lastVisit: '2024-01-18',
    status: 'Admitted',
    doctor: 'Dr. James Wilson',
    department: 'General Medicine'
  },
  {
    id: '5',
    patientId: 'P005',
    name: 'Michael Brown',
    age: 55,
    gender: 'Male',
    phone: '+1-555-0127',
    email: 'michael.brown@email.com',
    address: '654 Maple Ave, City, State 12345',
    bloodGroup: 'O-',
    lastVisit: '2024-01-19',
    status: 'Critical',
    doctor: 'Dr. Emma Thompson',
    department: 'ICU'
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all patients
 * TODO: Replace with actual API call
 */
export const fetchPatients = async (): Promise<Patient[]> => {
  await delay(500);
  // TODO: Replace with actual API call
  // const response = await fetch('/api/patients');
  // return response.json();
  return [...mockPatients];
};

/**
 * Fetch a single patient by ID
 * TODO: Replace with actual API call
 */
export const fetchPatientById = async (id: string): Promise<Patient | null> => {
  await delay(300);
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/patients/${id}`);
  // return response.json();
  return mockPatients.find(patient => patient.id === id) || null;
};

/**
 * Create a new patient
 * TODO: Replace with actual API call
 */
export const createPatient = async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
  await delay(400);
  // TODO: Replace with actual API call
  // const response = await fetch('/api/patients', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(patient)
  // });
  // return response.json();
  
  const newPatient: Patient = {
    ...patient,
    id: `${mockPatients.length + 1}`
  };
  mockPatients.push(newPatient);
  return newPatient;
};

/**
 * Update an existing patient
 * TODO: Replace with actual API call
 */
export const updatePatient = async (id: string, patient: Partial<Patient>): Promise<Patient | null> => {
  await delay(400);
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/patients/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(patient)
  // });
  // return response.json();
  
  const index = mockPatients.findIndex(p => p.id === id);
  if (index !== -1) {
    mockPatients[index] = { ...mockPatients[index], ...patient };
    return mockPatients[index];
  }
  return null;
};

/**
 * Delete a patient
 * TODO: Replace with actual API call
 */
export const deletePatient = async (id: string): Promise<boolean> => {
  await delay(300);
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
  // return response.ok;
  
  const index = mockPatients.findIndex(p => p.id === id);
  if (index !== -1) {
    mockPatients.splice(index, 1);
    return true;
  }
  return false;
};

/**
 * Fetch patient statistics
 * TODO: Replace with actual API call
 */
export const fetchPatientStats = async () => {
  await delay(400);
  // TODO: Replace with actual API call
  // const response = await fetch('/api/patients/stats');
  // return response.json();
  
  const totalPatients = mockPatients.length;
  const activePatients = mockPatients.filter(p => p.status === 'Active').length;
  const admittedPatients = mockPatients.filter(p => p.status === 'Admitted').length;
  const dischargedPatients = mockPatients.filter(p => p.status === 'Discharged').length;
  const criticalPatients = mockPatients.filter(p => p.status === 'Critical').length;
  
  const departments = [...new Set(mockPatients.map(p => p.department))];
  const totalDepartments = departments.length;
  
  const bloodGroups = [...new Set(mockPatients.map(p => p.bloodGroup))];
  
  const averageAge = mockPatients.reduce((sum, p) => sum + p.age, 0) / totalPatients;
  
  return {
    totalPatients,
    activePatients,
    admittedPatients,
    dischargedPatients,
    criticalPatients,
    totalDepartments,
    averageAge: Math.round(averageAge),
    bloodGroups: bloodGroups.length
  };
};

/**
 * Search patients by query
 * TODO: Replace with actual API call
 */
export const searchPatients = async (query: string): Promise<Patient[]> => {
  await delay(300);
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/patients/search?q=${query}`);
  // return response.json();
  
  const lowerQuery = query.toLowerCase();
  return mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(lowerQuery) ||
    patient.patientId.toLowerCase().includes(lowerQuery) ||
    patient.phone.includes(query) ||
    patient.email.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get patients by status
 * TODO: Replace with actual API call
 */
export const getPatientsByStatus = async (status: string): Promise<Patient[]> => {
  await delay(300);
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/patients?status=${status}`);
  // return response.json();
  
  if (status === 'All') {
    return [...mockPatients];
  }
  return mockPatients.filter(patient => patient.status === status);
};

/**
 * Get patients by department
 * TODO: Replace with actual API call
 */
export const getPatientsByDepartment = async (department: string): Promise<Patient[]> => {
  await delay(300);
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/patients?department=${department}`);
  // return response.json();
  
  return mockPatients.filter(patient => patient.department === department);
};
