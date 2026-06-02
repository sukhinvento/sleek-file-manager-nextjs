import React, { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X, CreditCard, FileText, Printer,
  Calendar, ExternalLink, User, Package, MapPin,
  Building2, Truck, Receipt,
} from 'lucide-react';
import { Invoice } from '@/services/invoiceService';
import OrderSummaryCard from '@/components/shared/OrderSummaryCard';
import RecordPaymentDialog from '@/components/shared/RecordPaymentDialog';
import InvoicePreviewDialog from '@/components/invoices/InvoicePreviewDialog';
import { PaymentRecord } from '@/types/shared';
import * as invoiceService from '@/services/invoiceService';
import { toast } from '@/hooks/use-toast';

const STATUS_STYLES: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800 border-gray-200',
  Issued: 'bg-blue-100 text-blue-800 border-blue-200',
  Paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Partial: 'bg-amber-100 text-amber-800 border-amber-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
  Overdue: 'bg-red-100 text-red-800 border-red-200',
};

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  purchase_order: { label: 'Purchase Order', color: 'bg-blue-50 text-blue-700' },
  sales_order: { label: 'Sales Order', color: 'bg-emerald-50 text-emerald-700' },
  hospital_billing: { label: 'Hospital Bill', color: 'bg-purple-50 text-purple-700' },
  diagnostic: { label: 'Diagnostic', color: 'bg-amber-50 text-amber-700' },
  diagnostic_booking: { label: 'Diagnostic', color: 'bg-amber-50 text-amber-700' },
  admission: { label: 'Admission', color: 'bg-purple-50 text-purple-700' },
};

interface InvoiceSheetProps {
  invoice: Invoice | null;
  onClose: () => void;
  onUpdate?: (invoice: Invoice) => void;
}

export default function InvoiceSheet({ invoice, onClose, onUpdate }: InvoiceSheetProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!invoice) return null;

  const balanceDue = Math.max(0, invoice.grandTotal - (invoice.paidAmount || 0));
  const source = SOURCE_LABELS[invoice.sourceType] || { label: invoice.sourceType || 'Unknown', color: 'bg-gray-50 text-gray-700' };
  const isPO = invoice.sourceType === 'purchase_order';
  const partyName = isPO ? invoice.vendorName : invoice.customerName;
  const partyPhone = isPO ? invoice.vendorPhone : invoice.customerPhone;
  const partyEmail = isPO ? invoice.vendorEmail : invoice.customerEmail;
  const partyAddress = isPO ? invoice.vendorAddress : invoice.customerAddress;

  const fmt = (n: number) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleRecordPayment = async (payment: PaymentRecord) => {
    try {
      const newPaidAmount = (invoice.paidAmount || 0) + payment.amount;
      const newStatus = newPaidAmount >= invoice.grandTotal ? 'paid' : 'partially_paid';
      const updated = await invoiceService.updateInvoice(invoice.id, {
        paidAmount: newPaidAmount,
        status: newStatus,
      });
      onUpdate?.(updated);
      toast({ title: 'Payment Recorded', description: `₹${payment.amount.toFixed(2)} recorded on ${invoice.invoiceNumber}.`, variant: 'success' });
    } catch {
      throw new Error('Failed to record payment');
    }
  };

  // Map items for OrderSummaryCard GST breakdown
  const summaryItems = invoice.lineItems.map(li => ({
    subtotal: li.subtotal,
    taxSlab: li.taxSlab,
    discount: li.discountPercent,
  }));

  return (
    <>
      <Sheet open={!!invoice} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent side="right" className="w-full sm:w-[780px] sm:max-w-[780px] p-0 flex flex-col h-full bg-background">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-foreground truncate">{invoice.invoiceNumber}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {partyName} · {invoice.issueDate}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Status + Source badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${STATUS_STYLES[invoice.status] || 'bg-gray-100 text-gray-800'} border text-xs font-semibold pointer-events-none`}>
                {invoice.status}
              </Badge>
              <Badge className={`${source.color} border-0 text-xs pointer-events-none`}>
                {source.label}
              </Badge>
              {invoice.sourceNumber && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                  <ExternalLink className="h-3 w-3" /> {invoice.sourceNumber}
                </span>
              )}
            </div>

            {/* Party + Summary side-by-side */}
            <div className="grid sm:grid-cols-[1fr_1fr] gap-5 sm:items-stretch">
              {/* Left: Party + Invoice details */}
              <div className="space-y-4">
                {/* Party card (Vendor / Customer) */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    {isPO ? <Building2 className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5 text-primary" />}
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {isPO ? 'Vendor' : 'Bill To'}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-[13px] font-semibold text-foreground">{partyName || '—'}</p>
                    {(partyPhone || partyEmail) && (
                      <p className="text-xs text-muted-foreground">
                        {[partyPhone, partyEmail].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {partyAddress && (
                      <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                        {partyAddress}
                      </p>
                    )}
                  </div>
                </div>

                {/* Invoice details — alternating rows */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Invoice Details</span>
                  </div>
                  {[
                    ['Issue Date', invoice.issueDate || '—'],
                    ['Order Date', invoice.orderDate ? new Date(invoice.orderDate).toLocaleDateString('en-IN') : '—'],
                    ['Due Date', invoice.dueDate || '—'],
                    ['Source', source.label],
                    ['Ref #', invoice.sourceNumber || '—'],
                    ...(invoice.paymentMethod ? [['Payment', invoice.paymentMethod]] : []),
                  ].map(([label, value], idx) => (
                    <div key={label} className={`flex px-4 py-2.5 border-b border-border/50 last:border-0 ${idx % 2 === 0 ? 'bg-card' : 'bg-primary/[0.02]'}`}>
                      <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</span>
                      <span className="text-xs font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping address */}
                {invoice.shippingAddress && (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                      <Truck className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {isPO ? 'Ship To' : 'Delivery Address'}
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs text-foreground">{invoice.shippingAddress}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Payment summary with GST */}
              <div className="flex flex-col">
                <OrderSummaryCard
                  subtotal={invoice.subtotal}
                  taxAmount={invoice.totalTax}
                  discountAmount={invoice.totalDiscount}
                  total={invoice.grandTotal}
                  paidAmount={invoice.paidAmount || 0}
                  onRecordPayment={balanceDue > 0 ? () => setShowPaymentDialog(true) : undefined}
                  className="flex-1"
                  items={summaryItems.length > 0 ? summaryItems : undefined}
                />
              </div>
            </div>

            {/* Line items — full width */}
            {invoice.lineItems.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Line Items</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{invoice.lineItems.length} item{invoice.lineItems.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">#</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Item</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Qty</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Price</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Disc%</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">GST%</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Tax</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item, i) => (
                        <tr key={i} className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                          <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-2.5">
                            <div>
                              <span className="font-medium text-foreground">{item.name || item.description}</span>
                              {item.sku && <span className="text-muted-foreground ml-1">({item.sku})</span>}
                            </div>
                            {item.saleUnit && <span className="text-[10px] text-muted-foreground">{item.saleUnit}</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">₹{fmt(item.unitPrice)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            {item.discountPercent > 0 ? `${item.discountPercent}%` : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            {item.taxSlab > 0 ? `${item.taxSlab}%` : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            {item.taxAmount > 0 ? `₹${fmt(item.taxAmount)}` : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-medium">₹{fmt(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GST Breakdown card — only if we have tax breakdown data */}
            {invoice.taxBreakdown.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                  <Receipt className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">GST Breakdown</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Slab</th>
                        <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Taxable Amt</th>
                        <th className="text-right px-4 py-2 font-semibold text-muted-foreground">CGST</th>
                        <th className="text-right px-4 py-2 font-semibold text-muted-foreground">SGST</th>
                        <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Total GST</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.taxBreakdown.map((slab, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="px-4 py-2 font-medium text-foreground">GST @ {slab.rate}%</td>
                          <td className="px-4 py-2 text-right tabular-nums">₹{fmt(slab.taxableAmount)}</td>
                          <td className="px-4 py-2 text-right tabular-nums">₹{fmt(slab.cgst)}</td>
                          <td className="px-4 py-2 text-right tabular-nums">₹{fmt(slab.sgst)}</td>
                          <td className="px-4 py-2 text-right tabular-nums font-medium">₹{fmt(slab.totalTax)}</td>
                        </tr>
                      ))}
                      {/* Total row */}
                      <tr className="bg-muted/30 font-semibold">
                        <td className="px-4 py-2 text-foreground">Total</td>
                        <td className="px-4 py-2 text-right tabular-nums">₹{fmt(invoice.taxBreakdown.reduce((s, t) => s + t.taxableAmount, 0))}</td>
                        <td className="px-4 py-2 text-right tabular-nums">₹{fmt(invoice.taxBreakdown.reduce((s, t) => s + t.cgst, 0))}</td>
                        <td className="px-4 py-2 text-right tabular-nums">₹{fmt(invoice.taxBreakdown.reduce((s, t) => s + t.sgst, 0))}</td>
                        <td className="px-4 py-2 text-right tabular-nums">₹{fmt(invoice.totalTax)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Notes</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-foreground leading-relaxed">{invoice.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4 flex items-center gap-3 flex-shrink-0">
            {balanceDue > 0 && (
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1"
                onClick={() => setShowPaymentDialog(true)}>
                <CreditCard className="h-3.5 w-3.5" /> Record Payment
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1"
              onClick={() => setShowPreview(true)}>
              <Printer className="h-3.5 w-3.5" /> Print Invoice
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <RecordPaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        totalAmount={invoice.grandTotal}
        paidAmount={invoice.paidAmount || 0}
        onRecordPayment={handleRecordPayment}
        entityLabel={invoice.invoiceNumber}
      />

      <InvoicePreviewDialog
        invoice={invoice}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}
