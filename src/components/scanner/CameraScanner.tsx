import { useState, useEffect, useRef } from 'react';
import { Camera, X, Zap, ZapOff, SwitchCamera, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface CameraScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  scanType: 'barcode' | 'qr';
}

export const CameraScanner = ({ onScan, onClose, scanType }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setHasPermission(true);
      setError(null);
      startScanning();
    } catch (err: any) {
      console.error('Camera error:', err);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Unable to access camera. Please check your device settings.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanning = () => {
    setIsScanning(true);
    
    // Simulate barcode/QR detection
    // In production, you would use a library like jsQR or QuaggaJS
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // This is a simulation - in production, use jsQR or QuaggaJS here
          // For now, we'll provide manual trigger
          simulateScan();
        }
      }
    }, 100);
  };

  const simulateScan = () => {
    // In production, this would be replaced with actual barcode/QR detection
    // For now, users can use the manual trigger or type the code
  };

  const handleManualScan = () => {
    // Simulate a successful scan with a sample code
    const sampleCode = scanType === 'barcode' ? '1234567890128' : 'QR-INV-001';
    handleScanSuccess(sampleCode);
  };

  const handleScanSuccess = (code: string) => {
    if (code && code !== lastScan) {
      setLastScan(code);
      onScan(code);
      
      toast({
        title: "Code Scanned!",
        description: `${scanType === 'barcode' ? 'Barcode' : 'QR Code'}: ${code}`,
      });
      
      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
      
      // Auto-close after successful scan
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-white" />
            <span className="text-white font-medium">
              Scan {scanType === 'barcode' ? 'Barcode' : 'QR Code'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {stream && (
              <Button
                variant="ghost"
                size="sm"
                onClick={switchCamera}
                className="text-white hover:bg-white/20"
              >
                <SwitchCamera className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full flex items-center justify-center">
        {hasPermission === null && (
          <div className="text-white text-center">
            <div className="animate-pulse">Requesting camera access...</div>
          </div>
        )}

        {hasPermission === false && (
          <div className="max-w-md mx-auto p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {hasPermission && (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning Frame Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Scanning area */}
                <div className={`
                  ${scanType === 'barcode' ? 'w-80 h-32' : 'w-64 h-64'}
                  border-4 border-white/50 rounded-lg relative
                `}>
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -translate-x-1 -translate-y-1"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary translate-x-1 -translate-y-1"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary -translate-x-1 translate-y-1"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary translate-x-1 translate-y-1"></div>
                  
                  {/* Scanning line animation */}
                  {isScanning && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="w-full h-0.5 bg-primary shadow-lg shadow-primary/50 animate-scan"></div>
                    </div>
                  )}
                </div>
                
                {/* Instruction text */}
                <div className="mt-4 text-center text-white">
                  <div className="text-sm font-medium mb-2">
                    {scanType === 'barcode' 
                      ? 'Align barcode within the frame'
                      : 'Position QR code in the frame'
                    }
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {isScanning ? (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 animate-pulse" />
                        Scanning...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ZapOff className="h-3 w-3" />
                        Paused
                      </span>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 pb-8">
        <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Alert className="bg-amber-500/20 border-amber-500/50">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-white text-xs">
                  <div className="font-medium mb-1">Camera Scanning Demo</div>
                  <div>
                    Real barcode/QR scanning requires libraries like <strong>jsQR</strong> or <strong>QuaggaJS</strong>.
                    For now, use the button below to simulate a scan, or use the manual scanner.
                  </div>
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleManualScan} 
                className="w-full"
                size="lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Simulate Scan ({scanType === 'barcode' ? '1234567890128' : 'QR-INV-001'})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSS for scanning animation */}
      <style>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(${scanType === 'barcode' ? '128px' : '256px'});
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CameraScanner;
