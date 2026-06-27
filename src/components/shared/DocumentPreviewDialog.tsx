import React, { useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, X, FileText } from 'lucide-react';

const PRIMARY = '#385a9f';

/* ------------------------------------------------------------------ */
/*  Generic printable document shape                                   */
/* ------------------------------------------------------------------ */
export interface PrintableLineItem {
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxSlab?: number;
  taxAmount?: number;
  amount: number;
  saleUnit?: string;
}

export interface GSTBreakdown {
  rate: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst?: number;
  totalTax: number;
}

export interface PrintableDocument {
  /** Document type label shown as the big title: INVOICE, PURCHASE ORDER, etc. */
  documentType: string;
  /** Document number (INV-001, PO-001, SO-001) */
  documentNumber: string;
  /** Status badge */
  status: string;
  statusColor?: { bg: string; text: string };

  /** Left column: "Bill To" / "Vendor" / "Customer" */
  partyLabel: string;
  partyName?: string;
  partyEmail?: string;
  partyPhone?: string;
  partyAddress?: string;

  /** Right column: key-value detail pairs */
  details: { label: string; value: string }[];

  /** Shipping / delivery address */
  shippingAddress?: string;
  shippingLabel?: string;

  /** Line items */
  lineItems: PrintableLineItem[];

  /** Financials */
  subtotal: number;
  taxAmount?: number;
  taxLabel?: string;
  discountAmount?: number;
  grandTotal: number;
  paidAmount?: number;

  /** GST breakdown by slab */
  gstBreakdown?: GSTBreakdown[];

  /** GST identity */
  sellerGstin?: string;
  buyerGstin?: string;
  placeOfSupply?: string;
  isInterState?: boolean;

  /** Optional */
  notes?: string;
  footerText?: string;
}

/* ------------------------------------------------------------------ */
/*  Status color defaults                                              */
/* ------------------------------------------------------------------ */
const DEFAULT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Draft:      { bg: '#f3f4f6', text: '#374151' },
  Pending:    { bg: '#fef3c7', text: '#92400e' },
  Approved:   { bg: '#dbeafe', text: '#1e40af' },
  Processing: { bg: '#dbeafe', text: '#1e40af' },
  Issued:     { bg: '#dbeafe', text: '#1e40af' },
  Paid:       { bg: '#d1fae5', text: '#065f46' },
  Partial:    { bg: '#fef3c7', text: '#92400e' },
  Delivered:  { bg: '#d1fae5', text: '#065f46' },
  Shipped:    { bg: '#ede9fe', text: '#5b21b6' },
  Completed:  { bg: '#d1fae5', text: '#065f46' },
  Cancelled:  { bg: '#fee2e2', text: '#991b1b' },
  Overdue:    { bg: '#fee2e2', text: '#991b1b' },
  Received:   { bg: '#d1fae5', text: '#065f46' },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface DocumentPreviewDialogProps {
  doc: PrintableDocument;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentPreviewDialog({ doc, isOpen, onClose }: DocumentPreviewDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const paidAmount = doc.paidAmount ?? 0;
  const balanceDue = Math.max(0, doc.grandTotal - paidAmount);
  const isPaid = balanceDue <= 0 && doc.grandTotal > 0;
  const showPayment = paidAmount > 0 || doc.grandTotal > 0;
  const statusStyle = doc.statusColor || DEFAULT_STATUS_COLORS[doc.status] || DEFAULT_STATUS_COLORS.Draft;

  const fmt = (n: number) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---- Print handler ---- */
  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;

    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;

    w.document.write(`<!DOCTYPE html><html><head>
      <title>${doc.documentType} ${doc.documentNumber}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;padding:40px;font-size:13px;line-height:1.5}
        table{width:100%;border-collapse:collapse;margin-bottom:24px}
        thead th{background:${PRIMARY}10;color:${PRIMARY};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;padding:10px 12px;text-align:left;border-bottom:1px solid #e5e7eb}
        thead th.r{text-align:right}
        tbody td{padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px}
        tbody td.r{text-align:right;font-variant-numeric:tabular-nums}
        tbody tr:last-child td{border-bottom:1px solid #e5e7eb}
        .gst-table{margin-bottom:24px}
        .gst-table thead th{background:#f0f9ff;color:#0369a1}
        .total-row{background:#f8fafc;font-weight:600}
        @media print{body{padding:20px}}
      </style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  /* ---- Inline styles (for print-safe rendering) ---- */
  const S = {
    thCell: { background: `${PRIMARY}10`, color: PRIMARY, fontSize: 10, fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: 0.8, padding: '10px 12px', textAlign: 'left' as const, borderBottom: '1px solid #e5e7eb' },
    thRight: { background: `${PRIMARY}10`, color: PRIMARY, fontSize: 10, fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: 0.8, padding: '10px 12px', textAlign: 'right' as const, borderBottom: '1px solid #e5e7eb' },
    td: { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 13 },
    tdRight: { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 13, textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums' as const },
    label: { fontSize: 10, fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: 0.8, color: '#9ca3af' },
    val: { fontSize: 13, fontWeight: 500, color: '#374151' },
  };

  const hasDiscount = (doc.discountAmount ?? 0) > 0;
  const hasTax = (doc.taxAmount ?? 0) > 0;
  const showLineDiscount = doc.lineItems.some(li => (li.discount ?? 0) > 0);
  const showLineTax = doc.lineItems.some(li => (li.taxSlab ?? 0) > 0);
  const hasGSTBreakdown = (doc.gstBreakdown ?? []).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[860px] w-full p-0 max-h-[92vh] flex flex-col overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" style={{ color: PRIMARY }} />
            <span className="text-sm font-semibold text-foreground">{doc.documentType} Preview</span>
            <Badge variant="outline" className="text-[10px] ml-1">{doc.documentNumber}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* ── Preview area ── */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div
            ref={printRef}
            className="bg-white max-w-[760px] mx-auto rounded-lg shadow-sm border"
            style={{ padding: 40, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}
          >
            {/* ─ Header ─ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 20, borderBottom: `2px solid ${PRIMARY}` }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: PRIMARY }}>MedSystem</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Healthcare Management System</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: PRIMARY, letterSpacing: -0.5 }}>
                  {doc.documentType.toUpperCase()}
                </h1>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{doc.documentNumber}</div>
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                    fontSize: 11, fontWeight: 600, backgroundColor: statusStyle.bg, color: statusStyle.text,
                  }}>
                    {doc.status}
                  </span>
                </div>
              </div>
            </div>

            {/* ─ Party + Details ─ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
              {/* Left: party info */}
              <div>
                <h3 style={{ ...S.label, marginBottom: 8 }}>{doc.partyLabel}</h3>
                {doc.partyName && <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 3 }}>{doc.partyName}</p>}
                {doc.partyEmail && <p style={{ fontSize: 13, color: '#374151', marginBottom: 3 }}>{doc.partyEmail}</p>}
                {doc.partyPhone && <p style={{ fontSize: 13, color: '#374151', marginBottom: 3 }}>{doc.partyPhone}</p>}
                {doc.partyAddress && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 1.4 }}>{doc.partyAddress}</p>}
              </div>
              {/* Right: detail pairs */}
              <div>
                <h3 style={{ ...S.label, marginBottom: 8 }}>{doc.documentType} Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                  {doc.details.map((d, i) => (
                    <div key={i}>
                      <div style={S.label}>{d.label}</div>
                      <div style={S.val}>{d.value || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─ Shipping address ─ */}
            {doc.shippingAddress && (
              <div style={{ marginBottom: 24, padding: '10px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                <div style={{ ...S.label, marginBottom: 4 }}>{doc.shippingLabel || 'Ship To'}</div>
                <p style={{ fontSize: 12, color: '#374151' }}>{doc.shippingAddress}</p>
              </div>
            )}

            {/* ─ Line items ─ */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
              <thead>
                <tr>
                  <th style={S.thCell}>#</th>
                  <th style={S.thCell}>Description</th>
                  <th style={S.thRight}>Qty</th>
                  <th style={S.thRight}>Unit Price</th>
                  {showLineDiscount && <th style={S.thRight}>Disc%</th>}
                  {showLineTax && <th style={S.thRight}>GST%</th>}
                  {showLineTax && <th style={S.thRight}>Tax</th>}
                  <th style={S.thRight}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {doc.lineItems.length > 0 ? doc.lineItems.map((item, i) => (
                  <tr key={i}>
                    <td style={{ ...S.td, color: '#6b7280' }}>{i + 1}</td>
                    <td style={{ ...S.td, fontWeight: 500 }}>
                      {item.description}
                      {item.sku && <span style={{ color: '#9ca3af', fontSize: 11, marginLeft: 4 }}>({item.sku})</span>}
                      {item.saleUnit && <span style={{ display: 'block', color: '#9ca3af', fontSize: 10 }}>{item.saleUnit}</span>}
                    </td>
                    <td style={S.tdRight}>{item.quantity}</td>
                    <td style={S.tdRight}>{fmt(item.unitPrice)}</td>
                    {showLineDiscount && (
                      <td style={S.tdRight}>{(item.discount ?? 0) > 0 ? `${item.discount}%` : '—'}</td>
                    )}
                    {showLineTax && (
                      <td style={S.tdRight}>{(item.taxSlab ?? 0) > 0 ? `${item.taxSlab}%` : '—'}</td>
                    )}
                    {showLineTax && (
                      <td style={S.tdRight}>{(item.taxAmount ?? 0) > 0 ? `₹${fmt(item.taxAmount!)}` : '—'}</td>
                    )}
                    <td style={{ ...S.tdRight, fontWeight: 500 }}>₹{fmt(item.amount)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={showLineDiscount && showLineTax ? 8 : showLineDiscount || showLineTax ? 7 : 5} style={{ padding: '20px 12px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                      No line items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ─ GST Identity ─ */}
            {(doc.sellerGstin || doc.buyerGstin) && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, display: 'flex', gap: 32, fontSize: 12 }}>
                {doc.sellerGstin && (
                  <div>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>Seller GSTIN: </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0369a1' }}>{doc.sellerGstin}</span>
                  </div>
                )}
                {doc.buyerGstin && (
                  <div>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>Buyer GSTIN: </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0369a1' }}>{doc.buyerGstin}</span>
                  </div>
                )}
                {doc.placeOfSupply && (
                  <div>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>Place of Supply: </span>
                    <span style={{ fontWeight: 600, color: '#0369a1' }}>{doc.placeOfSupply}</span>
                  </div>
                )}
                {doc.isInterState && (
                  <div>
                    <span style={{ padding: '2px 6px', background: '#fef3c7', color: '#92400e', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>INTER-STATE</span>
                  </div>
                )}
              </div>
            )}

            {/* ─ Totals ─ */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <div style={{ width: 320 }}>
                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>₹{fmt(doc.subtotal)}</span>
                </div>
                {/* Discount */}
                {hasDiscount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>Discount</span>
                    <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: '#dc2626' }}>
                      -₹{fmt(doc.discountAmount!)}
                    </span>
                  </div>
                )}
                {/* GST — inline CGST/SGST/IGST breakdown per slab */}
                {hasGSTBreakdown ? (
                  <>
                    {doc.gstBreakdown!.map((slab, i) => {
                      const hasIgst = (slab.igst ?? 0) > 0;
                      return (
                        <div key={i} style={{ borderLeft: `2px solid ${PRIMARY}20`, marginLeft: 4, paddingLeft: 10, marginTop: i === 0 ? 4 : 0, marginBottom: 4 }}>
                          <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                            GST @ {slab.rate}% on ₹{fmt(slab.taxableAmount)}
                          </div>
                          {hasIgst ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 12 }}>
                              <span style={{ color: '#6b7280' }}>IGST @ {slab.rate}%</span>
                              <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>₹{fmt(slab.igst!)}</span>
                            </div>
                          ) : (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 12 }}>
                                <span style={{ color: '#6b7280' }}>CGST @ {slab.rate / 2}%</span>
                                <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>₹{fmt(slab.cgst)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 12 }}>
                                <span style={{ color: '#6b7280' }}>SGST @ {slab.rate / 2}%</span>
                                <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>₹{fmt(slab.sgst)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : hasTax ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>GST</span>
                    <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>₹{fmt(doc.taxAmount!)}</span>
                  </div>
                ) : null}
                {/* Grand Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `2px solid ${PRIMARY}`, paddingTop: 10, marginTop: 6, fontSize: 16, fontWeight: 700, color: PRIMARY }}>
                  <span>Grand Total</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>₹{fmt(doc.grandTotal)}</span>
                </div>

                {/* Payment */}
                {showPayment && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                      <span style={{ color: '#059669' }}>Amount Paid</span>
                      <span style={{ fontWeight: 500, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>₹{fmt(paidAmount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14, fontWeight: 600 }}>
                      <span style={{ color: isPaid ? '#059669' : '#d97706' }}>Balance Due</span>
                      <span style={{ color: isPaid ? '#059669' : '#d97706', fontVariantNumeric: 'tabular-nums' }}>₹{fmt(balanceDue)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─ Notes ─ */}
            {doc.notes && (
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: 14, marginBottom: 24 }}>
                <h4 style={{ ...S.label, marginBottom: 6 }}>Notes</h4>
                <p style={{ fontSize: 12, color: '#4b5563' }}>{doc.notes}</p>
              </div>
            )}

            {/* ─ Footer ─ */}
            <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: '#9ca3af' }}>
                {doc.footerText || 'Thank you for your business. This is a computer-generated document.'}
              </p>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>MedSystem Healthcare Management System</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
