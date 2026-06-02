import { useState, useEffect } from 'react';
import { Scan, Camera, Radio, Barcode, QrCode, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogBody
} from "@/components/ui/responsive-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import { InventoryItem } from '@/types/inventory';
import { fetchInventoryItems } from '@/services/inventoryService';
import { CameraScanner } from './CameraScanner';

interface ItemScannerProps {
  onItemScanned: (item: InventoryItem, quantity?: number) => void;
  existingItems?: string[]; // Array of already added item IDs
  disabled?: boolean;
}

export const ItemScanner = ({ 
  onItemScanned, 
  existingItems = [],
  disabled = false 
}: ItemScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanMethod, setScanMethod] = useState<'barcode' | 'qr' | 'rfid'>('barcode');
  const [quantity, setQuantity] = useState(1);
  const [showCamera, setShowCamera] = useState(false);
  const [scanMode, setScanMode] = useState<'manual' | 'camera' | 'samples'>('manual');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const input = document.getElementById('scan-input');
        input?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Load inventory from backend on mount
  useEffect(() => {
    fetchInventoryItems().then(setInventoryItems).catch(() => {});
  }, []);

  const findItemByCode = (code: string, method: 'barcode' | 'qr' | 'rfid'): InventoryItem | null => {
    const trimmedCode = code.trim();

    return inventoryItems.find(item => {
      switch (method) {
        case 'barcode':
          return item.barcode === trimmedCode;
        case 'qr':
          try {
            const decoded = atob(trimmedCode);
            const data = JSON.parse(decoded);
            return data.id === item.id;
          } catch {
            return item.qrCode === trimmedCode;
          }
        case 'rfid':
          return item.rfidTag === trimmedCode;
        default:
          return false;
      }
    }) || null;
  };

  const handleScan = async () => {
    if (!scanInput.trim()) {
      toast({ title: 'Input Required', description: 'Please enter or scan a code', variant: 'destructive' });
      return;
    }

    setIsScanning(true);
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const item = findItemByCode(scanInput, scanMethod);

    if (item) {
      // Check if item already exists
      if (existingItems.includes(item.id)) {
        toast({ title: 'Item Already Added', description: `${item.name} is already in the list`, variant: 'destructive' });
        setIsScanning(false);
        return;
      }

      setLastScanned(item.id);
      onItemScanned(item, quantity);
      
      toast({ title: 'Item Scanned Successfully', description: `${item.name} — SKU: ${item.sku} | Qty: ${quantity}`, variant: 'success' });

      // Reset for next scan
      setScanInput('');
      setQuantity(1);
      
      // Auto-focus for rapid scanning
      setTimeout(() => {
        const input = document.getElementById('scan-input');
        input?.focus();
      }, 100);
    } else {
      toast({ title: 'Item Not Found', description: `No item found with ${scanMethod.toUpperCase()} code: ${scanInput}`, variant: 'destructive' });
    }

    setIsScanning(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const getScanIcon = () => {
    switch (scanMethod) {
      case 'barcode':
        return <Barcode className="h-4 w-4" />;
      case 'qr':
        return <QrCode className="h-4 w-4" />;
      case 'rfid':
        return <Radio className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        disabled={disabled}
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Scan className="h-4 w-4" />
        Scan Item
      </Button>
      
      <ResponsiveDialog open={isOpen} onOpenChange={setIsOpen}>
        <ResponsiveDialogContent className="!max-w-[600px] max-w-[600px]">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              <Camera className="h-5 w-5 text-white" />
              Item Scanner
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          <ResponsiveDialogBody className="space-y-4">
          {/* Scan Method Tabs */}
          <Tabs value={scanMethod} onValueChange={(v) => setScanMethod(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="barcode">
                <Barcode className="h-4 w-4 mr-2" />
                Barcode
              </TabsTrigger>
              <TabsTrigger value="qr">
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="rfid">
                <Radio className="h-4 w-4 mr-2" />
                RFID
              </TabsTrigger>
            </TabsList>

            <TabsContent value={scanMethod} className="space-y-4 mt-4">
              {/* Camera Scan Button */}
              {scanMethod !== 'rfid' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowCamera(true)}
                    variant="default"
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Camera className="h-4 w-4" />
                    Use Camera to Scan {scanMethod === 'barcode' ? 'Barcode' : 'QR Code'}
                  </Button>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or enter manually
                  </span>
                </div>
              </div>

              {/* Scanner Input */}
              <div className="space-y-2">
                <Label htmlFor="scan-input" className="flex items-center gap-2">
                  {getScanIcon()}
                  {scanMethod === 'barcode' && 'Scan or Enter Barcode'}
                  {scanMethod === 'qr' && 'Scan or Enter QR Code'}
                  {scanMethod === 'rfid' && 'Scan or Enter RFID Tag'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="scan-input"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      scanMethod === 'barcode' ? 'e.g., 1234567890128' :
                      scanMethod === 'qr' ? 'e.g., QR-INV-001' :
                      'e.g., A1B2C3D4E5F6...'
                    }
                    disabled={isScanning}
                    className="font-mono"
                  />
                  <Button 
                    onClick={handleScan} 
                    disabled={isScanning || !scanInput.trim()}
                    className="shrink-0"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Scan className="h-4 w-4 mr-2" />
                        Scan
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  disabled={isScanning}
                  className="w-32"
                />
              </div>

              {/* Instructions */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1 text-xs">
                    <div className="font-medium">How to use:</div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Use a {scanMethod.toUpperCase()} scanner to scan the item code</li>
                      <li>Or manually enter the code and press Enter or click Scan</li>
                      <li>Adjust quantity before scanning if needed</li>
                      <li>Item will be automatically added to the order</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Sample Codes from Inventory */}
              {(() => {
                const sampleItems = inventoryItems
                  .filter(item =>
                    scanMethod === 'barcode' ? !!item.barcode :
                    scanMethod === 'qr' ? !!item.qrCode :
                    !!item.rfidTag
                  )
                  .slice(0, 3);
                if (sampleItems.length === 0) return null;
                return (
                  <Card className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Items with {scanMethod === 'barcode' ? 'Barcode' : scanMethod === 'qr' ? 'QR Code' : 'RFID Tag'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid gap-2 text-xs">
                        {sampleItems.map(item => {
                          const code = scanMethod === 'barcode' ? item.barcode! : scanMethod === 'qr' ? item.qrCode! : item.rfidTag!;
                          return (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-muted-foreground font-mono">{code}</div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setScanInput(code)}>
                                Use
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </TabsContent>
          </Tabs>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>

      {/* Camera Scanner */}
      {showCamera && (
        <CameraScanner
          scanType={scanMethod as 'barcode' | 'qr'}
          onScan={(code) => {
            setScanInput(code);
            setShowCamera(false);
            // Auto-trigger scan after camera scan
            setTimeout(() => handleScan(), 100);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
};

export default ItemScanner;
