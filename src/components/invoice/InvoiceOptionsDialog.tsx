import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ResponsiveDialog, 
  ResponsiveDialogContent, 
  ResponsiveDialogDescription, 
  ResponsiveDialogFooter, 
  ResponsiveDialogHeader, 
  ResponsiveDialogTitle,
  ResponsiveDialogBody
} from '@/components/ui/responsive-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Printer, FileDown, QrCode, Settings } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface InvoiceOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: InvoiceGenerationOptions) => void;
  type: 'print' | 'pdf';
}

export interface InvoiceGenerationOptions {
  includeQRCode: boolean;
  qrCodeContent: 'basic' | 'detailed';
  showItemQRCodes: boolean;
}

export const InvoiceOptionsDialog = ({
  isOpen,
  onClose,
  onGenerate,
  type,
}: InvoiceOptionsDialogProps) => {
  const [options, setOptions] = useState<InvoiceGenerationOptions>({
    includeQRCode: true,
    qrCodeContent: 'basic',
    showItemQRCodes: false,
  });

  const handleGenerate = () => {
    onGenerate(options);
    onClose();
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {type === 'print' ? (
              <>
                <Printer className="h-5 w-5 text-blue-400" />
                Print Invoice
              </>
            ) : (
              <>
                <FileDown className="h-5 w-5 text-blue-400" />
                Export to PDF
              </>
            )}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Configure invoice generation options
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="space-y-6">
          {/* QR Code Option */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-qr" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Include QR Code
              </Label>
              <p className="text-sm text-muted-foreground">
                Add QR code to invoice for easy scanning
              </p>
            </div>
            <Switch
              id="include-qr"
              checked={options.includeQRCode}
              onCheckedChange={(checked) =>
                setOptions({ ...options, includeQRCode: checked })
              }
            />
          </div>

          {options.includeQRCode && (
            <div className="space-y-3 pl-6 border-l-2 border-muted">
              <Label className="text-sm font-medium">QR Code Content</Label>
              <RadioGroup
                value={options.qrCodeContent}
                onValueChange={(value: 'basic' | 'detailed') =>
                  setOptions({ ...options, qrCodeContent: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="basic" id="qr-basic" />
                  <Label htmlFor="qr-basic" className="font-normal cursor-pointer">
                    Basic (Invoice number & date)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="detailed" id="qr-detailed" />
                  <Label htmlFor="qr-detailed" className="font-normal cursor-pointer">
                    Detailed (Full invoice data)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Item QR Codes */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="item-qr" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Show Item QR Codes
              </Label>
              <p className="text-sm text-muted-foreground">
                Display QR codes for individual items (if available)
              </p>
            </div>
            <Switch
              id="item-qr"
              checked={options.showItemQRCodes}
              onCheckedChange={(checked) =>
                setOptions({ ...options, showItemQRCodes: checked })
              }
            />
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
            Cancel
          </Button>
          <Button onClick={handleGenerate} className="flex-1 sm:flex-initial">
            {type === 'print' ? (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
