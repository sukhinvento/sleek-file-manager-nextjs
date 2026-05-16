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
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

// Inline logo mark — pulse + shield (works in print without external assets)
const LogoMark = () => (
  <div style={{
    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
    background: 'linear-gradient(135deg, hsl(220, 52%, 48%), hsl(222, 55%, 28%))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 10px hsl(220 52% 42% / 0.3)',
  }}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="28" height="28">
      <path d="M16 2.5 L25.5 7.5 L25.5 18.5 Q25.5 26.5 16 30.5 Q6.5 26.5 6.5 18.5 L6.5 7.5 Z"
            stroke="white" strokeWidth="1.75" strokeLinejoin="round"/>
      <polyline points="8,18 11,18 13,14 16,22 19,15 21,18 24,18"
                stroke="#4dd8c8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data }, ref) => {
    const totalBeforeTax = data.items.reduce((s, i) => s + i.subtotal, 0);
    const totalTax = data.items.reduce((s, i) => s + (i.subtotal * (i.taxSlab ?? 0)) / 100, 0);
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const balanceDue = data.total - (data.paidAmount ?? 0);
    const isPO = data.type === 'purchase';

    /* ── inline styles use CSS custom properties from index.css ── */
    const PRIMARY    = 'hsl(220, 48%, 42%)';
    const PRIMARY_DK = 'hsl(222, 55%, 28%)';
    const PRIMARY_LT = 'hsl(220, 50%, 94%)';
    const PRIMARY_BORDER = 'hsl(220, 36%, 82%)';
    const FG        = 'hsl(215, 28%, 14%)';
    const MUTED_FG  = 'hsl(220, 12%, 46%)';
    const BORDER    = 'hsl(220, 16%, 90%)';
    const BG        = 'hsl(220, 18%, 98%)';
    const PENDING_BG = 'hsl(38, 100%, 96%)';
    const PENDING_FG = 'hsl(33, 92%, 26%)';
    const SUCCESS_BG = 'hsl(158, 60%, 94%)';
    const SUCCESS_FG = 'hsl(158, 70%, 24%)';

    const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

    return (
      <div
        ref={ref}
        style={{
          background: 'white',
          color: FG,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 11,
          lineHeight: 1.45,
          maxWidth: 794,
          margin: '0 auto',
          padding: '40px 48px 32px',
          WebkitFontSmoothing: 'antialiased',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle watermark */}
        <div aria-hidden style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-22deg)',
          fontSize: 120, fontWeight: 800, letterSpacing: '-0.04em', whiteSpace: 'nowrap',
          color: `hsl(220 48% 42% / 0.04)`,
          userSelect: 'none', pointerEvents: 'none',
        }}>
          {data.paidAmount && data.paidAmount >= data.total ? 'PAID' : isPO ? 'PURCHASE ORDER' : 'INVOICE'}
        </div>

        {/* ── HEADER ── */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          borderBottom: `2px solid ${PRIMARY}`, paddingBottom: 16, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LogoMark />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: FG }}>
                {data.companyName || 'MedSystem'}
              </div>
              <div style={{ fontSize: 10, color: MUTED_FG, marginTop: 3, letterSpacing: '0.02em' }}>
                Hospital Administration · {isPO ? 'Procurement' : 'Billing'}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED_FG, fontWeight: 600, marginBottom: 2 }}>
              {isPO ? 'Purchase Order' : 'Tax Invoice'}
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: PRIMARY_DK, lineHeight: 1 }}>
              {isPO ? 'P/ORDER' : 'INVOICE'}
            </div>
            <div style={{ ...mono, fontSize: 11, color: FG, marginTop: 6, fontWeight: 500 }}>
              {data.invoiceNumber}
            </div>
          </div>
        </header>

        {/* ── META GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.3fr 1fr', gap: 24, paddingBottom: 18, borderBottom: `1px solid ${BORDER}`, marginBottom: 16 }}>
          {/* From */}
          <div>
            <div style={{ fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED_FG, fontWeight: 600, marginBottom: 5 }}>
              {isPO ? 'Vendor' : 'Billed from'}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: FG, marginBottom: 3 }}>{data.companyName}</div>
            <div style={{ fontSize: 10, color: MUTED_FG, lineHeight: 1.55 }}>
              {data.companyAddress && <div>{data.companyAddress}</div>}
              {data.companyPhone && <div>📞 {data.companyPhone}</div>}
              {data.companyEmail && <div>✉ {data.companyEmail}</div>}
              {data.companyGST && <div style={{ ...mono, marginTop: 2 }}>GSTIN: {data.companyGST}</div>}
            </div>
          </div>

          {/* To */}
          <div>
            <div style={{ fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED_FG, fontWeight: 600, marginBottom: 5 }}>
              {isPO ? 'Ship to' : 'Billed to'}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: FG, marginBottom: 3 }}>{data.partyName}</div>
            <div style={{ fontSize: 10, color: MUTED_FG, lineHeight: 1.55 }}>
              {data.partyAddress && <div>{data.partyAddress}</div>}
              {data.partyPhone && <div>📞 {data.partyPhone}</div>}
              {data.partyEmail && <div>✉ {data.partyEmail}</div>}
              {data.partyGST && <div style={{ ...mono, marginTop: 2 }}>GSTIN: {data.partyGST}</div>}
            </div>
          </div>

          {/* Status / dates */}
          <div>
            <div style={{ fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED_FG, fontWeight: 600, marginBottom: 6 }}>Status</div>
            <div style={{ marginBottom: 10 }}>
              {data.paidAmount && data.paidAmount >= data.total ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: SUCCESS_BG, color: SUCCESS_FG, border: `1px solid ${SUCCESS_FG}30` }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: SUCCESS_FG, display: 'inline-block' }} />
                  Paid
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: PENDING_BG, color: PENDING_FG, border: `1px solid hsl(33 92% 46% / 0.2)` }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: 'hsl(33 92% 46%)', display: 'inline-block' }} />
                  Awaiting payment
                </span>
              )}
            </div>
            <div style={{ fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED_FG, fontWeight: 600, marginBottom: 2 }}>Date</div>
            <div style={{ fontSize: 10.5, fontWeight: 500, marginBottom: 8 }}>
              {new Date(data.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {data.dueDate && (
              <>
                <div style={{ fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED_FG, fontWeight: 600, marginBottom: 2 }}>Due date</div>
                <div style={{ fontSize: 10.5, fontWeight: 500 }}>
                  {new Date(data.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── SUMMARY STRIP ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: PRIMARY_LT, border: `1px solid ${PRIMARY_BORDER}`, borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          {[
            { l: 'Items', v: data.items.length },
            { l: 'Units', v: data.items.reduce((s, i) => s + i.qty, 0).toLocaleString('en-IN') },
            { l: isPO ? 'Order #' : 'Invoice #', v: data.invoiceNumber },
            { l: 'Amount due', v: formatIndianCurrency(balanceDue > 0 ? balanceDue : data.total), accent: true },
          ].map((cell, i) => (
            <div key={i} style={{
              padding: '11px 16px',
              borderRight: i < 3 ? `1px solid ${PRIMARY_BORDER}` : undefined,
              background: cell.accent ? `hsl(220, 50%, 88%)` : undefined,
            }}>
              <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: PRIMARY, fontWeight: 600, marginBottom: 3 }}>{cell.l}</div>
              <div style={{ ...mono, fontSize: cell.accent ? 15 : 13, fontWeight: cell.accent ? 700 : 600, color: PRIMARY_DK }}>{cell.v}</div>
            </div>
          ))}
        </div>

        {/* ── LINE ITEMS ── */}
        <div style={{ fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED_FG, fontWeight: 600, marginBottom: 6 }}>Line items</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: FG, color: 'white' }}>
              {['#', 'SKU / Description', 'Qty', 'Unit', 'Price', 'Disc', 'Tax', 'Amount'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i === 0 ? 'left' : i >= 4 ? 'right' : i === 2 ? 'right' : 'left',
                  padding: '9px 10px',
                  fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
                  paddingLeft: i === 0 ? 14 : undefined,
                  paddingRight: i === 7 ? 14 : undefined,
                  width: i === 0 ? 32 : i === 2 ? 52 : i === 3 ? 40 : i >= 4 && i < 7 ? 60 : i === 7 ? 80 : undefined,
                }}>
                  {h}
                </th>
              ))}
              {data.showItemQRCodes && <th style={{ padding: '9px 10px', textAlign: 'center', fontSize: 8.5 }}>QR</th>}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 1 ? BG : 'white' }}>
                <td style={{ ...mono, padding: '9px 10px 9px 14px', borderBottom: `1px solid ${BORDER}`, fontSize: 9, color: MUTED_FG }}>{String(idx + 1).padStart(2, '0')}</td>
                <td style={{ padding: '9px 10px', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  {item.barcode && <div style={{ fontSize: 8.5, color: MUTED_FG, marginTop: 2, ...mono }}>BC: {item.barcode}</div>}
                </td>
                <td style={{ ...mono, padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'right', fontWeight: 600 }}>{item.qty}</td>
                <td style={{ padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, color: MUTED_FG, fontSize: 9.5 }}>{item.saleUnit || 'unit'}</td>
                <td style={{ ...mono, padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'right' }}>{formatIndianCurrency(item.unitPrice)}</td>
                <td style={{ ...mono, padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'right', color: MUTED_FG }}>{item.discount ? `${item.discount}%` : '—'}</td>
                <td style={{ ...mono, padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'right', color: MUTED_FG }}>{item.taxSlab ? `${item.taxSlab}%` : '—'}</td>
                <td style={{ ...mono, padding: '9px 14px 9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'right', fontWeight: 700 }}>{formatIndianCurrency(item.subtotal)}</td>
                {data.showItemQRCodes && (
                  <td style={{ padding: '9px 10px', borderBottom: `1px solid ${BORDER}`, textAlign: 'center' }}>
                    {item.qrCode && <QRCodeSVG value={item.qrCode} size={30} level="M" />}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── TOTALS + TERMS ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32, marginTop: 18 }}>
          {/* Terms / payment */}
          <div style={{ flex: 1, maxWidth: '62%', fontSize: 9.5, color: 'hsl(215 14% 36%)', lineHeight: 1.55 }}>
            {data.paymentMethod && (
              <>
                <div style={{ fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED_FG, fontWeight: 600, marginBottom: 5 }}>Payment method</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: BG, borderRadius: 6, marginBottom: 10, ...mono }}>
                  {data.paymentMethod}
                </div>
              </>
            )}
            {data.terms && (
              <>
                <div style={{ fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED_FG, fontWeight: 600, marginBottom: 5 }}>Terms &amp; conditions</div>
                <p style={{ margin: 0, whiteSpace: 'pre-line', lineHeight: 1.55 }}>{data.terms}</p>
              </>
            )}
            {data.notes && (
              <>
                <div style={{ fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED_FG, fontWeight: 600, margin: '10px 0 5px' }}>Notes</div>
                <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{data.notes}</p>
              </>
            )}
          </div>

          {/* Totals table */}
          <div style={{ width: '34%', minWidth: 220 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
              <tbody>
                <tr>
                  <td style={{ ...mono, padding: '5px 0', color: MUTED_FG }}>Taxable amount</td>
                  <td style={{ ...mono, padding: '5px 0', textAlign: 'right', fontWeight: 500 }}>{formatIndianCurrency(totalBeforeTax)}</td>
                </tr>
                {data.discount > 0 && (
                  <tr>
                    <td style={{ ...mono, padding: '5px 0', color: MUTED_FG }}>Discount</td>
                    <td style={{ ...mono, padding: '5px 0', textAlign: 'right', fontWeight: 500, color: 'hsl(354 70% 44%)' }}>− {formatIndianCurrency(data.discount)}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ ...mono, padding: '5px 0', color: MUTED_FG, borderTop: `1px dashed ${BORDER}`, paddingTop: 8 }}>CGST</td>
                  <td style={{ ...mono, padding: '5px 0', textAlign: 'right', borderTop: `1px dashed ${BORDER}`, paddingTop: 8 }}>{formatIndianCurrency(cgst)}</td>
                </tr>
                <tr>
                  <td style={{ ...mono, padding: '5px 0', color: MUTED_FG }}>SGST</td>
                  <td style={{ ...mono, padding: '5px 0', textAlign: 'right' }}>{formatIndianCurrency(sgst)}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ borderTop: `2px solid ${PRIMARY}`, paddingTop: 0 }} />
                </tr>
                <tr>
                  <td style={{ ...mono, padding: '10px 0 5px', fontWeight: 700, fontSize: 13, color: FG }}>Total</td>
                  <td style={{ ...mono, padding: '10px 0 5px', textAlign: 'right', fontWeight: 700, fontSize: 16, color: PRIMARY_DK }}>{formatIndianCurrencyFull(data.total)}</td>
                </tr>
                {data.paidAmount !== undefined && data.paidAmount > 0 && (
                  <>
                    <tr>
                      <td style={{ ...mono, padding: '3px 0', color: MUTED_FG, fontSize: 10 }}>Paid</td>
                      <td style={{ ...mono, padding: '3px 0', textAlign: 'right', color: 'hsl(158 70% 30%)', fontWeight: 600, fontSize: 10 }}>{formatIndianCurrency(data.paidAmount)}</td>
                    </tr>
                    {balanceDue > 0 && (
                      <tr>
                        <td style={{ padding: '3px 0' }}>
                          <span style={{ display: 'inline-block', padding: '2px 10px', background: PENDING_BG, color: PENDING_FG, borderRadius: 999, fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, border: `1px solid hsl(33 92% 46% / 0.2)` }}>Balance due</span>
                        </td>
                        <td style={{ ...mono, padding: '3px 0', textAlign: 'right', fontWeight: 700, color: 'hsl(354 70% 44%)' }}>{formatIndianCurrency(balanceDue)}</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── AMOUNT IN WORDS ── */}
        <div style={{ background: FG, color: 'white', padding: '10px 14px', borderRadius: 8, marginTop: 16, fontSize: 10 }}>
          <span style={{ fontWeight: 700 }}>Amount in words: </span>
          <span style={{ fontWeight: 500 }}>{numberToWords(data.total)} Rupees Only</span>
        </div>

        {/* ── QR + SIGNATURE ── */}
        {(data.includeQRCode && data.qrCodeData) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, marginTop: 22, paddingTop: 16, borderTop: `1px dashed ${BORDER}` }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ background: 'white', border: `1px solid ${BORDER}`, padding: 4, borderRadius: 6 }}>
                <QRCodeSVG value={data.qrCodeData} size={60} level="H" includeMargin />
              </div>
              <div style={{ fontSize: 9.5, color: MUTED_FG, lineHeight: 1.4 }}>
                <div style={{ fontWeight: 600, color: FG, fontSize: 10, marginBottom: 2 }}>Scan to verify</div>
                Scan to view order<br />details online
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 200 }}>
              <div style={{ borderTop: `1px solid ${FG}`, width: 200, marginLeft: 'auto', paddingTop: 4 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600 }}>{data.companyName}</div>
                <div style={{ fontSize: 8.5, color: MUTED_FG }}>Authorised signatory</div>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 8.5, color: MUTED_FG }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {data.companyEmail && <span><strong style={{ color: FG }}>Email</strong> {data.companyEmail}</span>}
            {data.companyPhone && <span><strong style={{ color: FG }}>Phone</strong> {data.companyPhone}</span>}
          </div>
          <div>This is a computer-generated document. No signature required.</div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  function sub1k(n: number): string {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + sub1k(n % 100) : '');
  }
  const n = Math.floor(num);
  if (n < 1000) return sub1k(n);
  const cr = Math.floor(n / 10000000);
  const lk = Math.floor((n % 10000000) / 100000);
  const th = Math.floor((n % 100000) / 1000);
  const rm = n % 1000;
  return [
    cr > 0 ? sub1k(cr) + ' Crore' : '',
    lk > 0 ? sub1k(lk) + ' Lakh' : '',
    th > 0 ? sub1k(th) + ' Thousand' : '',
    rm > 0 ? sub1k(rm) : '',
  ].filter(Boolean).join(' ');
}
