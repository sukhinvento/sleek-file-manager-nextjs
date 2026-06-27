import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { hasRole, hasScope, user } = useAuth();
  return {
    canManagePatients: hasRole(['admin', 'manager', 'receptionist', 'doctor', 'nurse']),
    canManageDoctors: hasRole(['admin', 'manager']),
    canManageRooms: hasRole(['admin', 'manager', 'receptionist']),
    canManageBilling: hasRole(['admin', 'manager', 'billing_staff']),
    canManageDiagnostics: hasRole(['admin', 'manager', 'doctor', 'lab_technician']),
    canManageMedications: hasRole(['admin', 'manager', 'doctor', 'pharmacist']),
    canManageInventory: hasRole(['admin', 'manager', 'pharmacist']),
    canManagePurchaseOrders: hasRole(['admin', 'manager', 'user']),
    canViewOnly: hasRole(['viewer']),
    isAdmin: hasRole('admin'),
    userRoles: user?.roles || [],
  };
};
