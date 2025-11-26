import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getApiUrl } from "@/lib/api-config";

interface ScanIDProps {
  onVerified?: (data: any) => void;
}

export default function ScanID({ onVerified }: ScanIDProps) {
  const [scanResult, setScanResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [tesseractWorker, setTesseractWorker] = useState<any>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const qrRegionId = "qr-scanner-region";
  const { toast } = useToast();

  useEffect(() => {
    const initTesseract = async () => {
      try {
        const worker = await createWorker("eng+amh", 1, {
          logger: (m: any) => {
            if (m.status === "recognizing text") {
              setProgress(`Processing: ${Math.round(m.progress * 100)}%`);
            }
          },
        });
        setTesseractWorker(worker);
      } catch (error) {
        console.error("Failed to initialize Tesseract:", error);
      }
    };

    initTesseract();

    return () => {
      if (tesseractWorker) {
        tesseractWorker.terminate();
      }
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const initQRScanner = () => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      qrRegionId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        setScanResult(decodedText);
        await handleIDVerification(decodedText, "qr");
        scanner.clear().catch(console.error);
        scannerRef.current = null;
      },
      (errorMessage) => {
        console.log("QR scan error:", errorMessage);
      }
    );

    scannerRef.current = scanner;
  };

  const handlePhotoScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tesseractWorker) {
      toast({
        title: "Error",
        description: "Please select an image and wait for OCR to initialize",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress("Initializing...");

    try {
      const {
        data: { text },
      } = await tesseractWorker.recognize(file);

      setScanResult(text);
      await handleIDVerification(text, "photo");
    } catch (error) {
      console.error("OCR Error:", error);
      toast({
        title: "Scan Failed",
        description: "Could not read text from image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress("");
    }
  };

  const handleIDVerification = async (data: string, method: "qr" | "photo") => {
    setIsProcessing(true);

    try {
      const response = await fetch(getApiUrl("/api/id-scan"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          scanData: data,
          scanMethod: method,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const result = await response.json();

      toast({
        title: "ID Verified Successfully",
        description: "Your identification has been validated.",
      });

      if (onVerified) {
        onVerified(result);
      }
    } catch (error: any) {
      console.error("ID verification error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Could not verify ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto" data-testid="card-id-scanner">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Scan Your Ethiopian ID
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use QR code scanning or photo upload to verify your identity
          </p>
        </div>

        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr" data-testid="tab-qr-scan">
              <Camera className="w-4 h-4 mr-2" />
              QR Code Scan
            </TabsTrigger>
            <TabsTrigger value="photo" data-testid="tab-photo-scan">
              <Upload className="w-4 h-4 mr-2" />
              Photo Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Position your Ethiopian ID's QR code in front of the camera
              </p>
              <div id={qrRegionId} className="w-full" />
              {!scannerRef.current && (
                <Button
                  onClick={initQRScanner}
                  className="w-full"
                  data-testid="button-start-qr-scan"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start QR Scanner
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="photo" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload a clear photo of your Ethiopian ID card
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoScan}
                disabled={isProcessing || !tesseractWorker}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                data-testid="input-photo-upload"
              />
              {!tesseractWorker && (
                <p className="text-xs text-yellow-600 mt-2">
                  Initializing OCR engine...
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {isProcessing && (
          <div className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm text-blue-600 dark:text-blue-400" data-testid="text-processing">
              {progress || "Processing ID..."}
            </span>
          </div>
        )}

        {scanResult && !isProcessing && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700 dark:text-green-400">
                Scan Successful
              </span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border border-green-200 dark:border-green-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Scanned Data:
              </p>
              <pre className="text-xs text-gray-900 dark:text-white whitespace-pre-wrap break-words" data-testid="text-scan-result">
                {scanResult.substring(0, 500)}
                {scanResult.length > 500 && "..."}
              </pre>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>✓ Supports Ethiopian Digital ID QR codes</p>
          <p>✓ OCR for physical ID cards (Amharic + English)</p>
          <p>✓ Secure verification process</p>
        </div>
      </div>
    </Card>
  );
}
