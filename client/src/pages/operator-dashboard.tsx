import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { BackButton } from "@/components/back-button";
import { CheckCircle, XCircle, FileText, Home, User, Clock, MapPin, Bed, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface VerificationDocument {
  id: number;
  userId: string;
  documentType: string;
  documentUrl: string;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

interface Property {
  id: number;
  hostId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  location: string;
  city: string;
  region: string;
  pricePerNight: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  createdAt: string;
  host?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

export default function OperatorDashboard() {
  const { toast } = useToast();
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({});

  // Fetch pending verification documents
  const { data: pendingDocs, isLoading: docsLoading } = useQuery<VerificationDocument[]>({
    queryKey: ['/api/operator/pending-documents'],
  });

  // Fetch pending properties
  const { data: pendingProperties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['/api/operator/pending-properties'],
  });

  // Approve document mutation
  const approveDocMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return await apiRequest("POST", `/api/operator/documents/${documentId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Document Approved",
        description: "Host verification document has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/operator/pending-documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Unable to approve document",
        variant: "destructive",
      });
    },
  });

  // Reject document mutation
  const rejectDocMutation = useMutation({
    mutationFn: async ({ documentId, reason }: { documentId: number; reason: string }) => {
      return await apiRequest("POST", `/api/operator/documents/${documentId}/reject`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Document Rejected",
        description: "Host verification document has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/operator/pending-documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Unable to reject document",
        variant: "destructive",
      });
    },
  });

  // Approve property mutation
  const approvePropertyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      return await apiRequest("POST", `/api/operator/properties/${propertyId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Property Approved",
        description: "Property has been approved and is now live on the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/operator/pending-properties'] });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Unable to approve property",
        variant: "destructive",
      });
    },
  });

  // Reject property mutation
  const rejectPropertyMutation = useMutation({
    mutationFn: async ({ propertyId, reason }: { propertyId: number; reason: string }) => {
      return await apiRequest("POST", `/api/operator/properties/${propertyId}/reject`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Property Rejected",
        description: "Property has been rejected with feedback to the host.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/operator/pending-properties'] });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Unable to reject property",
        variant: "destructive",
      });
    },
  });

  const handleRejectDoc = (documentId: number) => {
    const reason = rejectionReasons[`doc-${documentId}`];
    if (!reason || reason.trim() === "") {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this document.",
        variant: "destructive",
      });
      return;
    }
    rejectDocMutation.mutate({ documentId, reason });
  };

  const handleRejectProperty = (propertyId: number) => {
    const reason = rejectionReasons[`prop-${propertyId}`];
    if (!reason || reason.trim() === "") {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this property.",
        variant: "destructive",
      });
      return;
    }
    rejectPropertyMutation.mutate({ propertyId, reason });
  };

  return (
    <div className="min-h-screen bg-eth-warm-tan flex flex-col">
      <Header hideNavigation={true} />
      
      <main className="flex-1 container mx-auto px-4 py-12 mb-16">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-eth-brown mb-2" data-testid="text-operator-title">
            Operator Dashboard
          </h1>
          <p className="text-gray-600">
            Review and verify guesthouse owner details and property listings
          </p>
        </div>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="documents" data-testid="tab-documents">
              <FileText className="h-4 w-4 mr-2" />
              Host Verification ({pendingDocs?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="properties" data-testid="tab-properties">
              <Home className="h-4 w-4 mr-2" />
              Property Verification ({pendingProperties?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Host Document Verification Tab */}
          <TabsContent value="documents" className="space-y-4">
            {docsLoading ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">Loading pending documents...</p>
                </CardContent>
              </Card>
            ) : !pendingDocs || pendingDocs.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-500" data-testid="text-no-pending-docs">
                    No pending host verification documents
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingDocs.map((doc) => (
                <Card key={doc.id} className="bg-white" data-testid={`card-document-${doc.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-eth-brown">
                          <User className="inline h-5 w-5 mr-2" />
                          {doc.user?.firstName} {doc.user?.lastName}
                        </CardTitle>
                        <CardDescription>
                          {doc.user?.email} • {doc.user?.phoneNumber}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Document Type</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {doc.documentType.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Submitted</p>
                        <p className="text-sm text-gray-600">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Document Preview</p>
                      <a
                        href={doc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-eth-green hover:underline text-sm"
                        data-testid={`link-view-document-${doc.id}`}
                      >
                        View Document →
                      </a>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Rejection Reason (if rejecting)</p>
                      <Textarea
                        placeholder="Enter reason for rejection..."
                        value={rejectionReasons[`doc-${doc.id}`] || ""}
                        onChange={(e) =>
                          setRejectionReasons({ ...rejectionReasons, [`doc-${doc.id}`]: e.target.value })
                        }
                        data-testid={`textarea-rejection-doc-${doc.id}`}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => approveDocMutation.mutate(doc.id)}
                        disabled={approveDocMutation.isPending}
                        className="bg-eth-green hover:bg-eth-green/90"
                        data-testid={`button-approve-doc-${doc.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Document
                      </Button>
                      <Button
                        onClick={() => handleRejectDoc(doc.id)}
                        disabled={rejectDocMutation.isPending}
                        variant="destructive"
                        data-testid={`button-reject-doc-${doc.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Property Verification Tab */}
          <TabsContent value="properties" className="space-y-4">
            {propertiesLoading ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">Loading pending properties...</p>
                </CardContent>
              </Card>
            ) : !pendingProperties || pendingProperties.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-500" data-testid="text-no-pending-properties">
                    No pending property verifications
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingProperties.map((property) => (
                <Card key={property.id} className="bg-white" data-testid={`card-property-${property.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-eth-brown">{property.title}</CardTitle>
                        <CardDescription>
                          <User className="inline h-3 w-3 mr-1" />
                          {property.host?.firstName} {property.host?.lastName} • {property.host?.email}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Property Type</p>
                        <p className="text-sm text-gray-600 capitalize">{property.type.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Location</p>
                        <p className="text-sm text-gray-600">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {property.city}, {property.region}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Price</p>
                        <p className="text-sm text-gray-600">{property.pricePerNight} ETB/night</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Max Guests</p>
                        <p className="text-sm text-gray-600">
                          <Users className="inline h-3 w-3 mr-1" />
                          {property.maxGuests} guests
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Bedrooms</p>
                        <p className="text-sm text-gray-600">
                          <Bed className="inline h-3 w-3 mr-1" />
                          {property.bedrooms} bedrooms
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Bathrooms</p>
                        <p className="text-sm text-gray-600">{property.bathrooms} bathrooms</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                      <p className="text-sm text-gray-600">{property.description}</p>
                    </div>

                    {property.images && property.images.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Property Images</p>
                        <div className="grid grid-cols-3 gap-2">
                          {property.images.slice(0, 3).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Property ${idx + 1}`}
                              className="w-full h-24 object-cover rounded"
                              data-testid={`img-property-${property.id}-${idx}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Rejection Reason (if rejecting)</p>
                      <Textarea
                        placeholder="Enter reason for rejection (e.g., missing documents, unclear photos, incorrect information)..."
                        value={rejectionReasons[`prop-${property.id}`] || ""}
                        onChange={(e) =>
                          setRejectionReasons({ ...rejectionReasons, [`prop-${property.id}`]: e.target.value })
                        }
                        data-testid={`textarea-rejection-prop-${property.id}`}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => approvePropertyMutation.mutate(property.id)}
                        disabled={approvePropertyMutation.isPending}
                        className="bg-eth-green hover:bg-eth-green/90"
                        data-testid={`button-approve-prop-${property.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & List Property
                      </Button>
                      <Button
                        onClick={() => handleRejectProperty(property.id)}
                        disabled={rejectPropertyMutation.isPending}
                        variant="destructive"
                        data-testid={`button-reject-prop-${property.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Property
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
