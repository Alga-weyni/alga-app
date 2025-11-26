import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Camera, Loader2, AlertCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api-config";

interface SimpleIDScannerProps {
  onVerified?: (data: any) => void;
}

export default function SimpleIDScanner({ onVerified }: SimpleIDScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState("Tap to scan your Ethiopian ID");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, []);

  const startScan = async () => {
    try {
      setStatus("scanning");
      setMessage("Starting camera...");
      setResult(null);

      if (!videoRef.current) return;

      // Try to get back camera on mobile
      const devices = await navigator.mediaDevices.enumerateDevices();
      const backCamera = devices.find(
        (d) => d.kind === "videoinput" && d.label.toLowerCase().includes("back")
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: backCamera?.deviceId || undefined,
          facingMode: backCamera ? undefined : { ideal: "environment" }
        },
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setMessage("Hold your ID steady in the frame");

      // Create and start scanner
      const scanner = new QrScanner(
        videoRef.current,
        async (qrResult) => {
          setStatus("verifying");
          setMessage("Verifying your ID...");

          try {
            // Call verification API
            const response = await fetch(getApiUrl("/api/id-scan"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                scanData: qrResult.data,
                scanMethod: "qr",
                timestamp: new Date().toISOString(),
              }),
            });

            const data = await response.json();

            if (data.success) {
              setStatus("success");
              setMessage("✅ ID verified successfully!");
              setResult(data);
              
              // Call callback if provided
              if (onVerified) {
                onVerified(data);
              }

              // Stop scanning
              scanner.stop();
              stream.getTracks().forEach((t) => t.stop());
            } else {
              setStatus("error");
              setMessage(`❌ ${data.message || "Verification failed"}`);
              setResult(data);
              
              // Auto retry after 3 seconds
              setTimeout(() => {
                setStatus("scanning");
                setMessage("Hold your ID steady in the frame");
              }, 3000);
            }
          } catch (err) {
            console.error("Verification error:", err);
            setStatus("error");
            setMessage("❌ Network error. Please try again.");
            
            // Auto retry after 3 seconds
            setTimeout(() => {
              setStatus("scanning");
              setMessage("Hold your ID steady in the frame");
            }, 3000);
          }
        },
        { 
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scanner.start();
      scannerRef.current = scanner;

    } catch (err) {
      console.error("Camera error:", err);
      setStatus("error");
      setMessage("❌ Camera access denied or unavailable");
    }
  };

  const reset = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setStatus("idle");
    setMessage("Tap to scan your Ethiopian ID");
    setResult(null);
  };

  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      {/* Video Feed */}
      <div className="relative bg-gray-900 aspect-video">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Camera className="w-16 h-16 text-white/50" />
          </div>
        )}
      </div>

      {/* Status and Controls */}
      <div className="p-6 space-y-4">
        {/* Status Message */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {status === "scanning" && <Loader2 className="w-5 h-5 animate-spin text-eth-orange" />}
            {status === "verifying" && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
            {status === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
            {status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>

        {/* Result Display */}
        {status === "success" && result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">ID Number</p>
                <p className="font-mono font-semibold">{result.idNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-semibold">{result.fullName || "N/A"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {status === "idle" && (
          <Button 
            onClick={startScan}
            className="w-full bg-eth-orange hover:bg-eth-orange/90"
            size="lg"
            data-testid="button-start-scan"
          >
            <Camera className="w-5 h-5 mr-2" />
            Scan Ethiopian ID
          </Button>
        )}

        {(status === "success" || status === "error") && (
          <Button 
            onClick={reset}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="button-scan-again"
          >
            Scan Another ID
          </Button>
        )}

        {/* Help Text */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Ethiopian Digital ID QR codes only • Secure verification
        </p>
      </div>
    </Card>
  );
}
