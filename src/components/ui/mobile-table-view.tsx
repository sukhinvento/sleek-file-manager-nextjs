import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { MobileResponsiveCard } from './mobile-responsive-card';

interface MobileTableViewProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getStatus?: (item: T) => string;
  getStatusColor?: (item: T) => string;
  getActions?: (item: T) => Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
  onRowClick?: (item: T) => void;
  showMobileCards?: boolean;
}

export function MobileTableView<T>({
  data,
  columns,
  getTitle,
  getSubtitle,
  getStatus,
  getStatusColor,
  getActions,
  onRowClick,
  showMobileCards = true
}: MobileTableViewProps<T>) {
  if (showMobileCards) {
    return (
      <>
        {/* Mobile Cards View */}
        <div className="block md:hidden">
          {data.map((item, index) => (
            <MobileResponsiveCard
              key={index}
              title={getTitle(item)}
              subtitle={getSubtitle?.(item)}
              status={getStatus?.(item)}
              statusColor={getStatusColor?.(item)}
              fields={columns.map(col => ({
                label: col.label,
                value: col.render ? col.render((item as any)[col.key], item) : (item as any)[col.key]
              }))}
              actions={getActions?.(item)}
              onViewClick={onRowClick ? () => onRowClick(item) : undefined}
            />
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>{column.label}</TableHead>
                ))}
                {(getActions || onRowClick) && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index} className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.render ? column.render((item as any)[column.key], item) : (item as any)[column.key]}
                    </TableCell>
                  ))}
                  {(getActions || onRowClick) && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {onRowClick && (
                          <button
                            onClick={() => onRowClick(item)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>
                        )}
                        {getActions?.(item)?.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={action.onClick}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );
  }

  // Fallback to regular table
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index}>{column.label}</TableHead>
          ))}
          {(getActions || onRowClick) && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index} className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}>
            {columns.map((column, colIndex) => (
              <TableCell key={colIndex}>
                {column.render ? column.render((item as any)[column.key], item) : (item as any)[column.key]}
              </TableCell>
            ))}
            {(getActions || onRowClick) && (
              <TableCell>
                <div className="flex items-center gap-2">
                  {onRowClick && (
                    <button
                      onClick={() => onRowClick(item)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  )}
                  {getActions?.(item)?.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={action.onClick}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}