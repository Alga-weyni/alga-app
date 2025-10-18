import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Camera, Loader2, AlertCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UniversalIDScannerProps {
  onVerified?: (data: any) => void;
  userType?: "ethiopian" | "foreigner" | "auto";
}

export default function UniversalIDScanner({ onVerified, userType = "auto" }: UniversalIDScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [tesseractWorker, setTesseractWorker] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState("Choose verification method");
  const [result, setResult] = useState<any>(null);
  const [scanMethod, setScanMethod] = useState<"qr" | "photo">("qr");
  const [progress, setProgress] = useState("");
  const { toast } = useToast();

  // Initialize Tesseract for OCR
  useEffect(() => {
    const initTesseract = async () => {
      try {
        const worker = await createWorker("eng", 1, {
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
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, []);

  const startQRScan = async () => {
    try {
      setStatus("scanning");
      setMessage("Starting camera...");
      setResult(null);
      setScanMethod("qr");

      if (!videoRef.current) {
        throw new Error("Video element not ready");
      }

      // Simplified camera access - request with timeout
      const streamPromise = navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });

      // 10 second timeout for camera access
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Camera timeout")), 10000)
      );

      const stream = await Promise.race([streamPromise, timeoutPromise]) as MediaStream;

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setMessage("Hold your ID's QR code in the frame");

      const scanner = new QrScanner(
        videoRef.current,
        async (qrResult) => {
          await verifyDocument(qrResult.data, "qr");
          scanner.stop();
          stream.getTracks().forEach((t) => t.stop());
        },
        { 
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scanner.start();
      scannerRef.current = scanner;

    } catch (err: any) {
      console.error("Camera error:", err);
      setStatus("error");
      const errorMsg = err.message === "Camera timeout" 
        ? "❌ Camera took too long to start. Please refresh and try again."
        : err.name === "NotAllowedError"
        ? "❌ Camera access denied. Please allow camera permissions."
        : err.name === "NotFoundError"
        ? "❌ No camera found on this device."
        : "❌ Camera unavailable. Please try photo upload instead.";
      setMessage(errorMsg);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tesseractWorker) {
      toast({
        title: "Error",
        description: "Please select an image and wait for OCR to initialize",
        variant: "destructive",
      });
      return;
    }

    setStatus("verifying");
    setMessage("Reading document...");
    setScanMethod("photo");
    setProgress("Initializing...");

    try {
      const {
        data: { text },
      } = await tesseractWorker.recognize(file);

      await verifyDocument(text, "photo");
    } catch (error) {
      console.error("OCR Error:", error);
      setStatus("error");
      setMessage("❌ Could not read document. Please try again.");
    } finally {
      setProgress("");
    }
  };

  const verifyDocument = async (data: string, method: "qr" | "photo") => {
    setStatus("verifying");
    setMessage("Verifying document...");

    try {
      const response = await fetch("/api/id-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanData: data,
          scanMethod: method,
          timestamp: new Date().toISOString(),
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        setStatus("success");
        setMessage("✅ Document verified successfully!");
        setResult(responseData);
        
        toast({
          title: "Verified!",
          description: `Document verified: ${responseData.idNumber}`,
        });

        if (onVerified) {
          onVerified(responseData);
        }
      } else {
        setStatus("error");
        setMessage(`❌ ${responseData.message || "Verification failed"}`);
        setResult(responseData);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setStatus("error");
      setMessage("❌ Network error. Please try again.");
    }
  };

  const reset = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setStatus("idle");
    setMessage("Choose verification method");
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      {/* Document Type Info */}
      <div className="bg-gradient-to-r from-eth-orange/10 to-eth-brown/10 dark:from-eth-orange/20 dark:to-eth-brown/20 p-4 border-b">
        <h3 className="font-semibold text-eth-brown dark:text-white mb-2">
          📋 Required Documents
        </h3>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">🇪🇹 Ethiopians & Diaspora:</p>
            <p className="text-gray-600 dark:text-gray-400">Ethiopian Digital ID / Yellow Card (QR code)</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">🌍 Foreign Visitors:</p>
            <p className="text-gray-600 dark:text-gray-400">Passport, Driver's License, or National ID</p>
          </div>
        </div>
      </div>

      {/* Verification Method Tabs */}
      {status === "idle" && (
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="qr">
              <Camera className="w-4 h-4 mr-2" />
              QR Scan (Yellow Card Holders)
            </TabsTrigger>
            <TabsTrigger value="photo">
              <Upload className="w-4 h-4 mr-2" />
              Photo Upload (Foreign Visitors)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="p-6">
            <div className="text-center space-y-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  For Ethiopian citizens & diaspora with Yellow Card (Digital ID)
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Note: Even if you hold an international passport, use this option if you have an Ethiopian ID
                </p>
              </div>
              <Button 
                onClick={startQRScan}
                className="w-full bg-eth-orange hover:bg-eth-orange/90"
                size="lg"
                data-testid="button-scan-qr"
              >
                <Camera className="w-5 h-5 mr-2" />
                Scan Ethiopian ID QR Code
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="photo" className="p-6">
            <div className="text-center space-y-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Upload className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a clear photo of your passport, driver's license, or national ID
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                data-testid="input-photo-upload"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-eth-brown hover:bg-eth-brown/90"
                size="lg"
                variant="default"
                data-testid="button-upload-photo"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Document Photo
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Scanning/Verifying View */}
      {(status === "scanning" || status === "verifying") && (
        <div className="p-6">
          {scanMethod === "qr" && (
            <div className="relative bg-gray-900 aspect-video rounded-lg overflow-hidden mb-4">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            </div>
          )}
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-eth-orange" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>
            {progress && (
              <p className="text-xs text-gray-500">{progress}</p>
            )}
          </div>
        </div>
      )}

      {/* Success View */}
      {status === "success" && result && (
        <div className="p-6 space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                Document Verified!
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">ID Number</p>
                <p className="font-mono font-semibold text-gray-900 dark:text-white">
                  {result.idNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">First Name</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {result.firstName || result.fullName?.split(' ')[0] || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Middle Name <span className="text-gray-400">(optional)</span></p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {result.middleName || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Last Name</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {result.lastName || result.fullName?.split(' ').slice(1).join(' ') || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Date of Birth</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {result.dateOfBirth || result.dob || "N/A"}
                </p>
              </div>
              {result.expiryDate && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Expiry Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {result.expiryDate}
                  </p>
                </div>
              )}
              {result.nationality && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Nationality</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {result.nationality}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={reset}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="button-verify-another"
          >
            Verify Another Document
          </Button>
        </div>
      )}

      {/* Error View */}
      {status === "error" && (
        <div className="p-6 space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-900 dark:text-red-100 font-medium">{message}</p>
          </div>

          <Button 
            onClick={reset}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="button-try-again"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Help Text */}
      {status === "idle" && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-center text-blue-800 dark:text-blue-200">
            🔒 All document information is encrypted and securely stored
          </p>
        </div>
      )}
    </Card>
  );
}
