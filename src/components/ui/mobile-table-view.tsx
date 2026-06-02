import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileResponsiveCard } from './mobile-responsive-card';

const HEADER_BG = 'hsl(220,14%,93%)';
const HEADER_BORDER = 'hsl(220,16%,86%)';

interface MobileTableViewProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    width?: string;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
  getTitle?: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getStatus?: (item: T) => string;
  getStatusColor?: (item: T) => string;
  getActions?: (item: T) => Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  onRowClick?: (item: T) => void;
  showMobileCards?: boolean;
  stickyHeader?: boolean;
  /** Custom mobile card renderer — when provided, replaces MobileResponsiveCard */
  renderMobileItem?: (item: T, onView?: () => void) => React.ReactNode;
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
  showMobileCards = true,
  stickyHeader = false,
  renderMobileItem,
}: MobileTableViewProps<T>) {
  const hasActions = !!(getActions || onRowClick);

  if (showMobileCards) {
    return (
      <>
        {/* ── Mobile cards ───────────────────────────────────────────────── */}
        <div className="block md:hidden space-y-3">
          {data.map((item, index) => {
            const onView = onRowClick ? () => onRowClick(item) : undefined;
            if (renderMobileItem) {
              return <React.Fragment key={index}>{renderMobileItem(item, onView)}</React.Fragment>;
            }
            return (
              <MobileResponsiveCard
                key={index}
                title={getTitle?.(item) ?? ''}
                subtitle={getSubtitle?.(item)}
                status={getStatus?.(item)}
                statusColor={getStatusColor?.(item)}
                fields={columns.map(col => ({
                  label: col.label,
                  value: col.render ? col.render((item as any)[col.key], item) : (item as any)[col.key],
                }))}
                actions={getActions?.(item)}
                onViewClick={onView}
                orderDetails={(item as any).poNumber ? { poNumber: (item as any).poNumber, itemCount: (item as any).items?.length || 0, createdBy: (item as any).createdBy } : undefined}
                vendorDetails={(item as any).vendorName ? { name: (item as any).vendorName, contact: (item as any).vendorContact, phone: (item as any).vendorPhone } : undefined}
                timeline={(item as any).orderDate ? { orderDate: (item as any).orderDate, deliveryDate: (item as any).deliveryDate, fulfilmentDate: (item as any).fulfilmentDate } : undefined}
                amount={(item as any).total ? { total: (item as any).total, paid: (item as any).paidAmount || 0, paymentMethod: (item as any).paymentMethod } : undefined}
              />
            );
          })}
        </div>

        {/* ── Desktop table (raw HTML — no overflow wrapper, so sticky thead works) ── */}
        <div className="hidden md:block">
          <div className="rounded-xl ring-1 ring-border [overflow:clip]">
            <table className="w-full caption-bottom text-sm">
              <thead
                className={stickyHeader ? 'sticky top-[102px] lg:top-[60px] z-20' : ''}
              >
                <tr style={{ background: HEADER_BG, borderBottom: `2px solid ${HEADER_BORDER}` }}>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className={`h-10 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground ${column.width || ''}`}
                      style={{ background: HEADER_BG }}
                    >
                      {column.label}
                    </th>
                  ))}
                  {hasActions && (
                    <th
                      className="h-10 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[5%]"
                      style={{ background: HEADER_BG }}
                    />
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((item, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b last:border-b-0 transition-colors hover:bg-muted/50"
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-3 py-2.5 align-middle">
                        {column.render ? column.render((item as any)[column.key], item) : (item as any)[column.key]}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-3 py-2 align-middle">
                        <div className="flex items-center gap-1">
                          {getActions?.(item)?.map((action, actionIndex) => {
                            const IconComponent = action.icon;
                            return (
                              <Button
                                key={actionIndex}
                                variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                                className="h-7 w-7 p-0"
                                title={action.label}
                              >
                                {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
                              </Button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  // Fallback: simple table (no card view)
  return (
    <Card className="border-border/50 shadow-sm">
      <div className="overflow-x-auto max-w-full">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr style={{ background: HEADER_BG, borderBottom: `2px solid ${HEADER_BORDER}` }}>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`h-10 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground ${column.width || ''}`}
                >
                  {column.label}
                </th>
              ))}
              {hasActions && (
                <th className="h-10 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[5%]" />
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b last:border-b-0 transition-colors hover:bg-muted/50"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-3 py-2.5 align-middle">
                    {column.render ? column.render((item as any)[column.key], item) : (item as any)[column.key]}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center gap-1">
                      {getActions?.(item)?.map((action, actionIndex) => {
                        const IconComponent = action.icon;
                        return (
                          <Button
                            key={actionIndex}
                            variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                            className="h-7 w-7 p-0"
                            title={action.label}
                          >
                            {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
                          </Button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
