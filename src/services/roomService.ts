// Room Service - Handles hospital room management and assignments

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: 'General' | 'Private' | 'ICU' | 'Semi-Private' | 'Deluxe' | 'Suite';
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  bedCapacity: number;
  occupiedBeds: number;
  dailyRate: number;
  amenities: string[];
  department: string;
}

export interface RoomAssignment {
  id: string;
  patientId: string;
  patientName: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate?: string;
  dailyRate: number;
  totalDays: number;
  totalCharges: number;
  status: 'Active' | 'Completed';
  assignedBy: string;
  bedNumber?: number;
}

// Mock room data
const mockRooms: Room[] = [
  {
    id: 'R001',
    roomNumber: '101',
    floor: 1,
    type: 'General',
    status: 'Available',
    bedCapacity: 4,
    occupiedBeds: 0,
    dailyRate: 100,
    amenities: ['AC', 'TV', 'Shared Bathroom'],
    department: 'General Medicine'
  },
  {
    id: 'R002',
    roomNumber: '102',
    floor: 1,
    type: 'General',
    status: 'Occupied',
    bedCapacity: 4,
    occupiedBeds: 2,
    dailyRate: 100,
    amenities: ['AC', 'TV', 'Shared Bathroom'],
    department: 'General Medicine'
  },
  {
    id: 'R003',
    roomNumber: '201',
    floor: 2,
    type: 'Private',
    status: 'Available',
    bedCapacity: 1,
    occupiedBeds: 0,
    dailyRate: 250,
    amenities: ['AC', 'TV', 'Private Bathroom', 'Wi-Fi', 'Refrigerator'],
    department: 'General Medicine'
  },
  {
    id: 'R004',
    roomNumber: '202',
    floor: 2,
    type: 'Private',
    status: 'Occupied',
    bedCapacity: 1,
    occupiedBeds: 1,
    dailyRate: 250,
    amenities: ['AC', 'TV', 'Private Bathroom', 'Wi-Fi', 'Refrigerator'],
    department: 'Cardiology'
  },
  {
    id: 'R005',
    roomNumber: '301',
    floor: 3,
    type: 'ICU',
    status: 'Available',
    bedCapacity: 1,
    occupiedBeds: 0,
    dailyRate: 500,
    amenities: ['Ventilator', 'Monitoring Equipment', 'Private Bathroom', 'ICU Bed'],
    department: 'ICU'
  },
  {
    id: 'R006',
    roomNumber: '302',
    floor: 3,
    type: 'ICU',
    status: 'Occupied',
    bedCapacity: 1,
    occupiedBeds: 1,
    dailyRate: 500,
    amenities: ['Ventilator', 'Monitoring Equipment', 'Private Bathroom', 'ICU Bed'],
    department: 'ICU'
  },
  {
    id: 'R007',
    roomNumber: '103',
    floor: 1,
    type: 'Semi-Private',
    status: 'Available',
    bedCapacity: 2,
    occupiedBeds: 0,
    dailyRate: 150,
    amenities: ['AC', 'TV', 'Shared Bathroom', 'Wi-Fi'],
    department: 'Orthopedics'
  },
  {
    id: 'R008',
    roomNumber: '104',
    floor: 1,
    type: 'Semi-Private',
    status: 'Occupied',
    bedCapacity: 2,
    occupiedBeds: 1,
    dailyRate: 150,
    amenities: ['AC', 'TV', 'Shared Bathroom', 'Wi-Fi'],
    department: 'General Medicine'
  },
  {
    id: 'R009',
    roomNumber: '401',
    floor: 4,
    type: 'Deluxe',
    status: 'Available',
    bedCapacity: 1,
    occupiedBeds: 0,
    dailyRate: 350,
    amenities: ['AC', 'Smart TV', 'Private Bathroom', 'Wi-Fi', 'Sofa', 'Refrigerator', 'Microwave'],
    department: 'VIP'
  },
  {
    id: 'R010',
    roomNumber: '501',
    floor: 5,
    type: 'Suite',
    status: 'Available',
    bedCapacity: 1,
    occupiedBeds: 0,
    dailyRate: 600,
    amenities: ['AC', 'Smart TV', 'Luxury Bathroom', 'Wi-Fi', 'Living Area', 'Kitchen', 'Butler Service'],
    department: 'VIP'
  },
  {
    id: 'R011',
    roomNumber: '105',
    floor: 1,
    type: 'General',
    status: 'Maintenance',
    bedCapacity: 4,
    occupiedBeds: 0,
    dailyRate: 100,
    amenities: ['AC', 'TV', 'Shared Bathroom'],
    department: 'General Medicine'
  },
  {
    id: 'R012',
    roomNumber: '203',
    floor: 2,
    type: 'Private',
    status: 'Reserved',
    bedCapacity: 1,
    occupiedBeds: 0,
    dailyRate: 250,
    amenities: ['AC', 'TV', 'Private Bathroom', 'Wi-Fi', 'Refrigerator'],
    department: 'Maternity'
  }
];

// Mock room assignments
const mockRoomAssignments: RoomAssignment[] = [
  {
    id: 'RA001',
    patientId: 'P001',
    patientName: 'John Smith',
    roomId: 'R004',
    roomNumber: '202',
    roomType: 'Private',
    checkInDate: '2024-01-15',
    dailyRate: 250,
    totalDays: 3,
    totalCharges: 750,
    status: 'Active',
    assignedBy: 'Dr. Sarah Johnson',
    bedNumber: 1
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all rooms
 */
export const fetchRooms = async (): Promise<Room[]> => {
  await delay(300);
  return [...mockRooms];
};

/**
 * Fetch available rooms (for autosuggest)
 */
export const fetchAvailableRooms = async (): Promise<Room[]> => {
  await delay(200);
  return mockRooms.filter(room => 
    room.status === 'Available' || 
    (room.status === 'Occupied' && room.occupiedBeds < room.bedCapacity)
  );
};

/**
 * Search rooms by number, type, or department
 */
export const searchRooms = async (query: string): Promise<Room[]> => {
  await delay(200);
  const lowerQuery = query.toLowerCase();
  return mockRooms.filter(room => 
    room.roomNumber.toLowerCase().includes(lowerQuery) ||
    room.type.toLowerCase().includes(lowerQuery) ||
    room.department.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get room by ID
 */
export const getRoomById = async (id: string): Promise<Room | null> => {
  await delay(200);
  return mockRooms.find(room => room.id === id) || null;
};

/**
 * Fetch room assignments for a patient
 */
export const fetchPatientRoomAssignments = async (patientId: string): Promise<RoomAssignment[]> => {
  await delay(300);
  return mockRoomAssignments.filter(ra => ra.patientId === patientId);
};

/**
 * Assign room to patient
 */
export const assignRoom = async (assignment: Omit<RoomAssignment, 'id'>): Promise<RoomAssignment> => {
  await delay(400);
  
  const newAssignment: RoomAssignment = {
    ...assignment,
    id: `RA${String(mockRoomAssignments.length + 1).padStart(3, '0')}`
  };
  
  mockRoomAssignments.push(newAssignment);
  
  // Update room status
  const roomIndex = mockRooms.findIndex(r => r.id === assignment.roomId);
  if (roomIndex !== -1) {
    mockRooms[roomIndex].occupiedBeds += 1;
    if (mockRooms[roomIndex].occupiedBeds >= mockRooms[roomIndex].bedCapacity) {
      mockRooms[roomIndex].status = 'Occupied';
    }
  }
  
  return newAssignment;
};

/**
 * Update room assignment
 */
export const updateRoomAssignment = async (id: string, updates: Partial<RoomAssignment>): Promise<RoomAssignment> => {
  await delay(400);
  const index = mockRoomAssignments.findIndex(ra => ra.id === id);
  if (index === -1) throw new Error('Room assignment not found');
  
  mockRoomAssignments[index] = { ...mockRoomAssignments[index], ...updates };
  return mockRoomAssignments[index];
};

/**
 * Check out patient from room
 */
export const checkOutPatient = async (assignmentId: string, checkOutDate: string): Promise<RoomAssignment> => {
  await delay(400);
  const assignment = mockRoomAssignments.find(ra => ra.id === assignmentId);
  if (!assignment) throw new Error('Room assignment not found');
  
  // Calculate total days and charges
  const checkIn = new Date(assignment.checkInDate);
  const checkOut = new Date(checkOutDate);
  const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  
  const updatedAssignment = {
    ...assignment,
    checkOutDate,
    totalDays: days,
    totalCharges: days * assignment.dailyRate,
    status: 'Completed' as const
  };
  
  // Update assignment
  const index = mockRoomAssignments.findIndex(ra => ra.id === assignmentId);
  mockRoomAssignments[index] = updatedAssignment;
  
  // Update room status
  const roomIndex = mockRooms.findIndex(r => r.id === assignment.roomId);
  if (roomIndex !== -1) {
    mockRooms[roomIndex].occupiedBeds -= 1;
    if (mockRooms[roomIndex].occupiedBeds < mockRooms[roomIndex].bedCapacity) {
      mockRooms[roomIndex].status = 'Available';
    }
  }
  
  return updatedAssignment;
};

/**
 * Get room statistics
 */
export const getRoomStats = async () => {
  await delay(300);
  const totalRooms = mockRooms.length;
  const availableRooms = mockRooms.filter(r => r.status === 'Available').length;
  const occupiedRooms = mockRooms.filter(r => r.status === 'Occupied').length;
  const maintenanceRooms = mockRooms.filter(r => r.status === 'Maintenance').length;
  const totalBeds = mockRooms.reduce((sum, r) => sum + r.bedCapacity, 0);
  const occupiedBeds = mockRooms.reduce((sum, r) => sum + r.occupiedBeds, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  
  return {
    totalRooms,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    totalBeds,
    occupiedBeds,
    occupancyRate
  };
};
