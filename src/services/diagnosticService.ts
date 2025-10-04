// Diagnostics Service - Handles diagnostic tests and lab work

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
}

// Mock diagnostic tests
const mockDiagnosticTests: DiagnosticTest[] = [
  {
    id: 'DT001',
    name: 'Complete Blood Count (CBC)',
    category: 'Blood Test',
    price: 50,
    duration: '30 minutes',
    preparation: 'Fasting required for 8-12 hours',
    department: 'Pathology',
    description: 'Comprehensive blood cell count analysis'
  },
  {
    id: 'DT002',
    name: 'Lipid Profile',
    category: 'Blood Test',
    price: 60,
    duration: '30 minutes',
    preparation: 'Fasting required for 12 hours',
    department: 'Pathology',
    description: 'Cholesterol and triglyceride levels'
  },
  {
    id: 'DT003',
    name: 'Blood Sugar (Fasting)',
    category: 'Blood Test',
    price: 25,
    duration: '15 minutes',
    preparation: 'Fasting required for 8 hours',
    department: 'Pathology',
    description: 'Fasting glucose level test'
  },
  {
    id: 'DT004',
    name: 'HbA1c',
    category: 'Blood Test',
    price: 45,
    duration: '30 minutes',
    preparation: 'No fasting required',
    department: 'Pathology',
    description: 'Long-term blood sugar control indicator'
  },
  {
    id: 'DT005',
    name: 'Chest X-Ray',
    category: 'X-Ray',
    price: 80,
    duration: '15 minutes',
    preparation: 'Remove metal objects',
    department: 'Radiology',
    description: 'Chest radiograph for lung and heart assessment'
  },
  {
    id: 'DT006',
    name: 'ECG (Electrocardiogram)',
    category: 'Cardiology',
    price: 70,
    duration: '20 minutes',
    preparation: 'Avoid caffeine 2 hours before',
    department: 'Cardiology',
    description: 'Heart electrical activity measurement'
  },
  {
    id: 'DT007',
    name: 'Echocardiogram',
    category: 'Cardiology',
    price: 200,
    duration: '45 minutes',
    preparation: 'No special preparation',
    department: 'Cardiology',
    description: 'Ultrasound of the heart'
  },
  {
    id: 'DT008',
    name: 'Abdominal Ultrasound',
    category: 'Ultrasound',
    price: 150,
    duration: '30 minutes',
    preparation: 'Fasting for 6 hours',
    department: 'Radiology',
    description: 'Ultrasound imaging of abdominal organs'
  },
  {
    id: 'DT009',
    name: 'CT Scan - Head',
    category: 'CT Scan',
    price: 400,
    duration: '30 minutes',
    preparation: 'Remove metal objects',
    department: 'Radiology',
    description: 'Computed tomography of the head'
  },
  {
    id: 'DT010',
    name: 'MRI - Spine',
    category: 'MRI',
    price: 800,
    duration: '60 minutes',
    preparation: 'Remove all metal objects, inform about implants',
    department: 'Radiology',
    description: 'Magnetic resonance imaging of spine'
  },
  {
    id: 'DT011',
    name: 'Liver Function Test (LFT)',
    category: 'Blood Test',
    price: 55,
    duration: '30 minutes',
    preparation: 'Fasting for 8 hours',
    department: 'Pathology',
    description: 'Tests to assess liver function'
  },
  {
    id: 'DT012',
    name: 'Kidney Function Test (KFT)',
    category: 'Blood Test',
    price: 55,
    duration: '30 minutes',
    preparation: 'No special preparation',
    department: 'Pathology',
    description: 'Tests to assess kidney function'
  },
  {
    id: 'DT013',
    name: 'Thyroid Profile',
    category: 'Blood Test',
    price: 65,
    duration: '30 minutes',
    preparation: 'No fasting required',
    department: 'Pathology',
    description: 'Thyroid hormone levels (T3, T4, TSH)'
  },
  {
    id: 'DT014',
    name: 'Urine Analysis',
    category: 'Pathology',
    price: 30,
    duration: '15 minutes',
    preparation: 'First morning sample preferred',
    department: 'Pathology',
    description: 'Complete urine examination'
  },
  {
    id: 'DT015',
    name: 'X-Ray - Bone',
    category: 'X-Ray',
    price: 90,
    duration: '15 minutes',
    preparation: 'Remove metal objects from area',
    department: 'Radiology',
    description: 'Bone radiograph for fracture or abnormality detection'
  }
];

// Mock patient diagnostics
const mockPatientDiagnostics: PatientDiagnostic[] = [
  {
    id: 'PD001',
    patientId: 'P001',
    patientName: 'John Smith',
    testId: 'DT006',
    testName: 'ECG (Electrocardiogram)',
    category: 'Cardiology',
    orderedBy: 'Dr. Sarah Johnson',
    orderedDate: '2024-01-15',
    scheduledDate: '2024-01-16',
    scheduledTime: '10:00 AM',
    status: 'Scheduled',
    priority: 'Routine',
    price: 70,
    notes: 'Patient history of heart palpitations'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all diagnostic tests
 */
export const fetchDiagnosticTests = async (): Promise<DiagnosticTest[]> => {
  await delay(300);
  return [...mockDiagnosticTests];
};

/**
 * Search diagnostic tests
 */
export const searchDiagnosticTests = async (query: string): Promise<DiagnosticTest[]> => {
  await delay(200);
  const lowerQuery = query.toLowerCase();
  return mockDiagnosticTests.filter(test => 
    test.name.toLowerCase().includes(lowerQuery) ||
    test.category.toLowerCase().includes(lowerQuery) ||
    test.department.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get diagnostic test by ID
 */
export const getDiagnosticTestById = async (id: string): Promise<DiagnosticTest | null> => {
  await delay(200);
  return mockDiagnosticTests.find(test => test.id === id) || null;
};

/**
 * Fetch diagnostics for a specific patient
 */
export const fetchPatientDiagnostics = async (patientId: string): Promise<PatientDiagnostic[]> => {
  await delay(300);
  return mockPatientDiagnostics.filter(pd => pd.patientId === patientId);
};

/**
 * Fetch all patient diagnostics (for diagnostics page)
 */
export const fetchAllPatientDiagnostics = async (): Promise<PatientDiagnostic[]> => {
  await delay(300);
  return [...mockPatientDiagnostics];
};

/**
 * Book a diagnostic test for a patient
 */
export const bookDiagnosticTest = async (diagnostic: Omit<PatientDiagnostic, 'id'>): Promise<PatientDiagnostic> => {
  await delay(400);
  const newDiagnostic: PatientDiagnostic = {
    ...diagnostic,
    id: `PD${String(mockPatientDiagnostics.length + 1).padStart(3, '0')}`
  };
  mockPatientDiagnostics.push(newDiagnostic);
  return newDiagnostic;
};

/**
 * Update patient diagnostic
 */
export const updatePatientDiagnostic = async (id: string, updates: Partial<PatientDiagnostic>): Promise<PatientDiagnostic> => {
  await delay(400);
  const index = mockPatientDiagnostics.findIndex(pd => pd.id === id);
  if (index === -1) throw new Error('Diagnostic not found');
  
  mockPatientDiagnostics[index] = { ...mockPatientDiagnostics[index], ...updates };
  return mockPatientDiagnostics[index];
};

/**
 * Cancel diagnostic test
 */
export const cancelDiagnosticTest = async (id: string): Promise<void> => {
  await delay(400);
  const index = mockPatientDiagnostics.findIndex(pd => pd.id === id);
  if (index !== -1) {
    mockPatientDiagnostics[index].status = 'Cancelled';
  }
};

/**
 * Get diagnostic statistics
 */
export const getDiagnosticStats = async () => {
  await delay(300);
  const total = mockPatientDiagnostics.length;
  const scheduled = mockPatientDiagnostics.filter(pd => pd.status === 'Scheduled').length;
  const inProgress = mockPatientDiagnostics.filter(pd => pd.status === 'In Progress').length;
  const completed = mockPatientDiagnostics.filter(pd => pd.status === 'Completed').length;
  const cancelled = mockPatientDiagnostics.filter(pd => pd.status === 'Cancelled').length;
  const pending = mockPatientDiagnostics.filter(pd => pd.status === 'Pending').length;
  const urgent = mockPatientDiagnostics.filter(pd => pd.priority === 'Urgent').length;
  const emergency = mockPatientDiagnostics.filter(pd => pd.priority === 'Emergency').length;
  
  return {
    total,
    scheduled,
    inProgress,
    completed,
    cancelled,
    pending,
    urgent,
    emergency
  };
};
