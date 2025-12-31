import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SimplePagination } from "@/components/SimplePagination";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BackButton } from "@/components/back-button";
import Header from "@/components/header";
import {
  Home,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MapPin,
  User,
  UserCheck,
  Building2,
  Filter,
} from "lucide-react";

interface PropertyHost {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface PropertyAgent {
  id: number;
  fullName: string;
  referralCode: string;
  phoneNumber: string;
}

interface AdminProperty {
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
  currency: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  host: PropertyHost | null;
  agent: PropertyAgent | null;
  referralCode: string | null;
}

interface PropertiesResponse {
  properties: AdminProperty[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminProperties() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState<AdminProperty | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const ITEMS_PER_PAGE = 10;

  if (user && user.role !== "admin" && user.role !== "operator") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf5f0]">
        <Card className="w-96 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">You don't have permission to access this page.</p>
            <Button onClick={() => navigate("/")} className="w-full" data-testid="button-go-home">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("limit", ITEMS_PER_PAGE.toString());
    
    if (activeTab !== "all") {
      params.append("type", activeTab);
    }
    if (statusFilter !== "all") {
      params.append("status", statusFilter);
    }
    if (searchQuery.trim()) {
      params.append("search", searchQuery.trim());
    }
    if (cityFilter !== "all") {
      params.append("city", cityFilter);
    }
    
    return params.toString();
  };

  const { data, isLoading, refetch } = useQuery<PropertiesResponse>({
    queryKey: ['/api/admin/properties', currentPage, activeTab, statusFilter, searchQuery, cityFilter],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const response = await fetch(`/api/admin/properties?${queryString}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    },
  });

  const { data: allPropertiesData } = useQuery<{ cities: string[] }>({
    queryKey: ['/api/admin/properties/cities'],
    queryFn: async () => {
      const response = await fetch('/api/admin/properties/cities', {
        credentials: 'include',
      });
      if (!response.ok) {
        return { cities: [] };
      }
      return response.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      return await apiRequest("PATCH", `/api/admin/properties/${propertyId}/verify`, {
        status: "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
      toast({
        title: "Property Approved",
        description: "The property has been approved and is now active.",
      });
      setDetailsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve property",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ propertyId, reason }: { propertyId: number; reason: string }) => {
      return await apiRequest("PATCH", `/api/admin/properties/${propertyId}/verify`, {
        status: "rejected",
        rejectionReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
      toast({
        title: "Property Rejected",
        description: "The property has been rejected.",
      });
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedProperty(null);
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject property",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (property: AdminProperty) => {
    approveMutation.mutate(property.id);
  };

  const handleReject = () => {
    if (!selectedProperty || !rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ propertyId: selectedProperty.id, reason: rejectionReason });
  };

  const openRejectDialog = (property: AdminProperty) => {
    setSelectedProperty(property);
    setRejectDialogOpen(true);
  };

  const openDetailsDialog = (property: AdminProperty) => {
    setSelectedProperty(property);
    setDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
      active: { label: "Approved", variant: "default", icon: CheckCircle },
      approved: { label: "Approved", variant: "default", icon: CheckCircle },
      pending: { label: "Pending", variant: "secondary", icon: Clock },
      rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
      suspended: { label: "Suspended", variant: "outline", icon: XCircle },
    };
    const statusConfig = config[status] || config.pending;
    const Icon = statusConfig.icon;
    return (
      <Badge variant={statusConfig.variant} className="gap-1" data-testid={`badge-status-${status}`}>
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCityFilterChange = (value: string) => {
    setCityFilter(value);
    setCurrentPage(1);
  };

  const properties = Array.isArray(data?.properties) ? data.properties : [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  const cities = Array.isArray(allPropertiesData?.cities) ? allPropertiesData.cities : [];

  const stats = {
    total: total,
    pending: (properties || []).filter(p => p.status === "pending").length,
    approved: (properties || []).filter(p => p.status === "active" || p.status === "approved").length,
    delala: (properties || []).filter(p => p.referralCode).length,
  };


  const renderPropertyRow = (property: AdminProperty) => (
    <TableRow key={property.id} data-testid={`row-property-${property.id}`}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          {property.images?.[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-12 h-12 rounded-lg object-cover"
              data-testid={`img-property-${property.id}`}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
              <Home className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-semibold text-[#2d1405]" data-testid={`text-title-${property.id}`}>
              {property.title}
            </p>
            <p className="text-sm text-gray-500">{property.type}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span data-testid={`text-location-${property.id}`}>{property.city}, {property.region}</span>
        </div>
      </TableCell>
      <TableCell data-testid={`text-price-${property.id}`}>
        {parseFloat(property.pricePerNight).toLocaleString()} {property.currency}
      </TableCell>
      <TableCell>{getStatusBadge(property.status)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span data-testid={`text-owner-${property.id}`}>
            {property.host ? `${property.host.firstName || ""} ${property.host.lastName || ""}`.trim() || property.host.email : "N/A"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {property.referralCode ? (
          <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-200" data-testid={`badge-referral-${property.id}`}>
            <UserCheck className="w-3 h-3" />
            {property.referralCode}
          </Badge>
        ) : (
          <span className="text-gray-400 text-sm" data-testid={`text-direct-${property.id}`}>Direct</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDetailsDialog(property)}
            data-testid={`button-view-${property.id}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {property.status === "pending" && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApprove(property)}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid={`button-approve-${property.id}`}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openRejectDialog(property)}
                data-testid={`button-reject-${property.id}`}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="min-h-screen bg-[#faf5f0]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2d1405]" data-testid="heading-page-title">
              Properties Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and verify property listings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="px-4 py-2 bg-white">
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#2d1405]" data-testid="stat-total">{stats.total}</p>
                  <p className="text-gray-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600" data-testid="stat-pending">{stats.pending}</p>
                  <p className="text-gray-500">Pending</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-white" data-testid="tabs-property-type">
            <TabsTrigger value="all" data-testid="tab-all">
              <Building2 className="w-4 h-4 mr-2" />
              All Properties
            </TabsTrigger>
            <TabsTrigger value="direct" data-testid="tab-direct">
              <Home className="w-4 h-4 mr-2" />
              Direct Properties
            </TabsTrigger>
            <TabsTrigger value="delala" data-testid="tab-delala">
              <UserCheck className="w-4 h-4 mr-2" />
              Delala Properties
            </TabsTrigger>
          </TabsList>

          <Card className="bg-white">
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <Button type="submit" variant="outline" data-testid="button-search">
                    Search
                  </Button>
                </form>

                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-36" data-testid="select-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" data-testid="option-status-all">All Status</SelectItem>
                      <SelectItem value="pending" data-testid="option-status-pending">Pending</SelectItem>
                      <SelectItem value="active" data-testid="option-status-approved">Approved</SelectItem>
                      <SelectItem value="rejected" data-testid="option-status-rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={cityFilter} onValueChange={handleCityFilterChange}>
                    <SelectTrigger className="w-40" data-testid="select-city-filter">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" data-testid="option-city-all">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city} data-testid={`option-city-${city}`}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="p-12 text-center">
                  <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500" data-testid="text-no-properties">No properties found</p>
                </div>
              ) : (
                <Table data-testid="table-properties">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price/Night</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Referral</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map(renderPropertyRow)}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

        </Tabs>

        {/* Pagination - Always visible */}
        <SimplePagination
          page={currentPage}
          limit={ITEMS_PER_PAGE}
          total={data?.total || 0}
          onPageChange={setCurrentPage}
        />
        
        <div className="text-sm text-gray-500 text-center mt-2">
          Showing {properties.length} of {total} properties
        </div>

        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-property-details">
            <DialogHeader>
              <DialogTitle>Property Details</DialogTitle>
              <DialogDescription>
                View complete property information
              </DialogDescription>
            </DialogHeader>
            {selectedProperty && (
              <div className="space-y-6">
                {selectedProperty.images?.[0] && (
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-full h-48 object-cover rounded-lg"
                    data-testid="img-property-detail"
                  />
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Title</Label>
                    <p className="font-semibold" data-testid="text-detail-title">{selectedProperty.title}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Type</Label>
                    <p className="font-semibold">{selectedProperty.type}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedProperty.status)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Price per Night</Label>
                    <p className="font-semibold">{parseFloat(selectedProperty.pricePerNight).toLocaleString()} {selectedProperty.currency}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Location</Label>
                    <p className="font-semibold">{selectedProperty.location}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">City / Region</Label>
                    <p className="font-semibold">{selectedProperty.city}, {selectedProperty.region}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Guests / Beds / Baths</Label>
                    <p className="font-semibold">{selectedProperty.maxGuests} guests · {selectedProperty.bedrooms} beds · {selectedProperty.bathrooms} baths</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Listed</Label>
                    <p className="font-semibold">{format(new Date(selectedProperty.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Description</Label>
                  <p className="text-sm mt-1">{selectedProperty.description}</p>
                </div>

                {selectedProperty.host && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-gray-500">Host Information</Label>
                    <div className="mt-2 space-y-1">
                      <p className="font-semibold">{selectedProperty.host.firstName} {selectedProperty.host.lastName}</p>
                      <p className="text-sm text-gray-600">{selectedProperty.host.email}</p>
                      <p className="text-sm text-gray-600">{selectedProperty.host.phoneNumber}</p>
                    </div>
                  </div>
                )}

                {selectedProperty.referralCode && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <Label className="text-amber-700">Delala Agent</Label>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Referral Code: {selectedProperty.referralCode}
                      </Badge>
                      {selectedProperty.agent && (
                        <p className="text-sm text-amber-700 mt-2">
                          Agent: {selectedProperty.agent.fullName} ({selectedProperty.agent.phoneNumber})
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)} data-testid="button-close-details">
                Close
              </Button>
              {selectedProperty?.status === "pending" && (
                <>
                  <Button
                    onClick={() => selectedProperty && handleApprove(selectedProperty)}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-approve-dialog"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      if (selectedProperty) openRejectDialog(selectedProperty);
                    }}
                    data-testid="button-reject-dialog"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent data-testid="dialog-reject">
            <DialogHeader>
              <DialogTitle>Reject Property</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this property listing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Property</Label>
                <p className="font-semibold">{selectedProperty?.title}</p>
              </div>
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Enter the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  data-testid="textarea-rejection-reason"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason("");
                }}
                data-testid="button-cancel-reject"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
                data-testid="button-confirm-reject"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
