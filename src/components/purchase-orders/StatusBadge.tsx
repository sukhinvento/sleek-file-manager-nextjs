import React from 'react';
import { StatusBadge as UnifiedStatusBadge } from '../inventory/StatusBadge';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <UnifiedStatusBadge status={status as any} type="order" />;
};