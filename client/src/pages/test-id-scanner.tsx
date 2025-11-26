import { useState } from "react";
import ScanID from "@/components/scan-id";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { getApiUrl } from "@/lib/api-config";

export default function TestIDScannerPage() {
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const { toast } = useToast();

  const testCases = {
    validQR: {
      name: "Valid QR Code (Abebe Belete)",
      data: "eyJpZE51bWJlciI6IjEyMzQ1Njc4OTAxMiIsImZ1bGxOYW1lIjoiQWJlYmUgQmVsZXRlIn0=",
      description: "Base64-encoded JSON with 12-digit ID",
    },
    validQR2: {
      name: "Valid QR Code (Yohannes Abebe)",
      data: "eyJpZE51bWJlciI6Ijk4NzY1NDMyMTA5OCIsImZ1bGxOYW1lIjoi4Yuo4YiQ4YqV4YizIOGKoOGJoOGJoOGKqyJ9",
      description: "Ethiopian name in Amharic",
    },
    validOCR: {
      name: "Valid OCR Text",
      data: `Ethiopian National ID
Name: ዮሐንስ አበበ
ID Number: 987654321098
Date of Birth: 01/01/1990
Issue Date: 15/06/2020`,
      description: "Simulated OCR text from ID card photo",
    },
    validOCREnglish: {
      name: "Valid OCR (English)",
      data: `FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
Name: ABEBE BELETE KEBEDE
ID: 123456789012
Sex: M
Birth: 15/03/1985`,
      description: "English text extraction",
    },
    invalidShort: {
      name: "Invalid - Too Short",
      data: "12345",
      description: "ID number with less than 12 digits (should fail)",
    },
    invalidFormat: {
      name: "Invalid - Wrong Format",
      data: "ABC123XYZ456",
      description: "Non-numeric ID (should fail)",
    },
  };

  const handleTestData = async (testData: string) => {
    try {
      const response = await fetch(getApiUrl("/api/id-scan"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          scanData: testData,
          scanMethod: "qr",
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      setVerificationResult(result);

      if (result.success) {
        toast({
          title: "✅ Verification Successful",
          description: `ID: ${result.idNumber}, Name: ${result.fullName || 'N/A'}`,
        });
      } else {
        toast({
          title: "❌ Verification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Network error",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Test data copied to clipboard",
    });
  };

  const decodeBase64 = (data: string) => {
    try {
      return JSON.parse(atob(data));
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#f6f2ec" }}>
      <Header />
      <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            🧪 Ethiopian ID Scanner - Test Lab
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the ID verification system with sample data or scan real Ethiopian IDs
          </p>
        </div>

        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live">Live Scanner</TabsTrigger>
            <TabsTrigger value="test">Test Data</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Live ID Scanner</h2>
              <ScanID
                onVerified={(data) => {
                  setVerificationResult(data);
                  toast({
                    title: "ID Verified!",
                    description: `Successfully verified ID: ${data.idNumber || 'N/A'}`,
                  });
                }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Test Cases</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Click any button to test the validation logic instantly
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(testCases).map(([key, test]) => (
                  <Card
                    key={key}
                    className={`p-4 border-2 ${
                      key.includes("invalid")
                        ? "border-red-200 dark:border-red-800"
                        : "border-green-200 dark:border-green-800"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm">{test.name}</h3>
                        {key.includes("invalid") ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {test.description}
                      </p>
                      
                      {key.includes("QR") && (
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
                          <strong>Decoded:</strong>
                          <pre className="mt-1 overflow-auto">
                            {JSON.stringify(decodeBase64(test.data), null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleTestData(test.data)}
                          className="flex-1"
                          variant={key.includes("invalid") ? "destructive" : "default"}
                          size="sm"
                        >
                          Test This
                        </Button>
                        <Button
                          onClick={() => copyToClipboard(test.data)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {verificationResult && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {verificationResult.success ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Verification Result - Success
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  Verification Result - Failed
                </>
              )}
            </h2>
            
            <div
              className={`p-4 rounded-lg ${
                verificationResult.success
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              }`}
            >
              <pre className="text-sm overflow-auto">
                {JSON.stringify(verificationResult, null, 2)}
              </pre>
            </div>

            {verificationResult.success && (
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ID Number
                    </p>
                    <p className="text-lg font-mono font-semibold">
                      {verificationResult.idNumber}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Full Name
                    </p>
                    <p className="text-lg font-semibold">
                      {verificationResult.fullName || "Not extracted"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Expiry Date
                    </p>
                    <p className="text-lg font-semibold">
                      {verificationResult.expiryDate || "Not detected"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Location
                    </p>
                    <p className="text-lg font-semibold">
                      {verificationResult.location || "Not detected"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            📖 How It Works
          </h3>
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li>✓ <strong>QR Codes:</strong> Decodes base64 JSON from Ethiopian digital IDs</li>
            <li>✓ <strong>OCR Text:</strong> Extracts 12-digit ID numbers from photos</li>
            <li>✓ <strong>Validation:</strong> Requires exactly 12 numeric digits</li>
            <li>✓ <strong>Name Extraction:</strong> Supports both English and Amharic (ስም:)</li>
            <li>✓ <strong>Security:</strong> All scans are logged and require authentication</li>
          </ul>
        </Card>
      </div>
    </div>
    
    <Footer />
    </div>
  );
}
