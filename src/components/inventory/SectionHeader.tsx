import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

export const SectionHeader = ({ title, icon: Icon, children, className = '' }: SectionHeaderProps) => {
  return (
    <div className={`section-header ${className}`}>
      <div className="flex items-center gap-3">
        <Icon className="section-icon" />
        <span>{title}</span>
      </div>
      {children && (
        <div className="ml-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;