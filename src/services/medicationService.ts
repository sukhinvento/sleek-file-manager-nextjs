// Medication Service - Handles medication prescriptions and inventory

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Drops';
  price: number;
  stockQuantity: number;
  manufacturer: string;
  category: string;
  description?: string;
}

export interface PatientMedication {
  id: string;
  patientId: string;
  patientName: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string; // e.g., "Once daily", "Twice daily", "3 times daily"
  duration: string; // e.g., "7 days", "2 weeks", "1 month"
  quantity: number;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  status: 'Active' | 'Completed' | 'Discontinued';
  instructions?: string;
  price: number;
  totalCost: number;
}

// Mock medication data
const mockMedications: Medication[] = [
  {
    id: 'MED001',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    dosage: '500mg',
    form: 'Tablet',
    price: 0.50,
    stockQuantity: 5000,
    manufacturer: 'PharmaCorp',
    category: 'Pain Relief',
    description: 'Pain reliever and fever reducer'
  },
  {
    id: 'MED002',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    dosage: '250mg',
    form: 'Capsule',
    price: 1.20,
    stockQuantity: 3000,
    manufacturer: 'MediPharma',
    category: 'Antibiotic',
    description: 'Broad-spectrum antibiotic'
  },
  {
    id: 'MED003',
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    dosage: '20mg',
    form: 'Capsule',
    price: 0.80,
    stockQuantity: 2500,
    manufacturer: 'HealthMeds',
    category: 'Gastric',
    description: 'Proton pump inhibitor for acid reflux'
  },
  {
    id: 'MED004',
    name: 'Metformin',
    genericName: 'Metformin HCl',
    dosage: '500mg',
    form: 'Tablet',
    price: 0.60,
    stockQuantity: 4000,
    manufacturer: 'DiabetesCare',
    category: 'Diabetes',
    description: 'Blood sugar control medication'
  },
  {
    id: 'MED005',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    dosage: '5mg',
    form: 'Tablet',
    price: 0.70,
    stockQuantity: 3500,
    manufacturer: 'CardioPharma',
    category: 'Cardiovascular',
    description: 'Calcium channel blocker for hypertension'
  },
  {
    id: 'MED006',
    name: 'Cough Syrup',
    genericName: 'Dextromethorphan',
    dosage: '100ml',
    form: 'Syrup',
    price: 4.50,
    stockQuantity: 800,
    manufacturer: 'RespiCare',
    category: 'Respiratory',
    description: 'Cough suppressant'
  },
  {
    id: 'MED007',
    name: 'Insulin Glargine',
    genericName: 'Insulin Glargine',
    dosage: '100 units/ml',
    form: 'Injection',
    price: 25.00,
    stockQuantity: 500,
    manufacturer: 'DiabetesCare',
    category: 'Diabetes',
    description: 'Long-acting insulin'
  },
  {
    id: 'MED008',
    name: 'Ciprofloxacin',
    genericName: 'Ciprofloxacin',
    dosage: '500mg',
    form: 'Tablet',
    price: 1.50,
    stockQuantity: 2000,
    manufacturer: 'MediPharma',
    category: 'Antibiotic',
    description: 'Fluoroquinolone antibiotic'
  },
  {
    id: 'MED009',
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    dosage: '75mg',
    form: 'Tablet',
    price: 0.30,
    stockQuantity: 6000,
    manufacturer: 'CardioPharma',
    category: 'Cardiovascular',
    description: 'Blood thinner and pain reliever'
  },
  {
    id: 'MED010',
    name: 'Eye Drops',
    genericName: 'Artificial Tears',
    dosage: '10ml',
    form: 'Drops',
    price: 3.50,
    stockQuantity: 1000,
    manufacturer: 'VisionCare',
    category: 'Ophthalmology',
    description: 'Lubricating eye drops'
  }
];

// Mock patient medications
const mockPatientMedications: PatientMedication[] = [
  {
    id: 'PM001',
    patientId: 'P001',
    patientName: 'John Smith',
    medicationId: 'MED001',
    medicationName: 'Paracetamol 500mg',
    dosage: '500mg',
    frequency: 'Three times daily',
    duration: '7 days',
    quantity: 21,
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    prescribedBy: 'Dr. Sarah Johnson',
    status: 'Active',
    instructions: 'Take after meals',
    price: 0.50,
    totalCost: 10.50
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all medications
 */
export const fetchMedications = async (): Promise<Medication[]> => {
  await delay(300);
  return [...mockMedications];
};

/**
 * Search medications by name or generic name
 */
export const searchMedications = async (query: string): Promise<Medication[]> => {
  await delay(200);
  const lowerQuery = query.toLowerCase();
  return mockMedications.filter(med => 
    med.name.toLowerCase().includes(lowerQuery) ||
    med.genericName.toLowerCase().includes(lowerQuery) ||
    med.category.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Fetch medications for a specific patient
 */
export const fetchPatientMedications = async (patientId: string): Promise<PatientMedication[]> => {
  await delay(300);
  return mockPatientMedications.filter(pm => pm.patientId === patientId);
};

/**
 * Add medication prescription for a patient
 */
export const addPatientMedication = async (medication: Omit<PatientMedication, 'id'>): Promise<PatientMedication> => {
  await delay(400);
  const newMedication: PatientMedication = {
    ...medication,
    id: `PM${String(mockPatientMedications.length + 1).padStart(3, '0')}`
  };
  mockPatientMedications.push(newMedication);
  return newMedication;
};

/**
 * Update patient medication
 */
export const updatePatientMedication = async (id: string, updates: Partial<PatientMedication>): Promise<PatientMedication> => {
  await delay(400);
  const index = mockPatientMedications.findIndex(pm => pm.id === id);
  if (index === -1) throw new Error('Medication not found');
  
  mockPatientMedications[index] = { ...mockPatientMedications[index], ...updates };
  return mockPatientMedications[index];
};

/**
 * Get medication by ID
 */
export const getMedicationById = async (id: string): Promise<Medication | null> => {
  await delay(200);
  return mockMedications.find(med => med.id === id) || null;
};
