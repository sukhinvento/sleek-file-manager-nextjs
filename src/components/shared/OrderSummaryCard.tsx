import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { IndianRupee, CreditCard, CheckCircle2, ChevronDown, ChevronUp, Receipt, TrendingUp } from 'lucide-react';

interface TaxableItem {
  subtotal: number;
  taxSlab?: number;
  discount?: number;
}

interface OrderSummaryCardProps {
  subtotal: number;
  taxAmount?: number;
  taxLabel?: string;
  discountAmount?: number;
  total: number;
  paidAmount: number;
  onRecordPayment?: () => void;
  currency?: string;
  compact?: boolean;
  className?: string;
  /** Pass order items to auto-compute GST breakdown (CGST + SGST per slab) */
  items?: TaxableItem[];
}

interface TaxSlabBreakdown {
  rate: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalTax: number;
}

export default function OrderSummaryCard({
  subtotal,
  taxAmount: taxAmountProp,
  taxLabel = 'Tax',
  discountAmount = 0,
  total,
  paidAmount,
  onRecordPayment,
  currency = '₹',
  compact = false,
  className = '',
  items,
}: OrderSummaryCardProps) {
  const [showTaxDetail, setShowTaxDetail] = React.useState(false);

  const taxBreakdown = useMemo(() => {
    if (!items || items.length === 0) return { slabs: [] as TaxSlabBreakdown[], totalTax: 0 };

    const slabMap = new Map<number, number>();
    for (const item of items) {
      const rate = item.taxSlab || 0;
      if (rate > 0) {
        slabMap.set(rate, (slabMap.get(rate) || 0) + (item.subtotal || 0));
      }
    }

    const slabs: TaxSlabBreakdown[] = [];
    let totalTax = 0;
    for (const [rate, taxableAmount] of slabMap.entries()) {
      const tax = (taxableAmount * rate) / 100;
      const half = tax / 2;
      slabs.push({ rate, taxableAmount, cgst: half, sgst: half, totalTax: tax });
      totalTax += tax;
    }

    slabs.sort((a, b) => a.rate - b.rate);
    return { slabs, totalTax };
  }, [items]);

  const effectiveTaxAmount = taxAmountProp ?? taxBreakdown.totalTax;
  const computedTotal = effectiveTaxAmount > 0 && total === subtotal
    ? subtotal - discountAmount + effectiveTaxAmount
    : total;
  const balanceDue = Math.max(0, computedTotal - paidAmount);
  const isPaid = balanceDue <= 0 && computedTotal > 0;
  const paidPercent = computedTotal > 0 ? Math.min(100, (paidAmount / computedTotal) * 100) : 0;
  const hasTaxBreakdown = taxBreakdown.slabs.length > 0;

  const fmt = (n: number) =>
    Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ── Compact mode (POS cart) ── */
  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-sm font-medium">{currency}{fmt(subtotal)}</span>
        </div>
        {effectiveTaxAmount > 0 && (
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">GST</span>
            <span className="text-sm font-medium">{currency}{fmt(effectiveTaxAmount)}</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">Discount</span>
            <span className="text-sm font-medium text-emerald-600">-{currency}{fmt(discountAmount)}</span>
          </div>
        )}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center py-1">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-base font-bold">{currency}{fmt(computedTotal)}</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Full mode — Professional card ── */
  return (
    <div className={`rounded-lg border border-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-primary/[0.06] px-4 py-3 border-b border-border flex items-center gap-2">
        <Receipt className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Payment Summary</span>
      </div>

      {/* Breakdown rows */}
      <div className="divide-y divide-border/50">
        {/* Subtotal */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-card">
          <span className="text-xs text-muted-foreground">Subtotal</span>
          <span className="text-xs font-medium text-foreground">{currency}{fmt(subtotal)}</span>
        </div>

        {/* Tax / GST */}
        {effectiveTaxAmount > 0 && (
          <div className="bg-primary/[0.02]">
            <div
              className={`flex justify-between items-center px-4 py-2.5 ${hasTaxBreakdown ? 'cursor-pointer hover:bg-primary/[0.04] transition-colors' : ''}`}
              onClick={hasTaxBreakdown ? () => setShowTaxDetail(!showTaxDetail) : undefined}
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                GST
                {hasTaxBreakdown && (
                  showTaxDetail
                    ? <ChevronUp className="h-3 w-3 text-muted-foreground/70" />
                    : <ChevronDown className="h-3 w-3 text-muted-foreground/70" />
                )}
              </span>
              <span className="text-xs font-medium text-foreground">+{currency}{fmt(effectiveTaxAmount)}</span>
            </div>

            {/* Expanded GST breakdown */}
            {showTaxDetail && hasTaxBreakdown && (
              <div className="px-4 pb-2.5 space-y-1">
                {taxBreakdown.slabs.map((slab) => (
                  <div key={slab.rate} className="ml-3 pl-3 border-l-2 border-primary/20 space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70 font-medium">
                      GST @ {slab.rate}% on {currency}{fmt(slab.taxableAmount)}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-muted-foreground">CGST @ {slab.rate / 2}%</span>
                      <span className="text-[11px] font-medium text-foreground">{currency}{fmt(slab.cgst)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-muted-foreground">SGST @ {slab.rate / 2}%</span>
                      <span className="text-[11px] font-medium text-foreground">{currency}{fmt(slab.sgst)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discount */}
        {discountAmount > 0 && (
          <div className="flex justify-between items-center px-4 py-2.5 bg-card">
            <span className="text-xs text-muted-foreground">Discount</span>
            <span className="text-xs font-medium text-emerald-600">-{currency}{fmt(discountAmount)}</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex justify-between items-center px-4 py-3 bg-primary/[0.06]">
          <span className="text-[13px] font-semibold text-primary">Grand Total</span>
          <span className="text-[15px] font-bold text-primary">{currency}{fmt(computedTotal)}</span>
        </div>
      </div>

      {/* Payment status section */}
      {computedTotal > 0 && (
        <div className="border-t border-border px-4 py-3 space-y-3 bg-card">
          {/* Paid + Balance rows */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Amount Paid</span>
              <span className="text-xs font-semibold text-emerald-600">{currency}{fmt(paidAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-foreground">Balance Due</span>
              <span className={`text-xs font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                {currency}{fmt(balanceDue)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${paidPercent}%`,
                  backgroundColor: isPaid ? '#059669' : '#385a9f',
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">
              {paidPercent.toFixed(0)}% paid
            </p>
          </div>

          {/* Fully Paid badge or Record Payment button */}
          {isPaid ? (
            <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Fully Paid</span>
            </div>
          ) : onRecordPayment && balanceDue > 0 ? (
            <Button
              variant="outline"
              className="w-full h-9 gap-2 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={onRecordPayment}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Record Payment
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
