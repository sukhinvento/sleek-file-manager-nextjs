import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatIndianCurrency, formatIndianCurrencyFull } from '@/lib/utils';

interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  taxSlab?: number;
  saleUnit?: string;
  qrCode?: string;
  barcode?: string;
}

// ── NEW: GST Tax Breakdown from Backend ──
export interface TaxBreakdown {
  rate: number;
  taxable_amount: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total_tax: number;
}

export interface InvoiceData {
  type: 'purchase' | 'sales';
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;

  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyGST?: string;
  companyLogo?: string;

  partyName: string;
  partyAddress: string;
  partyPhone: string;
  partyEmail: string;
  partyGST?: string;

  shippingAddress?: string;

  items: InvoiceItem[];

  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  paidAmount?: number;

  notes?: string;
  paymentMethod?: string;
  terms?: string;

  includeQRCode?: boolean;
  qrCodeData?: string;
  showItemQRCodes?: boolean;

  // ── NEW: GST Breakdown fields from backend ──
  tax_breakdown?: TaxBreakdown[];
  total_discount?: number;
  seller_gstin?: string;
  buyer_gstin?: string;
  place_of_supply?: string;
  is_inter_state?: boolean;
  invoice_type?: 'tax_invoice' | 'bill_of_supply';
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

const BORDER = '#e5e5e5';
const MUTED_FG = '#666666';
const HEADER_BG = '#f5f5f5';

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data }, ref) => {
    const totalBeforeTax = data.items.reduce((s, i) => s + i.subtotal, 0);
    const totalTax = data.taxAmount || (data.tax_breakdown?.reduce((sum, t) => sum + (t.total_tax || 0), 0) || 0);
    const grandTotal = data.total;

    return (
      <div ref={ref} style={{ fontFamily: 'Arial, sans-serif', color: '#1a1a1a', padding: '0' }}>
        {/* HEADER */}
        <div style={{ marginBottom: 24, borderBottom: `2px solid ${BORDER}`, paddingBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* LEFT: Logo */}
            <div style={{ flex: 1 }}>
              {data.companyLogo && (
                <img src={data.companyLogo} alt="Logo" style={{ maxWidth: 150, maxHeight: 80 }} />
              )}
            </div>

            {/* CENTER: Company Details */}
            <div style={{ flex: 2, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                {data.companyName}
              </div>
              <div style={{ fontSize: 12, color: MUTED_FG, lineHeight: 1.5 }}>
                {data.companyAddress && <div>{data.companyAddress}</div>}
                {data.companyPhone && <div>Ph: {data.companyPhone}</div>}
                {data.companyEmail && <div>{data.companyEmail}</div>}
                {data.companyGST && (
                  <div style={{ fontFamily: 'monospace', marginTop: 4 }}>
                    GSTIN: {data.companyGST}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Invoice Details */}
            <div style={{ flex: 1, textAlign: 'right', fontSize: 12 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>
                {data.invoice_type === 'bill_of_supply' ? 'Bill of Supply' : 'Tax Invoice'}
              </div>
              <div>Invoice #: <strong>{data.invoiceNumber}</strong></div>
              <div>Date: {data.invoiceDate}</div>
              {data.dueDate && <div>Due: {data.dueDate}</div>}
              {data.seller_gstin && (
                <div style={{ fontFamily: 'monospace', marginTop: 4, fontSize: 11 }}>
                  Seller GSTIN: {data.seller_gstin}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PARTY DETAILS */}
        <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* BILL TO */}
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8, borderBottom: `1px solid ${BORDER}`, paddingBottom: 4 }}>
              Bill To:
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.6, color: MUTED_FG }}>
              <div style={{ fontWeight: 500, color: '#1a1a1a' }}>{data.partyName}</div>
              {data.partyAddress && <div>{data.partyAddress}</div>}
              {data.partyPhone && <div>Ph: {data.partyPhone}</div>}
              {data.partyEmail && <div>{data.partyEmail}</div>}
              {data.partyGST && (
                <div style={{ fontFamily: 'monospace', marginTop: 4 }}>
                  GSTIN: {data.partyGST}
                </div>
              )}
              {data.buyer_gstin && (
                <div style={{ fontFamily: 'monospace', marginTop: 2, fontSize: 11 }}>
                  Buyer GSTIN: {data.buyer_gstin}
                </div>
              )}
            </div>
          </div>

          {/* SHIP TO */}
          {data.shippingAddress && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8, borderBottom: `1px solid ${BORDER}`, paddingBottom: 4 }}>
                Ship To:
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: MUTED_FG }}>
                {data.shippingAddress}
              </div>
              {data.place_of_supply && (
                <div style={{ marginTop: 8, padding: 8, backgroundColor: HEADER_BG, fontSize: 11 }}>
                  <div style={{ color: MUTED_FG }}>Place of Supply:</div>
                  <div style={{ fontWeight: 'bold' }}>State Code: {data.place_of_supply}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LINE ITEMS TABLE */}
        <div style={{ marginBottom: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ backgroundColor: HEADER_BG }}>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: `1px solid ${BORDER}`, fontWeight: 500 }}>
                  #
                </th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, fontWeight: 500 }}>
                  Description
                </th>
                <th style={{ padding: '10px', textAlign: 'right', borderBottom: `1px solid ${BORDER}`, fontWeight: 500 }}>
                  Qty
                </th>
                <th style={{ padding: '10px', textAlign: 'right', borderBottom: `1px solid ${BORDER}`, fontWeight: 500 }}>
                  Unit
                </th>
                <th style={{ padding: '10px', textAlign: 'right', borderBottom: `1px solid ${BORDER}`, fontWeight: 500 }}>
                  Price
                </th>
                <th style={{ padding: '10px', textAlign: 'right', borderBottom: `1px solid ${BORDER}`, fontWeight: 500 }}>
                  Disc%
                </th>
                <th style={{ padding: '10px', textAlign: 'right', borderBottom: `1px solid ${BORDER}`, fontWeight: 500 }}>
                  Tax%
                </th>
                <th style={{ padding: '10px', textAlign: 'right', borderBottom: `1px solid ${BORDER}`, fontWeight: 500 }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'center' }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'left' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'right', color: MUTED_FG }}>
                    {item.qty}
                  </td>
                  <td style={{ padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'center', color: MUTED_FG }}>
                    {item.saleUnit || '—'}
                  </td>
                  <td style={{ padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'right', color: MUTED_FG }}>
                    {formatIndianCurrency(item.unitPrice)}
                  </td>
                  <td style={{ padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'right', color: MUTED_FG }}>
                    {item.discount ? `${item.discount}%` : '—'}
                  </td>
                  <td style={{ padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'right', color: MUTED_FG }}>
                    {item.taxSlab ? `${item.taxSlab}%` : '—'}
                  </td>
                  <td style={{ padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'right', fontWeight: 500 }}>
                    {formatIndianCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* BILLING SUMMARY SECTION — GST BREAKDOWN */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 20, padding: '0 10px' }}>
          {/* Subtotal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
            <span style={{ color: MUTED_FG }}>Subtotal:</span>
            <span style={{ fontWeight: 500 }}>{formatIndianCurrency(totalBeforeTax)}</span>
          </div>

          {/* GST — inline CGST/SGST per slab */}
          {data.tax_breakdown && data.tax_breakdown.length > 0 ? (
            <div style={{ marginBottom: 10 }}>
              {data.tax_breakdown.map((slab, idx) => (
                <div key={idx} style={{ borderLeft: '2px solid #d1d5db', marginLeft: 2, paddingLeft: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: MUTED_FG, marginBottom: 2 }}>
                    GST @ {slab.rate}% on {formatIndianCurrency(slab.taxable_amount)}
                  </div>
                  {slab.igst !== undefined && slab.igst > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: MUTED_FG }}>IGST @ {slab.rate}%</span>
                      <span style={{ fontWeight: 500 }}>{formatIndianCurrency(slab.igst)}</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: MUTED_FG }}>CGST @ {slab.rate / 2}%</span>
                        <span style={{ fontWeight: 500 }}>{formatIndianCurrency(slab.cgst)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: MUTED_FG }}>SGST @ {slab.rate / 2}%</span>
                        <span style={{ fontWeight: 500 }}>{formatIndianCurrency(slab.sgst)}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : totalTax > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
              <span style={{ color: MUTED_FG }}>GST:</span>
              <span style={{ fontWeight: 500 }}>{formatIndianCurrency(totalTax)}</span>
            </div>
          ) : null}

          {/* Discount */}
          {(data.discount > 0 || data.total_discount) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
              <span style={{ color: MUTED_FG }}>Discount:</span>
              <span style={{ fontWeight: 500 }}>-{formatIndianCurrency(data.total_discount || data.discount)}</span>
            </div>
          )}

          {/* GRAND TOTAL */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              backgroundColor: HEADER_BG,
              borderTop: `2px solid ${BORDER}`,
              borderBottom: `2px solid ${BORDER}`,
              fontSize: 14,
              fontWeight: 'bold',
            }}
          >
            <span>Grand Total</span>
            <span>{formatIndianCurrency(grandTotal)}</span>
          </div>

          {/* Paid Amount (if applicable) */}
          {data.paidAmount ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, marginBottom: 5, fontSize: 12 }}>
                <span style={{ color: MUTED_FG }}>Paid Amount:</span>
                <span style={{ fontWeight: 500 }}>{formatIndianCurrency(data.paidAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 'bold' }}>
                <span>Balance Due</span>
                <span>{formatIndianCurrency(grandTotal - data.paidAmount)}</span>
              </div>
            </>
          ) : null}
        </div>

        {/* FOOTER SECTION */}
        {(data.paymentMethod || data.terms || data.notes) && (
          <div style={{ marginTop: 20, paddingTop: 12, borderTop: `1px solid ${BORDER}`, fontSize: 12 }}>
            {data.paymentMethod && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold' }}>Payment Method: </span>
                <span>{data.paymentMethod}</span>
              </div>
            )}
            {data.terms && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold' }}>Terms: </span>
                <span>{data.terms}</span>
              </div>
            )}
            {data.notes && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold' }}>Notes: </span>
                <span>{data.notes}</span>
              </div>
            )}
          </div>
        )}

        {/* QR CODE */}
        {data.includeQRCode && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <QRCodeSVG value={data.qrCodeData || data.invoiceNumber} size={100} level="L" />
          </div>
        )}
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';
