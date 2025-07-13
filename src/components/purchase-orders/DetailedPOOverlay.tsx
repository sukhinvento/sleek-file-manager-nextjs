import { ModernPOOverlay } from './ModernPOOverlay';
import { PurchaseOrder } from '../../types/purchaseOrder';

interface DetailedPOOverlayProps {
  order: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  onSave?: (order: PurchaseOrder) => void;
  onUpdate?: (order: PurchaseOrder) => void;
  onDelete?: (orderId: string) => void;
}

export const DetailedPOOverlay = ({ 
  order, 
  isOpen, 
  onClose, 
  isEdit = false, 
  onSave, 
  onUpdate, 
  onDelete 
}: DetailedPOOverlayProps) => {
  return (
    <ModernPOOverlay
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