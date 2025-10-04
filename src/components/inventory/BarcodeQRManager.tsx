import { useState } from 'react';
import { Barcode, QrCode, Radio, Copy, Download, Check, Smartphone, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface BarcodeQRManagerProps {
  itemId: string;
  itemName: string;
  sku: string;
  barcode?: string;
  barcodeType?: string;
  qrCode?: string;
  rfidTag?: string;
  onUpdate?: (data: {
    barcode?: string;
    barcodeType?: string;
    qrCode?: string;
    rfidTag?: string;
  }) => void;
  disabled?: boolean;
}

export const BarcodeQRManager = ({
  itemId,
  itemName,
  sku,
  barcode: initialBarcode,
  barcodeType: initialBarcodeType,
  qrCode: initialQrCode,
  rfidTag: initialRfidTag,
  onUpdate,
  disabled = false
}: BarcodeQRManagerProps) => {
  const [barcode, setBarcode] = useState(initialBarcode || '');
  const [barcodeType, setBarcodeType] = useState(initialBarcodeType || 'EAN-13');
  const [qrCode, setQrCode] = useState(initialQrCode || '');
  const [rfidTag, setRfidTag] = useState(initialRfidTag || '');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generateBarcode = () => {
    // Don't regenerate if already exists
    if (barcode && !disabled) {
      toast({
        title: "Barcode Already Exists",
        description: `This item already has barcode: ${barcode}. Delete it first to generate a new one.`,
        variant: "destructive"
      });
      return;
    }

    // Generate EAN-13 barcode (13 digits)
    const random12Digits = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    
    // Calculate check digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(random12Digits[i]);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    const newBarcode = random12Digits + checkDigit;
    setBarcode(newBarcode);
    
    if (onUpdate) {
      onUpdate({ barcode: newBarcode, barcodeType });
    }
    
    toast({
      title: "Barcode Generated",
      description: `Generated ${barcodeType} barcode: ${newBarcode}`,
    });
  };

  const generateQRCode = () => {
    // Don't regenerate if already exists
    if (qrCode && !disabled) {
      toast({
        title: "QR Code Already Exists",
        description: "This item already has a QR code. Delete it first to generate a new one.",
        variant: "destructive"
      });
      return;
    }

    // Generate QR data with item information
    const qrData = JSON.stringify({
      id: itemId,
      name: itemName,
      sku: sku,
      barcode: barcode,
      timestamp: new Date().toISOString()
    });
    
    // Use base64 encoding for the QR code data
    const encodedQR = btoa(qrData);
    setQrCode(encodedQR);
    
    if (onUpdate) {
      onUpdate({ qrCode: encodedQR });
    }
    
    toast({
      title: "QR Code Generated",
      description: "QR code generated with item information",
    });
  };

  const generateRFID = () => {
    // Don't regenerate if already exists
    if (rfidTag && !disabled) {
      toast({
        title: "RFID Tag Already Exists",
        description: `This item already has RFID tag: ${rfidTag}. Delete it first to generate a new one.`,
        variant: "destructive"
      });
      return;
    }

    // Generate RFID tag (typically 24 hex characters for EPC Gen2)
    const hexChars = '0123456789ABCDEF';
    let rfid = '';
    for (let i = 0; i < 24; i++) {
      rfid += hexChars[Math.floor(Math.random() * 16)];
    }
    
    setRfidTag(rfid);
    
    if (onUpdate) {
      onUpdate({ rfidTag: rfid });
    }
    
    toast({
      title: "RFID Tag Generated",
      description: `Generated RFID tag: ${rfid}`,
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
    
    toast({
      title: "Copied to Clipboard",
      description: `${field} copied successfully`,
    });
  };

  const handleDeleteBarcode = () => {
    setBarcode('');
    setBarcodeType('');
    
    if (onUpdate) {
      onUpdate({ barcode: undefined, barcodeType: undefined });
    }
    
    toast({
      title: "Barcode Deleted",
      description: "You can now generate a new barcode",
    });
  };

  const handleDeleteQRCode = () => {
    setQrCode('');
    
    if (onUpdate) {
      onUpdate({ qrCode: undefined });
    }
    
    toast({
      title: "QR Code Deleted",
      description: "You can now generate a new QR code",
    });
  };

  const handleDeleteRFID = () => {
    setRfidTag('');
    
    if (onUpdate) {
      onUpdate({ rfidTag: undefined });
    }
    
    toast({
      title: "RFID Tag Deleted",
      description: "You can now generate a new RFID tag",
    });
  };

  const downloadBarcode = () => {
    // In a real implementation, this would generate and download an actual barcode image
    toast({
      title: "Download Barcode",
      description: "Barcode download functionality would be implemented here using a library like JsBarcode",
    });
  };

  const downloadQRCode = () => {
    // In a real implementation, this would generate and download an actual QR code image
    toast({
      title: "Download QR Code",
      description: "QR code download functionality would be implemented here using a library like qrcode.react",
    });
  };

  const printLabel = () => {
    toast({
      title: "Print Label",
      description: "Label printing functionality would connect to a thermal printer",
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          Barcode & Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="barcode" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="barcode" className="text-xs">
              <Barcode className="h-3 w-3 mr-1" />
              Barcode
            </TabsTrigger>
            <TabsTrigger value="qrcode" className="text-xs">
              <QrCode className="h-3 w-3 mr-1" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="rfid" className="text-xs">
              <Radio className="h-3 w-3 mr-1" />
              RFID
            </TabsTrigger>
          </TabsList>

          {/* Barcode Tab */}
          <TabsContent value="barcode" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="barcodeType" className="text-xs font-medium flex items-center gap-1">
                  <Barcode className="h-3 w-3 text-muted-foreground" />
                  Barcode Type
                </Label>
                <Select value={barcodeType} onValueChange={setBarcodeType} disabled={disabled}>
                  <SelectTrigger className="h-9 text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EAN-13">EAN-13 (European Article Number)</SelectItem>
                    <SelectItem value="UPC-A">UPC-A (Universal Product Code)</SelectItem>
                    <SelectItem value="CODE-128">CODE-128 (High-density)</SelectItem>
                    <SelectItem value="CODE-39">CODE-39 (Alphanumeric)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="barcode" className="text-xs font-medium">Barcode Number</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Enter or generate barcode"
                    disabled={disabled}
                    className="h-9 text-sm font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateBarcode}
                    disabled={disabled}
                    className="shrink-0"
                  >
                    Generate
                  </Button>
                </div>
              </div>

              {barcode && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-muted-foreground">Generated Barcode</div>
                    <Badge variant="outline" className="text-xs">{barcodeType}</Badge>
                  </div>
                  
                  {/* Simulated Barcode Display */}
                  <div className="bg-white p-4 rounded border border-border flex flex-col items-center">
                    <div className="text-3xl font-mono tracking-widest">{barcode}</div>
                    <div className="flex gap-1 mt-2">
                      {barcode.split('').map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 ${i % 2 === 0 ? 'bg-black h-16' : 'bg-black h-12'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(barcode, 'Barcode')}
                      className="flex-1"
                    >
                      {copiedField === 'Barcode' ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadBarcode}
                      className="flex-1"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteBarcode}
                      disabled={disabled}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qrcode" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium">QR Code Data</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={qrCode ? 'QR code generated with item data' : ''}
                    placeholder="Generate QR code"
                    disabled
                    className="h-9 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateQRCode}
                    disabled={disabled}
                    className="shrink-0"
                  >
                    Generate
                  </Button>
                </div>
              </div>

              {qrCode && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">Generated QR Code</div>
                  
                  {/* Simulated QR Code Display */}
                  <div className="bg-white p-4 rounded border border-border flex flex-col items-center">
                    <div className="w-48 h-48 grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} rounded-sm`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Scan to view item details
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-xs">
                    <div className="font-medium mb-1">Encoded Information:</div>
                    <div className="space-y-1 text-muted-foreground">
                      <div>• Item ID: {itemId}</div>
                      <div>• Name: {itemName}</div>
                      <div>• SKU: {sku}</div>
                      {barcode && <div>• Barcode: {barcode}</div>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(qrCode, 'QR Code')}
                      className="flex-1"
                    >
                      {copiedField === 'QR Code' ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      Copy Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadQRCode}
                      className="flex-1"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteQRCode}
                      disabled={disabled}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* RFID Tab */}
          <TabsContent value="rfid" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="rfidTag" className="text-xs font-medium flex items-center gap-1">
                  <Radio className="h-3 w-3 text-muted-foreground" />
                  RFID Tag
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="rfidTag"
                    value={rfidTag}
                    onChange={(e) => setRfidTag(e.target.value.toUpperCase())}
                    placeholder="Enter or generate RFID tag"
                    disabled={disabled}
                    className="h-9 text-sm font-mono"
                    maxLength={24}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateRFID}
                    disabled={disabled}
                    className="shrink-0"
                  >
                    Generate
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  EPC Gen2 format (24 hex characters)
                </div>
              </div>

              {rfidTag && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">RFID Tag Information</div>
                  
                  <div className="bg-white p-4 rounded border border-border">
                    <div className="flex items-center justify-center mb-3">
                      <Radio className="h-12 w-12 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Tag ID</div>
                      <div className="text-lg font-mono font-bold break-all">{rfidTag}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                      <div className="text-muted-foreground">Protocol</div>
                      <div className="font-medium">EPC Gen2</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded">
                      <div className="text-muted-foreground">Frequency</div>
                      <div className="font-medium">UHF 860-960 MHz</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(rfidTag, 'RFID Tag')}
                      className="flex-1"
                    >
                      {copiedField === 'RFID Tag' ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      Copy Tag
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={printLabel}
                      className="flex-1"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Print Label
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteRFID}
                      disabled={disabled}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                <div className="flex gap-2 text-xs">
                  <div className="text-amber-600 shrink-0">ℹ️</div>
                  <div className="text-amber-800 dark:text-amber-200">
                    <div className="font-medium mb-1">RFID Tag Notes:</div>
                    <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                      <li>Requires RFID reader hardware</li>
                      <li>Read range: 1-10 meters</li>
                      <li>Can be read through materials</li>
                      <li>Ideal for bulk scanning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BarcodeQRManager;
