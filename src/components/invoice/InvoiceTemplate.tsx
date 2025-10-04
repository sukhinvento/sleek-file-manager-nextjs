import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatIndianCurrency, formatIndianCurrencyFull } from '@/lib/utils';
import { Building2, Phone, Mail, MapPin, Calendar, Hash, User } from 'lucide-react';

interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  taxSlab?: number;
  saleUnit?: string;
  qrCode?: string;  // QR code data for this specific item
  barcode?: string; // Barcode for this specific item
}

export interface InvoiceData {
  type: 'purchase' | 'sales';
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  
  // Company Info
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyGST?: string;
  companyLogo?: string;
  
  // Customer/Vendor Info
  partyName: string;
  partyAddress: string;
  partyPhone: string;
  partyEmail: string;
  partyGST?: string;
  
  // Shipping Info
  shippingAddress?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Financial
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  paidAmount?: number;
  
  // Additional
  notes?: string;
  paymentMethod?: string;
  terms?: string;
  
  // QR Code
  includeQRCode?: boolean;
  qrCodeData?: string;
  showItemQRCodes?: boolean;  // Show QR codes for individual items
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data }, ref) => {
    const calculateTax = (item: InvoiceItem) => {
      const taxRate = item.taxSlab || 0;
      return (item.subtotal * taxRate) / 100;
    };

    const totalBeforeTax = data.items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTax = data.items.reduce((sum, item) => sum + calculateTax(item), 0);
    
    // Calculate GST breakdown (CGST + SGST or IGST)
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;

    return (
      <div ref={ref} className="bg-white p-6 max-w-4xl mx-auto text-black print:p-3">
        {/* Header */}
        <div className="border-b-4 border-black pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {data.companyLogo ? (
                <img 
                  src={data.companyLogo} 
                  alt={data.companyName}
                  className="h-12 mb-2"
                />
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  <h1 className="text-xl font-bold text-black">{data.companyName}</h1>
                </div>
              )}
              <div className="text-xs text-gray-700 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-2.5 w-2.5 text-gray-500" />
                  <span>{data.companyAddress}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-2.5 w-2.5 text-gray-500" />
                  <span>{data.companyPhone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-2.5 w-2.5 text-gray-500" />
                  <span>{data.companyEmail}</span>
                </div>
                {data.companyGST && (
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-2.5 w-2.5 text-gray-500" />
                    <span className="font-semibold">GSTIN: {data.companyGST}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="bg-black text-white px-4 py-2 inline-block mb-2">
                <h2 className="text-lg font-bold tracking-wide">
                  {data.type === 'purchase' ? 'PURCHASE ORDER' : 'TAX INVOICE'}
                </h2>
              </div>
              <div className="text-xs space-y-0.5">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-gray-500">Invoice #:</span>
                  <span className="font-bold text-black">{data.invoiceNumber}</span>
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <Calendar className="h-2.5 w-2.5 text-gray-500" />
                  <span className="text-gray-500">Date:</span>
                  <span className="font-semibold text-gray-800">{new Date(data.invoiceDate).toLocaleDateString()}</span>
                </div>
                {data.dueDate && (
                  <div className="flex items-center justify-end gap-1.5">
                    <Calendar className="h-2.5 w-2.5 text-gray-500" />
                    <span className="text-gray-500">Due Date:</span>
                    <span className="font-semibold text-gray-800">{new Date(data.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Party & Shipping Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="bg-gray-900 text-white px-3 py-1.5 mb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wide">
                {data.type === 'purchase' ? 'Vendor Details' : 'Bill To'}
              </h3>
            </div>
            <div className="border-2 border-gray-900 p-2.5 bg-gray-50">
              <div className="font-bold text-black text-sm mb-1.5 flex items-center gap-1.5">
                <User className="h-3 w-3" />
                {data.partyName}
              </div>
              <div className="text-xs text-gray-700 space-y-0.5">
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-2.5 w-2.5 mt-0.5 flex-shrink-0 text-gray-500" />
                  <span>{data.partyAddress}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-2.5 w-2.5 text-gray-500" />
                  <span>{data.partyPhone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-2.5 w-2.5 text-gray-500" />
                  <span>{data.partyEmail}</span>
                </div>
                {data.partyGST && (
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-2.5 w-2.5 text-gray-500" />
                    <span className="font-semibold">GSTIN: {data.partyGST}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {data.shippingAddress && (
            <div>
              <div className="bg-gray-900 text-white px-3 py-1.5 mb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wide">Ship To</h3>
              </div>
              <div className="border-2 border-gray-900 p-2.5 bg-gray-50">
                <div className="text-xs text-gray-700">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="h-2.5 w-2.5 mt-0.5 flex-shrink-0 text-gray-500" />
                    <span>{data.shippingAddress}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.includeQRCode && data.qrCodeData && !data.shippingAddress && (
            <div className="flex items-center justify-center">
              <div className="border-2 border-gray-900 p-3 bg-gray-50">
                <QRCodeSVG 
                  value={data.qrCodeData} 
                  size={100}
                  level="H"
                  includeMargin={true}
                />
                <p className="text-xs text-center text-gray-600 mt-1.5 font-semibold">Scan for details</p>
              </div>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="border border-gray-800 px-2 py-1.5 text-left text-xs font-bold">#</th>
                <th className="border border-gray-800 px-2 py-1.5 text-left text-xs font-bold">Item Description</th>
                {data.showItemQRCodes && (
                  <th className="border border-gray-800 px-2 py-1.5 text-center text-xs font-bold">QR</th>
                )}
                <th className="border border-gray-800 px-2 py-1.5 text-center text-xs font-bold">HSN</th>
                <th className="border border-gray-800 px-2 py-1.5 text-center text-xs font-bold">Unit</th>
                <th className="border border-gray-800 px-2 py-1.5 text-right text-xs font-bold">Qty</th>
                <th className="border border-gray-800 px-2 py-1.5 text-right text-xs font-bold">Rate</th>
                <th className="border border-gray-800 px-2 py-1.5 text-right text-xs font-bold">Disc%</th>
                <th className="border border-gray-800 px-2 py-1.5 text-right text-xs font-bold">GST%</th>
                <th className="border border-gray-800 px-2 py-1.5 text-right text-xs font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-800">{index + 1}</td>
                  <td className="border border-gray-300 px-2 py-1 text-xs font-semibold text-black">
                    {item.name}
                    {item.barcode && (
                      <div className="text-[10px] text-gray-600 mt-0.5 font-normal">BC: {item.barcode}</div>
                    )}
                  </td>
                  {data.showItemQRCodes && (
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {item.qrCode && (
                        <div className="flex justify-center">
                          <QRCodeSVG 
                            value={item.qrCode} 
                            size={35}
                            level="M"
                          />
                        </div>
                      )}
                    </td>
                  )}
                  <td className="border border-gray-300 px-2 py-1 text-xs text-center text-gray-700">-</td>
                  <td className="border border-gray-300 px-2 py-1 text-xs text-center text-gray-700">{item.saleUnit || 'Unit'}</td>
                  <td className="border border-gray-300 px-2 py-1 text-xs text-right font-semibold text-gray-800">{item.qty}</td>
                  <td className="border border-gray-300 px-2 py-1 text-xs text-right text-gray-700">
                    {formatIndianCurrency(item.unitPrice)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-xs text-right text-gray-700">{item.discount}%</td>
                  <td className="border border-gray-300 px-2 py-1 text-xs text-right text-gray-700">{item.taxSlab || 0}%</td>
                  <td className="border border-gray-300 px-2 py-1 text-xs text-right font-bold text-black">
                    {formatIndianCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-4">
          <div className="w-72 border-2 border-gray-900">
            <div className="bg-gray-900 text-white px-3 py-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wide">Summary</h3>
            </div>
            <div className="p-3 space-y-1.5 bg-gray-50">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 font-medium">Taxable Amount:</span>
                <span className="font-bold text-gray-900">{formatIndianCurrency(totalBeforeTax)}</span>
              </div>
              {data.discount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-medium">Discount:</span>
                  <span className="font-bold text-red-600">
                    - {formatIndianCurrency(data.discount)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-1.5 mt-1.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">CGST:</span>
                  <span className="font-semibold text-gray-800">{formatIndianCurrency(cgst)}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">SGST:</span>
                  <span className="font-semibold text-gray-800">{formatIndianCurrency(sgst)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-bold">Total GST:</span>
                  <span className="font-bold text-gray-900">{formatIndianCurrency(totalTax)}</span>
                </div>
              </div>
              <div className="border-t-2 border-black pt-2 flex justify-between">
                <span className="font-bold text-black text-sm">Total Amount:</span>
                <span className="font-bold text-black text-base">{formatIndianCurrencyFull(data.total)}</span>
              </div>
              {data.paidAmount !== undefined && data.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-xs pt-1.5 border-t border-gray-300">
                    <span className="text-gray-600 font-medium">Paid Amount:</span>
                    <span className="font-bold text-green-600">
                      {formatIndianCurrency(data.paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-red-600">Balance Due:</span>
                    <span className="font-bold text-red-600">
                      {formatIndianCurrency(data.total - data.paidAmount)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="bg-gray-900 text-white p-2.5 mb-4">
          <div className="text-xs">
            <span className="font-bold">Amount in Words: </span>
            <span className="font-medium">{numberToWords(data.total)} Rupees Only</span>
          </div>
        </div>

        {/* Payment & Notes */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {data.paymentMethod && (
            <div>
              <div className="bg-gray-800 text-white px-2.5 py-1.5 mb-1.5">
                <h3 className="text-xs font-bold">Payment Method</h3>
              </div>
              <p className="text-xs text-gray-700 bg-gray-50 border border-gray-300 p-2 font-medium">{data.paymentMethod}</p>
            </div>
          )}
          
          {data.notes && (
            <div>
              <div className="bg-gray-800 text-white px-2.5 py-1.5 mb-1.5">
                <h3 className="text-xs font-bold">Notes</h3>
              </div>
              <p className="text-xs text-gray-700 bg-gray-50 border border-gray-300 p-2 whitespace-pre-line">{data.notes}</p>
            </div>
          )}
        </div>

        {/* Terms & QR Code */}
        <div className="border-t-2 border-black pt-4 mt-4">
          <div className="flex justify-between items-end">
            <div className="flex-1">
              {data.terms && (
                <div className="text-[10px] text-gray-700">
                  <h4 className="font-bold text-black mb-1 text-xs">Terms & Conditions:</h4>
                  <p className="whitespace-pre-line">{data.terms}</p>
                </div>
              )}
            </div>
            
            {data.includeQRCode && data.qrCodeData && data.shippingAddress && (
              <div className="ml-4 border-2 border-gray-900 p-1.5">
                <QRCodeSVG 
                  value={data.qrCodeData} 
                  size={80}
                  level="H"
                  includeMargin={true}
                />
                <p className="text-[10px] text-center text-gray-600 mt-1 font-semibold">Scan</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[10px] text-gray-600 border-t border-gray-300 pt-3">
          <p className="font-semibold">This is a computer-generated invoice and does not require a signature.</p>
          <p className="mt-0.5 font-medium">Thank you for your business!</p>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';

// Helper function to convert number to words (Indian system)
function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanThousand(n % 100) : '');
  }
  
  const integerPart = Math.floor(num);
  
  if (integerPart < 1000) {
    return convertLessThanThousand(integerPart);
  }
  
  const crores = Math.floor(integerPart / 10000000);
  const lakhs = Math.floor((integerPart % 10000000) / 100000);
  const thousands = Math.floor((integerPart % 100000) / 1000);
  const remainder = integerPart % 1000;
  
  let result = '';
  
  if (crores > 0) {
    result += convertLessThanThousand(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    result += convertLessThanThousand(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    result += convertLessThanThousand(thousands) + ' Thousand ';
  }
  if (remainder > 0) {
    result += convertLessThanThousand(remainder);
  }
  
  return result.trim();
}
