
export interface DataRow {
  id: number;
  name: string;
  department: string;
  subCategory: string;
  value: string | number;
  date: string;
  status: string;
  priority: string;
  assignedTo: string;
  lastModified: string;
  isValueValid: boolean;
  isDateValid: boolean;
}

export interface EditableRow {
  name: string;
  department: string;
  subCategory: string;
  value: string;
  date: string;
  status: string;
  priority: string;
  assignedTo: string;
  lastModified: string;
}

export interface AuditEntry {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export type SortField = 'name' | 'department' | 'value' | 'date';
export type SortOrder = 'asc' | 'desc';
