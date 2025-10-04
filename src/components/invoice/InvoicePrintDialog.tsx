import { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InvoiceTemplate, InvoiceData } from './InvoiceTemplate';
import { InvoiceOptionsDialog, InvoiceGenerationOptions } from './InvoiceOptionsDialog';
import { generatePDF } from '@/lib/pdfUtils';
import { toast } from '@/hooks/use-toast';

interface InvoicePrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
  mode: 'print' | 'pdf' | 'preview' | null;
}

export const InvoicePrintDialog = ({
  isOpen,
  onClose,
  invoiceData,
  mode,
}: InvoicePrintDialogProps) => {
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [currentMode, setCurrentMode] = useState<'print' | 'pdf' | null>(null);
  const [invoiceOptions, setInvoiceOptions] = useState<InvoiceGenerationOptions>({
    includeQRCode: true,
    qrCodeContent: 'basic',
    showItemQRCodes: false,
  });
  const invoiceRef = useRef<HTMLDivElement>(null);

  const generateQRCodeData = (options: InvoiceGenerationOptions): string => {
    if (options.qrCodeContent === 'basic') {
      return JSON.stringify({
        type: invoiceData.type,
        number: invoiceData.invoiceNumber,
        date: invoiceData.invoiceDate,
        total: invoiceData.total,
        party: invoiceData.partyName,
      });
    } else {
      // Detailed QR code with all invoice data
      return JSON.stringify({
        type: invoiceData.type,
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        partyName: invoiceData.partyName,
        partyPhone: invoiceData.partyPhone,
        partyEmail: invoiceData.partyEmail,
        items: invoiceData.items.map(item => ({
          name: item.name,
          qty: item.qty,
          rate: item.unitPrice,
          amount: item.subtotal,
        })),
        subtotal: invoiceData.subtotal,
        tax: invoiceData.taxAmount,
        total: invoiceData.total,
        paymentMethod: invoiceData.paymentMethod,
      });
    }
  };

  const handleOptionsGenerate = (options: InvoiceGenerationOptions) => {
    setInvoiceOptions(options);
    
    // Small delay to ensure DOM is updated with new options
    setTimeout(() => {
      if (currentMode === 'print') {
        handlePrint();
      } else if (currentMode === 'pdf') {
        handleExportPDF();
      }
    }, 100);
  };

  const handlePrint = () => {
    // Trigger browser print dialog
    setTimeout(() => {
      window.print();
      toast({
        title: 'Print Dialog Opened',
        description: 'Please complete printing from the browser dialog.',
      });
    }, 500);
  };

  const handleExportPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const filename = `${invoiceData.type === 'purchase' ? 'PO' : 'INV'}-${invoiceData.invoiceNumber}.pdf`;
      
      await generatePDF(invoiceRef.current, {
        filename,
        orientation: 'portrait',
        format: 'a4',
        quality: 2,
      });

      toast({
        title: 'PDF Generated',
        description: `Invoice has been exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle initial mode from parent
  useState(() => {
    if (mode && mode !== 'preview') {
      setCurrentMode(mode);
      setShowOptionsDialog(true);
    }
  });

  const finalInvoiceData: InvoiceData = {
    ...invoiceData,
    includeQRCode: invoiceOptions.includeQRCode,
    qrCodeData: invoiceOptions.includeQRCode
      ? generateQRCodeData(invoiceOptions)
      : undefined,
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <div className="print:p-0">
            <InvoiceTemplate ref={invoiceRef} data={finalInvoiceData} />
          </div>
        </DialogContent>
      </Dialog>

      <InvoiceOptionsDialog
        isOpen={showOptionsDialog}
        onClose={() => {
          setShowOptionsDialog(false);
          setCurrentMode(null);
        }}
        onGenerate={handleOptionsGenerate}
        type={currentMode || 'print'}
      />
    </>
  );
};
