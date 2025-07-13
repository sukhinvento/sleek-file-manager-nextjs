import { ModernSOOverlay } from './ModernSOOverlay';
import { SalesOrder } from '../../types/inventory';

interface DetailedSOOverlayProps {
  order: SalesOrder | null;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  onSave?: (order: SalesOrder) => void;
  onUpdate?: (order: SalesOrder) => void;
  onDelete?: (orderId: string) => void;
}

export const DetailedSOOverlay = ({ 
  order, 
  isOpen, 
  onClose, 
  isEdit = false, 
  onSave, 
  onUpdate, 
  onDelete 
}: DetailedSOOverlayProps) => {
  return (
    <ModernSOOverlay
      order={order}
      isOpen={isOpen}
      onClose={onClose}
      isEdit={isEdit}
      onSave={onSave}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  );
};