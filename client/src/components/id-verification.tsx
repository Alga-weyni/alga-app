import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { getApiUrl } from "@/lib/api-config";
import { 
  Upload, 
  FileCheck, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  FileText,
  CreditCard,
  Home as HomeIcon
} from "lucide-react";

interface IDVerificationProps {
  userId: string;
  userRole: string;
  onVerificationComplete?: () => void;
}

interface VerificationDocument {
  id: number;
  userId: string;
  documentType: string;
  documentUrl: string;
  status: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function IDVerification({ userId, userRole, onVerificationComplete }: IDVerificationProps) {
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { toast } = useToast();

  // Fetch user's verification documents
  const { data: documents = [], isLoading } = useQuery<VerificationDocument[]>({
    queryKey: ['/api/verification-documents', userId],
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(getApiUrl('/api/verification-documents/upload'), {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/verification-documents', userId] });
      setUploadedFile(null);
      setPreviewUrl('');
      setSelectedDocumentType('');
      toast({
        title: "Document Uploaded Successfully",
        description: "Your document has been submitted for verification",
      });
      onVerificationComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = () => {
    if (!uploadedFile || !selectedDocumentType) {
      toast({
        title: "Missing Information",
        description: "Please select document type and file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('document', uploadedFile);
    formData.append('documentType', selectedDocumentType);
    formData.append('userId', userId);

    uploadDocumentMutation.mutate(formData);
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'national_id': return <CreditCard className="h-4 w-4" />;
      case 'passport': return <FileText className="h-4 w-4" />;
      case 'property_deed': return <HomeIcon className="h-4 w-4" />;
      case 'business_license': return <Shield className="h-4 w-4" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  const getRequiredDocuments = () => {
    const base = ['national_id', 'passport'];
    if (userRole === 'guesthouse_owner') {
      return [...base, 'property_deed', 'business_license'];
    }
    return base;
  };

  const requiredDocuments = getRequiredDocuments();
  const completedDocuments = documents.filter((doc: any) => doc.status === 'approved');
  const verificationProgress = (completedDocuments.length / requiredDocuments.length) * 100;

  return (
    <div className="space-y-6">
      {/* Verification Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>ID Verification Status</span>
          </CardTitle>
          <CardDescription>
            Complete your identity verification to access all platform features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verification Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedDocuments.length} of {requiredDocuments.length} documents verified
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${verificationProgress}%` }}
              />
            </div>
            {verificationProgress === 100 && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Verification Complete</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Upload clear photos of your identification documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national_id">National ID Card</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  {userRole === 'guesthouse_owner' && (
                    <>
                      <SelectItem value="property_deed">Property Deed</SelectItem>
                      <SelectItem value="business_license">Business License</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="document-file">Document File</Label>
              <Input
                id="document-file"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Accepted formats: JPG, PNG, PDF (max 5MB)
              </p>
            </div>

            {previewUrl && (
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="max-w-full max-h-64 object-contain rounded"
                />
              </div>
            )}

            <Button 
              onClick={handleUpload}
              disabled={!uploadedFile || !selectedDocumentType || uploadDocumentMutation.isPending}
              className="w-full"
            >
              {uploadDocumentMutation.isPending ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>
            Track the status of your submitted documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <FileCheck className="h-8 w-8 mx-auto mb-2" />
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getDocumentTypeIcon(doc.documentType)}
                    <div>
                      <div className="font-medium">
                        {doc.documentType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                      {doc.rejectionReason && (
                        <div className="text-sm text-red-600 mt-1">
                          Reason: {doc.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(doc.status)}
                    <Badge variant={getStatusBadgeColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Required Documents Info */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            {userRole === 'guesthouse_owner' 
              ? "As a guesthouse owner, you need to provide additional documentation"
              : "Basic identification documents required for all users"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">National ID Card</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                Clear photo of your Ethiopian national ID card
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Passport (Alternative)</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                Valid passport as alternative to national ID
              </p>
            </div>

            {userRole === 'guesthouse_owner' && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <HomeIcon className="h-4 w-4" />
                    <span className="font-medium">Property Deed</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Proof of property ownership or lease agreement
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Business License</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Valid business registration and license
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}