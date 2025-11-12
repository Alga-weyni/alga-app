import { useState, useEffect } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  FileText, 
  CheckCircle2, 
  Download, 
  Wifi, 
  WifiOff,
  Database,
  Lock,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// INSA Compliance Data - Stored for offline access
const insaComplianceData = {
  overview: {
    status: "75% Complete",
    securityScore: "98/100",
    lastUpdate: "November 12, 2025",
    tin: "0101809194",
    company: "Alga One Member PLC"
  },
  
  completed: [
    {
      title: "Electronic Signature System",
      status: "100% COMPLETE",
      category: "INSPECTION READY",
      details: [
        "ElectronicSignatureConsent component with exact legal text",
        "consent_logs table with SHA-256 signature hashing",
        "AES-256 encrypted IP addresses & device info",
        "Admin Signature Dashboard (/admin/signatures)",
        "Automated daily integrity checks (2:00 AM EAT)",
        "Three-tier backup system (Neon + Google Cloud Storage)",
        "5-year data retention policy",
        "Multi-format export (CSV, PDF with INSA watermark, JSON)"
      ]
    },
    {
      title: "Security Hardening",
      status: "100% ACTIVE",
      category: "PRODUCTION LIVE",
      details: [
        "HTTP Parameter Pollution protection",
        "NoSQL injection sanitization",
        "XSS detection and blocking",
        "SQL injection pattern detection",
        "Security headers enforced",
        "Rate limiting (100 req/15min)",
        "CSRF protection",
        "Audit logging active"
      ]
    },
    {
      title: "Documentation",
      status: "EXTENSIVE",
      category: "COMPLETE",
      details: [
        "INSA Security Compliance (26 pages)",
        "Electronic Signature Compliance (363 lines)",
        "INSA Submission Package with templates",
        "Admin Signature Dashboard Guide (48 pages)",
        "Weekly security audit scripts",
        "Intrusion detection monitoring",
        "6-month verification schedule"
      ]
    },
    {
      title: "Implementation Features",
      status: "COMPLETE",
      category: "VERIFIED",
      details: [
        "20+ database tables with proper relationships",
        "40+ API endpoints documented",
        "5 user roles (Guest, Host, Dellala, Operator, Admin)",
        "11 functional modules",
        "Third-party integrations documented",
        "Test accounts created and verified"
      ]
    }
  ],
  
  missing: [
    {
      title: "Visual Diagrams",
      priority: "P0 - CRITICAL",
      estimatedTime: "8-12 hours",
      items: [
        "Data Flow Diagram (DFD) - Level 0 & Level 1",
        "System Architecture - Professional visual diagram",
        "ERD (Database) - Visual relationship diagram"
      ],
      tools: "draw.io (free), dbdiagram.io, Lucidchart"
    },
    {
      title: "Legal Documents",
      priority: "P1 - HIGH",
      estimatedTime: "1-2 days",
      items: [
        "Trade License (need from Alga One Member PLC)",
        "Patent Certificate (optional, determine if applicable)"
      ],
      tools: "Organization administrative team"
    },
    {
      title: "Testing Materials",
      priority: "P2 - MEDIUM",
      estimatedTime: "2-3 hours",
      items: [
        "Document all test accounts formally",
        "Capture live API sample responses for INSA",
        "Complete testing scope documentation"
      ],
      tools: "Postman, curl, documentation tools"
    }
  ],
  
  proclamations: [
    {
      number: "1072/2018",
      title: "Electronic Signature Proclamation",
      status: "Fully Compliant",
      implementation: "ElectronicSignatureConsent component, SHA-256 hashing, AES-256 encryption"
    },
    {
      number: "1205/2020",
      title: "Electronic Transactions Proclamation",
      status: "Fully Compliant",
      implementation: "Audit trail logging, IP tracking, session verification"
    }
  ],
  
  testCredentials: {
    admin: "test-admin@alga.et / Test@1234 / OTP: 1234",
    note: "Full test account suite available in docs/insa/INSA_TEST_CREDENTIALS.md"
  }
};

export default function INSACompliancePage() {
  const { user } = useAuth();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dataCached, setDataCached] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache data to IndexedDB for offline access
  useEffect(() => {
    const cacheData = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction('insa-compliance', 'readwrite');
        const store = tx.objectStore('insa-compliance');
        await store.put({ id: 'compliance-data', data: insaComplianceData, timestamp: Date.now() });
        setDataCached(true);
        console.log('[INSA] Compliance data cached for offline access');
      } catch (error) {
        console.error('[INSA] Failed to cache data:', error);
      }
    };

    cacheData();
  }, []);

  // Helper to open IndexedDB
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('alga-offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('insa-compliance')) {
          db.createObjectStore('insa-compliance', { keyPath: 'id' });
        }
      };
    });
  };

  const downloadDocumentation = () => {
    const content = JSON.stringify(insaComplianceData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insa-compliance-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restrict access to operators and admins only
  if (user && !['operator', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-cream dark:bg-gray-950">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-900 dark:text-amber-100">
              This page is restricted to Operators and Administrators only.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-950">
      <Header />
      
      <div className="container max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-dark-brown dark:text-cream flex items-center gap-2">
              <Shield className="h-8 w-8 text-medium-brown" />
              INSA Compliance
            </h1>
            
            {/* Offline Indicator */}
            <div className="flex items-center gap-2">
              {isOffline ? (
                <Badge variant="outline" className="bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline Mode
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 border-green-500 text-green-700 dark:bg-green-950 dark:text-green-300">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              )}
              
              {dataCached && (
                <Badge variant="outline" className="bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Database className="h-3 w-3 mr-1" />
                  Cached
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-muted-foreground">
            Ethiopian Information Network Security Agency (INSA) compliance status and inspection readiness.
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medium-brown">{insaComplianceData.overview.status}</div>
              <p className="text-xs text-muted-foreground mt-1">Updated {insaComplianceData.overview.lastUpdate}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{insaComplianceData.overview.securityScore}</div>
              <p className="text-xs text-muted-foreground mt-1">INSA Grade Security</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold">{insaComplianceData.overview.company}</div>
              <p className="text-xs text-muted-foreground mt-1">TIN: {insaComplianceData.overview.tin}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="completed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 gap-2">
            <TabsTrigger value="completed" className="text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="missing" className="text-xs sm:text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              Missing
            </TabsTrigger>
            <TabsTrigger value="legal" className="text-xs sm:text-sm">
              <FileText className="h-4 w-4 mr-1" />
              Legal
            </TabsTrigger>
            <TabsTrigger value="test" className="text-xs sm:text-sm">
              <Lock className="h-4 w-4 mr-1" />
              Test
            </TabsTrigger>
          </TabsList>

          {/* Completed Items */}
          <TabsContent value="completed" className="space-y-4">
            {insaComplianceData.completed.map((item, index) => (
              <Card key={index} className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        {item.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {item.status}
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          {item.category}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Missing Items */}
          <TabsContent value="missing" className="space-y-4">
            {insaComplianceData.missing.map((item, index) => (
              <Card key={index} className="border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        {item.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          {item.priority}
                        </Badge>
                        <span className="text-xs ml-2">Est. {item.estimatedTime}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {item.items.map((taskItem, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{taskItem}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      <strong>Recommended Tools:</strong> {item.tools}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Legal Compliance */}
          <TabsContent value="legal" className="space-y-4">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                Alga complies with Ethiopian Electronic Signature and Electronic Transactions Proclamations.
              </AlertDescription>
            </Alert>

            {insaComplianceData.proclamations.map((proc, index) => (
              <Card key={index} className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Proclamation No. {proc.number}
                  </CardTitle>
                  <CardDescription>{proc.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {proc.status}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    <strong>Implementation:</strong> {proc.implementation}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Test Credentials */}
          <TabsContent value="test" className="space-y-4">
            <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
              <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <AlertDescription className="text-purple-900 dark:text-purple-100">
                Test credentials for INSA inspection and auditing purposes.
              </AlertDescription>
            </Alert>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle>Test Admin Account</CardTitle>
                <CardDescription>For INSA security testing and inspection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="font-mono text-sm bg-gray-100 dark:bg-gray-900 p-3 rounded">
                  {insaComplianceData.testCredentials.admin}
                </div>
                <p className="text-xs text-muted-foreground">
                  {insaComplianceData.testCredentials.note}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Download Action */}
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={downloadDocumentation}
            variant="outline"
            className="gap-2"
            data-testid="button-download-docs"
          >
            <Download className="h-4 w-4" />
            Download Full Documentation (JSON)
          </Button>
        </div>
      </div>
    </div>
  );
}
