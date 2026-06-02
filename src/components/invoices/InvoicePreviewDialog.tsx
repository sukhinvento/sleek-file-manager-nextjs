import React from 'react';
import DocumentPreviewDialog, { PrintableDocument } from '@/components/shared/DocumentPreviewDialog';
import { Invoice } from '@/services/invoiceService';

const SOURCE_LABELS: Record<string, string> = {
  purchase_order: 'Purchase Order',
  sales_order: 'Sales Order',
  hospital_billing: 'Hospital Bill',
  diagnostic: 'Diagnostic',
  diagnostic_booking: 'Diagnostic',
  admission: 'Admission',
};

interface InvoicePreviewDialogProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

function mapInvoiceToDocument(invoice: Invoice): PrintableDocument {
  const isPO = invoice.sourceType === 'purchase_order';

  const lineItems = invoice.lineItems.map(li => ({
    description: li.name || li.description,
    sku: li.sku,
    quantity: li.quantity,
    unitPrice: li.unitPrice,
    discount: li.discountPercent,
    taxSlab: li.taxSlab,
    taxAmount: li.taxAmount,
    amount: li.total,
    saleUnit: li.saleUnit,
  }));

  // Build GST breakdown for print
  const gstBreakdown = invoice.taxBreakdown.map(slab => ({
    rate: slab.rate,
    taxableAmount: slab.taxableAmount,
    cgst: slab.cgst,
    sgst: slab.sgst,
    totalTax: slab.totalTax,
  }));

  const details: { label: string; value: string }[] = [
    { label: 'Issue Date', value: invoice.issueDate || '—' },
    { label: 'Order Date', value: invoice.orderDate ? new Date(invoice.orderDate).toLocaleDateString('en-IN') : '—' },
    { label: 'Due Date', value: invoice.dueDate || '—' },
    { label: 'Source', value: SOURCE_LABELS[invoice.sourceType] || invoice.sourceType || '—' },
    { label: 'Ref #', value: invoice.sourceNumber || '—' },
  ];

  if (invoice.paymentMethod) {
    details.push({ label: 'Payment', value: invoice.paymentMethod });
  }

  return {
    documentType: 'Invoice',
    documentNumber: invoice.invoiceNumber,
    status: invoice.status,
    partyLabel: isPO ? 'Vendor' : 'Bill To',
    partyName: isPO ? invoice.vendorName : invoice.customerName,
    partyEmail: isPO ? invoice.vendorEmail : invoice.customerEmail,
    partyPhone: isPO ? invoice.vendorPhone : invoice.customerPhone,
    partyAddress: isPO ? invoice.vendorAddress : invoice.customerAddress,
    details,
    lineItems,
    subtotal: invoice.subtotal,
    taxAmount: invoice.totalTax,
    discountAmount: invoice.totalDiscount,
    grandTotal: invoice.grandTotal,
    paidAmount: invoice.paidAmount,
    notes: invoice.notes,
    shippingAddress: invoice.shippingAddress,
    shippingLabel: isPO ? 'Ship To' : 'Delivery Address',
    gstBreakdown,
  };
}

export default function InvoicePreviewDialog({ invoice, isOpen, onClose }: InvoicePreviewDialogProps) {
  return (
    <DocumentPreviewDialog
      doc={mapInvoiceToDocument(invoice)}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
