import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type User as UserType, type Property } from "@shared/schema";
import { BackButton } from "@/components/back-button";
import Header from "@/components/header";
import { 
  Users, 
  User,
  Home, 
  FileCheck, 
  UserCheck, 
  ShieldCheck,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserX,
  Settings,
  LogOut,
  Briefcase,
  Sparkles,
  BarChart3,
  DollarSign,
  TrendingUp,
  Download,
  Search,
  Phone
} from "lucide-react";

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
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    idNumber?: string | null;
    idFullName?: string | null;
    idDocumentType?: string | null;
    idDocumentUrl?: string | null;
    idExpiryDate?: string | null;
    idCountry?: string | null;
  };
}

interface AdminStats {
  totalUsers: number;
  newUsersThisMonth: number;
  activeProperties: number;
  pendingProperties: number;
  pendingDocuments: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface Agent {
  id: number;
  userId: string;
  fullName: string;
  phoneNumber: string;
  telebirrAccount: string;
  idNumber?: string;
  idDocumentUrl?: string;
  businessName?: string;
  businessLicenseUrl?: string;
  city: string;
  subCity?: string;
  status: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  totalEarnings: string;
  totalProperties: number;
  activeProperties: number;
  referralCode?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Role-based access control: Only admins can access this page
  if (user && user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Card className="w-96 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">You don't have permission to access the admin dashboard. Only administrators can view this page.</p>
            <Button onClick={() => navigate("/")} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocument | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [revenueDetailsOpen, setRevenueDetailsOpen] = useState(false);
  const { toast } = useToast();
  
  // Get active tab from URL search params, default to 'overview'
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'overview';
  
  // Handle tab navigation
  const handleTabChange = (value: string) => {
    if (value === 'service-providers') {
      navigate('/admin/service-providers');
    } else {
      navigate(`/admin/dashboard?tab=${value}`);
    }
  };

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("GET", "/api/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Signed out successfully",
        description: "You have been logged out",
      });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Sign out failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Fetch users for management
  const { data: users = [], isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch properties for verification
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['/api/admin/properties'],
  });

  // Fetch verification documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery<VerificationDocument[]>({
    queryKey: ['/api/admin/verification-documents'],
  });

  // Fetch service providers
  const { data: serviceProviders = [] } = useQuery<any[]>({
    queryKey: ['/api/service-providers'],
  });

  // Fetch system statistics
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  // Fetch bookings for revenue details
  interface BookingData {
    id: number;
    propertyId: number;
    userId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: string;
    status: string;
    paymentStatus: string;
    paymentMethod?: string;
    paymentRef?: string;
    createdAt: string;
    property?: {
      title: string;
      city: string;
    };
    user?: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
    };
  }

  const { data: allBookings = [] } = useQuery<BookingData[]>({
    queryKey: ['/api/admin/bookings'],
    enabled: revenueDetailsOpen,
  });

  // Revenue dialog search and filter states
  const [revenueSearch, setRevenueSearch] = useState('');
  const [revenueStatusFilter, setRevenueStatusFilter] = useState('all');
  const [revenuePage, setRevenuePage] = useState(1);
  const revenuePerPage = 10;

  // Filter and paginate bookings
  const filteredBookings = allBookings.filter((booking) => {
    const matchesSearch = revenueSearch === '' || 
      booking.id.toString().includes(revenueSearch) ||
      booking.user?.firstName?.toLowerCase().includes(revenueSearch.toLowerCase()) ||
      booking.user?.lastName?.toLowerCase().includes(revenueSearch.toLowerCase()) ||
      booking.user?.phoneNumber?.includes(revenueSearch) ||
      booking.paymentRef?.toLowerCase().includes(revenueSearch.toLowerCase()) ||
      booking.property?.title?.toLowerCase().includes(revenueSearch.toLowerCase());
    
    const matchesStatus = revenueStatusFilter === 'all' || booking.paymentStatus === revenueStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const paginatedBookings = filteredBookings.slice(
    (revenuePage - 1) * revenuePerPage,
    revenuePage * revenuePerPage
  );

  const totalRevenuePages = Math.ceil(filteredBookings.length / revenuePerPage);

  // Export transactions to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Booking ID', 'Transaction ID', 'Guest', 'Phone', 'Property', 'Amount', 'Currency', 'Status'];
    const rows = filteredBookings.map(b => [
      format(new Date(b.createdAt), 'MM/dd/yyyy, h:mm:ss a'),
      b.id,
      b.paymentRef || 'N/A',
      `${b.user?.firstName || ''} ${b.user?.lastName || ''}`,
      b.user?.phoneNumber || 'N/A',
      b.property?.title || 'N/A',
      b.totalPrice,
      'ETB',
      b.paymentStatus
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alga-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Role Updated",
        description: "User role has been successfully updated",
      });
    },
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/admin/users/${userId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Status Updated",
        description: "User status has been successfully updated",
      });
    },
  });

  // Verify property mutation
  const verifyPropertyMutation = useMutation({
    mutationFn: async ({ propertyId, status, reason }: { propertyId: number; status: string; reason?: string }) => {
      return await apiRequest('PATCH', `/api/admin/properties/${propertyId}/verify`, { status, rejectionReason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
      toast({
        title: "Property Verification Updated",
        description: "Property verification status has been updated",
      });
    },
  });

  // Verify document mutation
  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ documentId, status, reason }: { documentId: number; status: string; reason?: string }) => {
      return await apiRequest('PATCH', `/api/admin/documents/${documentId}/verify`, { status, rejectionReason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verification-documents'] });
      toast({
        title: "Document Verification Updated",
        description: "Document verification status has been updated",
      });
    },
  });

  // Fetch dellala agents
  const { data: agents = [], isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ['/api/admin/agents'],
  });

  // Verify agent mutation
  const verifyAgentMutation = useMutation({
    mutationFn: async ({ agentId, status, reason }: { agentId: number; status: string; reason?: string }) => {
      return await apiRequest('POST', `/api/admin/agents/${agentId}/verify`, { status, rejectionReason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/agents'] });
      toast({
        title: "Agent Verification Updated",
        description: "Agent verification status has been updated",
      });
      setSelectedAgent(null);
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'operator': return 'secondary';
      case 'host': return 'default';
      case 'guest': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'operator': return 'Operator';
      case 'host': return 'Guesthouse Owner';
      case 'guest': return 'Tenant';
      default: return role;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getVerificationBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f2ec" }}>
        <Card className="max-w-md w-full mx-4" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
          <CardContent className="p-8 text-center">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4" style={{ color: "#8a6e4b" }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#2d1405" }}>
              Admin Dashboard
            </h2>
            <p className="text-base mb-6" style={{ color: "#5a4a42" }}>
              Please sign in to access the admin dashboard
            </p>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full text-lg py-6"
              style={{ background: "#2d1405" }}
              data-testid="button-signin"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage users, properties, and system operations
          </p>
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleTabChange('users')}
          data-testid="card-users"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newUsersThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleTabChange('properties')}
          data-testid="card-properties"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeProperties || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingProperties || 0} pending approval
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-green-200 bg-gradient-to-br from-green-50 to-white"
          onClick={() => navigate('/admin/id-verification')}
          data-testid="card-documents"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ID Verification</CardTitle>
            <FileCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats?.pendingDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Documents awaiting review
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/admin/service-providers')}
          data-testid="card-service-providers"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceProviders.filter((p: any) => p.verificationStatus === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending approval
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-green-400 transition-all"
          onClick={() => setRevenueDetailsOpen(true)}
          data-testid="card-revenue"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRevenue || 0} ETB</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.monthlyRevenue || 0} ETB this month
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-[#CD7F32] bg-gradient-to-br from-[#f9e9d8] to-white"
          onClick={() => navigate('/admin/lemlem-insights')}
          data-testid="card-lemlem-insights"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#2d1405]">Lemlem AI</CardTitle>
            <BarChart3 className="h-4 w-4 text-[#CD7F32]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#CD7F32]">Analytics</div>
            <p className="text-xs text-gray-600">
              View insights & costs
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-[#CD7F32] bg-gradient-to-br from-[#e3d5c7] to-white ring-2 ring-[#CD7F32] ring-opacity-50"
          onClick={() => navigate('/admin/lemlem-ops')}
          data-testid="card-lemlem-ops"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#2d1405] flex items-center gap-2">
              Lemlem Ops
              <Badge className="bg-[#CD7F32] text-white text-[10px] px-1.5 py-0.5">v3</Badge>
            </CardTitle>
            <Sparkles className="h-4 w-4 text-[#CD7F32]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#CD7F32]">Intelligence</div>
            <p className="text-xs text-gray-600">
              Query operations data
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-[#CD7F32] bg-gradient-to-br from-[#f9e9d8] to-white"
          onClick={() => navigate('/admin/ai-control')}
          data-testid="card-ai-control"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#2d1405]">AI Controls</CardTitle>
            <Sparkles className="h-4 w-4 text-[#CD7F32]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#CD7F32]">Settings</div>
            <p className="text-xs text-gray-600">
              Budget & toggles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-7 h-auto overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm whitespace-nowrap" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="properties" className="text-xs sm:text-sm whitespace-nowrap" data-testid="tab-properties">Properties</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm whitespace-nowrap" data-testid="tab-documents">ID Verify</TabsTrigger>
          <TabsTrigger value="agents" className="text-xs sm:text-sm whitespace-nowrap" data-testid="tab-agents">Dellala Agents</TabsTrigger>
          <TabsTrigger value="service-providers" className="text-xs sm:text-sm whitespace-nowrap" data-testid="tab-service-providers">Service Providers</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs sm:text-sm whitespace-nowrap" data-testid="tab-payments">Payments</TabsTrigger>
          <TabsTrigger value="config" className="text-xs sm:text-sm whitespace-nowrap" data-testid="tab-config">Config</TabsTrigger>
        </TabsList>

        {/* System Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2 text-eth-red" />
                  Admin Control Center
                </CardTitle>
                <CardDescription>
                  Overarching system control and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-eth-green" />
                      <div>
                        <p className="font-medium">Total System Users</p>
                        <p className="text-sm text-gray-600">All registered accounts</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{stats?.totalUsers || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Home className="h-5 w-5 text-eth-yellow" />
                      <div>
                        <p className="font-medium">Total Properties</p>
                        <p className="text-sm text-gray-600">All listings in system</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{stats?.activeProperties || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileCheck className="h-5 w-5 text-eth-red" />
                      <div>
                        <p className="font-medium">Pending Verifications</p>
                        <p className="text-sm text-gray-600">Awaiting admin approval</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-eth-red">{stats?.pendingDocuments || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-eth-green" />
                  System Activity
                </CardTitle>
                <CardDescription>
                  Real-time platform monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">New Users (This Month)</span>
                    <span className="font-bold text-eth-green">+{stats?.newUsersThisMonth || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Properties Pending Review</span>
                    <span className="font-bold text-eth-yellow">{stats?.pendingProperties || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Platform Revenue</span>
                    <span className="font-bold text-eth-green">{stats?.totalRevenue || 0} ETB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Monthly Revenue</span>
                    <span className="font-bold text-eth-green">{stats?.monthlyRevenue || 0} ETB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-eth-yellow" />
                  Role Distribution
                </CardTitle>
                <CardDescription>
                  User roles across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Admins</p>
                    <p className="text-3xl font-bold text-eth-red">
                      {users.filter((u: any) => u.role === 'admin').length}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Operators</p>
                    <p className="text-3xl font-bold text-eth-yellow">
                      {users.filter((u: any) => u.role === 'operator').length}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Guesthouse Owners</p>
                    <p className="text-3xl font-bold text-eth-green">
                      {users.filter((u: any) => u.role === 'host').length}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Tenants</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {users.filter((u: any) => u.role === 'guest').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" style={{ color: "#d97706" }} />
                  Service Provider Applications
                </CardTitle>
                <CardDescription>
                  Review and approve service provider applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold" style={{ color: "#d97706" }}>
                      {serviceProviders.filter((p: any) => p.verificationStatus === 'pending').length}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Verified</p>
                    <p className="text-3xl font-bold text-eth-green">
                      {serviceProviders.filter((p: any) => p.verificationStatus === 'verified').length}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-eth-red">
                      {serviceProviders.filter((p: any) => p.verificationStatus === 'rejected').length}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/admin/service-providers')} 
                  className="w-full"
                  style={{ background: "#2d1405" }}
                  data-testid="button-manage-providers"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Manage Service Provider Applications
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user roles, status, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.profileImageUrl || '/placeholder-avatar.png'}
                            alt={user.firstName}
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeColor(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {user.phoneVerified && (
                            <Badge variant="outline" className="text-green-600">
                              Phone
                            </Badge>
                          )}
                          {user.idVerified && (
                            <Badge variant="outline" className="text-green-600">
                              ID
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Select
                            value={user.role}
                            onValueChange={(role) => 
                              updateUserRoleMutation.mutate({ userId: user.id, role })
                            }
                          >
                            <SelectTrigger className="w-[180px]" data-testid={`select-role-${user.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="guest">Tenant</SelectItem>
                              <SelectItem value="host">Guesthouse Owner</SelectItem>
                              <SelectItem value="operator">Operator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant={user.status === 'active' ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() => 
                              updateUserStatusMutation.mutate({ 
                                userId: user.id, 
                                status: user.status === 'active' ? 'suspended' : 'active' 
                              })
                            }
                          >
                            {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Verification Tab */}
        <TabsContent value="properties">
          {/* Dellala Properties Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                Dellala Properties ({properties.filter((p: any) => p.agentInfo).length})
              </CardTitle>
              <CardDescription>
                Properties brought in by Dellala agents - verify ownership and listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Dellala Agent</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.filter((p: any) => p.agentInfo).length > 0 ? (
                    properties.filter((p: any) => p.agentInfo).map((property: any) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={property.images?.[0] || '/placeholder-property.png'}
                              alt={property.title}
                              className="h-12 w-12 rounded object-cover cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => navigate(`/properties/${property.id}`)}
                              data-testid={`img-property-${property.id}`}
                            />
                            <div>
                              <div className="font-medium">{property.title}</div>
                              <div className="text-sm text-muted-foreground">{property.type}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{property.host?.firstName} {property.host?.lastName}</div>
                            <div className="text-xs text-muted-foreground">{property.host?.phoneNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-purple-700">{property.agentInfo.fullName}</div>
                            <div className="text-xs text-muted-foreground">{property.agentInfo.phoneNumber}</div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {parseFloat(property.agentInfo.totalCommissionEarned).toFixed(2)} ETB earned
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{property.city}, {property.region}</TableCell>
                        <TableCell>
                          <Badge variant={getVerificationBadgeColor(property.status)}>
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/properties/${property.id}`)}
                              data-testid={`button-view-property-${property.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {property.status === 'pending' && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => 
                                    verifyPropertyMutation.mutate({ 
                                      propertyId: property.id, 
                                      status: 'active' 
                                    })
                                  }
                                  data-testid={`button-approve-property-${property.id}`}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setSelectedProperty(property)}
                                  data-testid={`button-reject-property-${property.id}`}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>No Dellala properties yet</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Regular Properties Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Direct Properties ({properties.filter((p: any) => !p.agentInfo).length})
              </CardTitle>
              <CardDescription>
                Properties listed directly by hosts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.filter((p: any) => !p.agentInfo).length > 0 ? (
                    properties.filter((p: any) => !p.agentInfo).map((property: any) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={property.images?.[0] || '/placeholder-property.png'}
                              alt={property.title}
                              className="h-12 w-12 rounded object-cover cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => navigate(`/properties/${property.id}`)}
                              data-testid={`img-property-${property.id}`}
                            />
                            <div>
                              <div className="font-medium">{property.title}</div>
                              <div className="text-sm text-muted-foreground">{property.type}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{property.host?.firstName} {property.host?.lastName}</TableCell>
                        <TableCell>{property.city}, {property.region}</TableCell>
                        <TableCell>
                          <Badge variant={getVerificationBadgeColor(property.status)}>
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/properties/${property.id}`)}
                              data-testid={`button-view-property-${property.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {property.status === 'pending' && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => 
                                    verifyPropertyMutation.mutate({ 
                                      propertyId: property.id, 
                                      status: 'active' 
                                    })
                                  }
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setSelectedProperty(property)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        <Home className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>No direct properties yet</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ID Verification Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>ID Verification</CardTitle>
              <CardDescription>
                Review user identification documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc: any) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{doc.user?.firstName} {doc.user?.lastName}</div>
                          <div className="text-sm text-muted-foreground">{doc.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {doc.documentType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getVerificationBadgeColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDocument(doc)}
                            data-testid={`button-view-document-${doc.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {doc.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => 
                                  verifyDocumentMutation.mutate({ 
                                    documentId: doc.id, 
                                    status: 'approved' 
                                  })
                                }
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setSelectedDocument(doc)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dellala Agents Tab */}
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Dellala Agent Management
              </CardTitle>
              <CardDescription>
                Approve or reject Dellala agent applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agentsLoading ? (
                <div className="text-center py-8">Loading agents...</div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No Dellala agent applications found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">Total: {agents.length}</Badge>
                    <Badge variant="outline">Pending: {agents.filter(a => a.status === 'pending').length}</Badge>
                    <Badge variant="default">Approved: {agents.filter(a => a.status === 'approved').length}</Badge>
                    <Badge variant="destructive">Rejected: {agents.filter(a => a.status === 'rejected').length}</Badge>
                  </div>

                  <div className="rounded-md border overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Agent Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Telebirr</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Properties</TableHead>
                          <TableHead>Earnings</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agents.map((agent) => (
                          <TableRow key={agent.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{agent.fullName}</div>
                                <div className="text-sm text-gray-600">{agent.user?.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{agent.phoneNumber}</TableCell>
                            <TableCell>{agent.city}</TableCell>
                            <TableCell className="font-mono text-sm">{agent.telebirrAccount}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  agent.status === 'approved' ? 'default' :
                                  agent.status === 'pending' ? 'secondary' :
                                  agent.status === 'rejected' ? 'destructive' :
                                  'outline'
                                }
                              >
                                {agent.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{agent.activeProperties} active</div>
                                <div className="text-gray-600">{agent.totalProperties} total</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono">{agent.totalEarnings} ETB</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAgent(agent)}
                                data-testid={`button-view-agent-${agent.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card className="bg-white/80 border-[#e5ddd5]">
            <CardHeader>
              <CardTitle className="text-[#2d1810]">Payment Control</CardTitle>
              <CardDescription>Monitor and manage all payment transactions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-[#2d1810]">Payment Transaction Management</h3>
                <p className="text-[#5a4a42] max-w-md">
                  View all payment transactions, filter by status, gateway, and type. 
                  Reconcile transactions with banking records.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/admin/payments')}
                className="bg-[#8b7355] hover:bg-[#6d5a43] text-white"
                data-testid="button-open-payments"
              >
                Open Payment Control
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration Tab */}
        <TabsContent value="config">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure platform-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Property Approval Required</p>
                        <p className="text-sm text-gray-600">New properties need admin approval before listing</p>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">ID Verification Required</p>
                        <p className="text-sm text-gray-600">Users must verify ID to make bookings</p>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Auto-assign Operators</p>
                        <p className="text-sm text-gray-600">Automatically assign verifications to operators</p>
                      </div>
                      <Badge variant="secondary">Disabled</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Platform Commission</p>
                        <p className="text-sm text-gray-600">Commission rate for bookings</p>
                      </div>
                      <span className="font-bold">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Operator Management
                </CardTitle>
                <CardDescription>
                  Manage verification operators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Operators review and verify guesthouse owner details, ensuring all documentation and specifications are met before properties are listed.
                  </p>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-medium mb-1">Active Operators</p>
                    <p className="text-3xl font-bold text-eth-yellow">
                      {users.filter((u: any) => u.role === 'operator').length}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {users.filter((u: any) => u.role === 'operator').length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No operators assigned yet. Promote users from User Management tab.</p>
                    ) : (
                      users
                        .filter((u: any) => u.role === 'operator')
                        .map((operator: any) => (
                          <div key={operator.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <img
                                src={operator.profileImageUrl || '/placeholder-avatar.png'}
                                alt={operator.firstName}
                                className="h-8 w-8 rounded-full"
                              />
                              <div>
                                <p className="font-medium">{operator.firstName} {operator.lastName}</p>
                                <p className="text-xs text-gray-600">{operator.email}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">Operator</Badge>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-2 border-[#CD7F32]">
              <CardHeader className="bg-gradient-to-br from-[#f9e9d8] to-white">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#CD7F32]" />
                  Roles & Permissions
                </CardTitle>
                <CardDescription>
                  Manage user access levels and understand role capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <User className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{users.filter((u: any) => u.role === 'guest').length}</p>
                      <p className="text-xs text-gray-600 mt-1">Tenants</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <Home className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{users.filter((u: any) => u.role === 'host').length}</p>
                      <p className="text-xs text-gray-600 mt-1">Guesthouse Owners</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <ShieldCheck className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">{users.filter((u: any) => u.role === 'operator').length}</p>
                      <p className="text-xs text-gray-600 mt-1">Operators</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                      <Shield className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-600">{users.filter((u: any) => u.role === 'admin').length}</p>
                      <p className="text-xs text-gray-600 mt-1">Admins</p>
                    </div>
                  </div>

                  <div className="bg-[#f9e9d8] p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-3">
                      View detailed permissions for each role, manage user access levels, and understand what each role can do in the platform.
                    </p>
                    <Button 
                      onClick={() => navigate('/admin/roles-permissions')} 
                      className="w-full"
                      style={{ background: "#CD7F32" }}
                      data-testid="button-manage-roles"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Roles & Permissions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Admin Privileges Summary</CardTitle>
                <CardDescription>
                  Full system control and capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-l-4 border-eth-red bg-red-50">
                    <h4 className="font-semibold text-eth-red mb-2">User Management</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Change user roles (Admin, Operator, Guesthouse Owner, Tenant)</li>
                      <li>• Suspend or activate user accounts</li>
                      <li>• View all user verification status</li>
                    </ul>
                  </div>

                  <div className="p-4 border-l-4 border-eth-yellow bg-yellow-50">
                    <h4 className="font-semibold text-eth-yellow mb-2">Property Verification</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Approve or reject property listings</li>
                      <li>• Review property documentation</li>
                      <li>• Ensure compliance with platform standards</li>
                    </ul>
                  </div>

                  <div className="p-4 border-l-4 border-eth-green bg-green-50">
                    <h4 className="font-semibold text-eth-green mb-2">Document Verification</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Review ID verification documents</li>
                      <li>• Approve or reject verification requests</li>
                      <li>• Maintain platform integrity and trustworthiness</li>
                    </ul>
                  </div>

                  <div className="p-4 border-l-4 border-blue-600 bg-blue-50">
                    <h4 className="font-semibold text-blue-600 mb-2">System Configuration</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Configure platform-wide settings</li>
                      <li>• Manage operator assignments</li>
                      <li>• Oversee all platform activities</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Review Dialog */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">ID Verification Review</DialogTitle>
              <DialogDescription>
                Review identification document and user details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* User Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-eth-brown mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  User Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Full Name</p>
                    <p className="font-medium">
                      {selectedDocument.user?.firstName} {selectedDocument.user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Email</p>
                    <p className="font-medium">{selectedDocument.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Phone Number</p>
                    <p className="font-medium">{selectedDocument.user?.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">User ID</p>
                    <p className="font-medium font-mono text-xs">{selectedDocument.userId}</p>
                  </div>
                </div>
              </div>

              {/* Scanned ID Details */}
              {selectedDocument.user && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-eth-brown mb-3 flex items-center">
                    <FileCheck className="h-5 w-5 mr-2" />
                    Scanned ID Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {selectedDocument.user.idNumber && (
                      <div>
                        <p className="text-gray-600 mb-1">ID Number</p>
                        <p className="font-medium font-mono">{selectedDocument.user.idNumber}</p>
                      </div>
                    )}
                    {selectedDocument.user.idFullName && (
                      <div>
                        <p className="text-gray-600 mb-1">Name on ID</p>
                        <p className="font-medium">{selectedDocument.user.idFullName}</p>
                      </div>
                    )}
                    {selectedDocument.user.idDocumentType && (
                      <div>
                        <p className="text-gray-600 mb-1">Document Type</p>
                        <Badge variant="outline" className="mt-1">
                          {selectedDocument.user.idDocumentType.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}
                    {selectedDocument.user.idCountry && (
                      <div>
                        <p className="text-gray-600 mb-1">Country</p>
                        <p className="font-medium">{selectedDocument.user.idCountry}</p>
                      </div>
                    )}
                    {selectedDocument.user.idExpiryDate && (
                      <div>
                        <p className="text-gray-600 mb-1">Expiry Date</p>
                        <p className="font-medium">{selectedDocument.user.idExpiryDate}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600 mb-1">Submitted</p>
                      <p className="font-medium">
                        {new Date(selectedDocument.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Document Image */}
              <div>
                <h3 className="font-semibold text-eth-brown mb-3">Document Image</h3>
                {(selectedDocument.documentUrl && !selectedDocument.documentUrl.includes('placeholder')) || selectedDocument.user?.idDocumentUrl ? (
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={selectedDocument.user?.idDocumentUrl || selectedDocument.documentUrl || ''}
                      alt="Verification Document"
                      className="w-full max-h-[400px] object-contain"
                      data-testid={`img-document-${selectedDocument.id}`}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-gray-200 rounded-lg bg-gray-100 p-8 text-center">
                    <FileCheck className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2 font-medium">ID Document Verified Digitally</p>
                    <p className="text-sm text-gray-500">
                      This user submitted their ID information through digital ID scanning.
                      All extracted data is shown above.
                    </p>
                    {selectedDocument.user?.idNumber && (
                      <div className="mt-4 p-3 bg-white rounded border">
                        <p className="text-xs text-gray-500 mb-1">Verified ID Number</p>
                        <p className="font-mono font-medium text-eth-brown">{selectedDocument.user.idNumber}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Status Information */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Status</p>
                  <Badge variant={getVerificationBadgeColor(selectedDocument.status)} className="text-sm">
                    {selectedDocument.status}
                  </Badge>
                </div>
                {selectedDocument.rejectionReason && (
                  <div className="flex-1 ml-6">
                    <p className="text-sm text-gray-600 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-600">{selectedDocument.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Actions for Pending Documents */}
              {selectedDocument.status === 'pending' && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Provide a reason if rejecting this document..."
                      className="mt-2"
                      data-testid="textarea-rejection-reason"
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDocument(null)}
                      data-testid="button-cancel-review"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const reason = (document.getElementById('rejection-reason') as HTMLTextAreaElement)?.value;
                        verifyDocumentMutation.mutate({
                          documentId: selectedDocument.id,
                          status: 'rejected',
                          reason
                        });
                        setSelectedDocument(null);
                      }}
                      data-testid="button-reject-document"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        verifyDocumentMutation.mutate({
                          documentId: selectedDocument.id,
                          status: 'approved'
                        });
                        setSelectedDocument(null);
                      }}
                      data-testid="button-approve-document"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Upgrade to Host
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Agent Approval Dialog */}
      {selectedAgent && (
        <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-eth-brown" />
                Dellala Agent Application - {selectedAgent.fullName}
              </DialogTitle>
              <DialogDescription>
                Review and approve or reject this Dellala agent application
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Agent Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="font-medium">{selectedAgent.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{selectedAgent.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="font-medium font-mono">{selectedAgent.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Telebirr Account</p>
                  <p className="font-medium font-mono">{selectedAgent.telebirrAccount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">City</p>
                  <p className="font-medium">{selectedAgent.city}</p>
                </div>
                {selectedAgent.subCity && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Sub-City</p>
                    <p className="font-medium">{selectedAgent.subCity}</p>
                  </div>
                )}
                {selectedAgent.idNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ID Number</p>
                    <p className="font-medium font-mono">{selectedAgent.idNumber}</p>
                  </div>
                )}
                {selectedAgent.businessName && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Business Name</p>
                    <p className="font-medium">{selectedAgent.businessName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Referral Code</p>
                  <p className="font-medium font-mono">{selectedAgent.referralCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Applied On</p>
                  <p className="font-medium">{new Date(selectedAgent.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Properties</p>
                  <p className="text-2xl font-bold">{selectedAgent.totalProperties}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Properties</p>
                  <p className="text-2xl font-bold">{selectedAgent.activeProperties}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold">{selectedAgent.totalEarnings} ETB</p>
                </div>
              </div>

              {/* ID Document */}
              {selectedAgent.idDocumentUrl && (
                <div>
                  <h3 className="font-semibold text-eth-brown mb-3">ID Document</h3>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={selectedAgent.idDocumentUrl}
                      alt="Agent ID Document"
                      className="w-full max-h-[400px] object-contain"
                      data-testid={`img-agent-id-${selectedAgent.id}`}
                    />
                  </div>
                </div>
              )}

              {/* Business License */}
              {selectedAgent.businessLicenseUrl && (
                <div>
                  <h3 className="font-semibold text-eth-brown mb-3">Business License</h3>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={selectedAgent.businessLicenseUrl}
                      alt="Business License"
                      className="w-full max-h-[400px] object-contain"
                      data-testid={`img-agent-license-${selectedAgent.id}`}
                    />
                  </div>
                </div>
              )}

              {/* Status Information */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Status</p>
                  <Badge 
                    variant={
                      selectedAgent.status === 'approved' ? 'default' :
                      selectedAgent.status === 'pending' ? 'secondary' :
                      selectedAgent.status === 'rejected' ? 'destructive' :
                      'outline'
                    }
                    className="text-sm"
                  >
                    {selectedAgent.status}
                  </Badge>
                </div>
                {selectedAgent.rejectionReason && (
                  <div className="flex-1 ml-6">
                    <p className="text-sm text-gray-600 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-600">{selectedAgent.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Actions for Pending Agents */}
              {selectedAgent.status === 'pending' && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor="agent-rejection-reason">Rejection Reason (Optional)</Label>
                    <Textarea
                      id="agent-rejection-reason"
                      placeholder="Provide a reason if rejecting this agent application..."
                      className="mt-2"
                      data-testid="textarea-agent-rejection-reason"
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedAgent(null)}
                      data-testid="button-cancel-agent-review"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const reason = (document.getElementById('agent-rejection-reason') as HTMLTextAreaElement)?.value;
                        verifyAgentMutation.mutate({
                          agentId: selectedAgent.id,
                          status: 'rejected',
                          reason
                        });
                      }}
                      disabled={verifyAgentMutation.isPending}
                      data-testid="button-reject-agent"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {verifyAgentMutation.isPending ? "Rejecting..." : "Reject"}
                    </Button>
                    <Button
                      onClick={() => {
                        verifyAgentMutation.mutate({
                          agentId: selectedAgent.id,
                          status: 'approved'
                        });
                      }}
                      disabled={verifyAgentMutation.isPending}
                      data-testid="button-approve-agent"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {verifyAgentMutation.isPending ? "Approving..." : "Approve Agent"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Revenue Details Dialog - ArifPay Style */}
      <Dialog open={revenueDetailsOpen} onOpenChange={setRevenueDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="h-5 w-5 text-green-600" />
                Transactions Detail
              </DialogTitle>
              <DialogDescription>
                Complete transaction history with search and export
              </DialogDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="flex items-center gap-2"
              data-testid="button-export-csv"
            >
              <Download className="h-4 w-4" />
              EXPORT
            </Button>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search and Filter Row */}
            <div className="flex flex-wrap gap-3 items-center p-4 bg-gray-50 rounded-lg border">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by ID, Name, Phone, or Transaction ID..."
                  value={revenueSearch}
                  onChange={(e) => {
                    setRevenueSearch(e.target.value);
                    setRevenuePage(1);
                  }}
                  className="pl-10"
                  data-testid="input-revenue-search"
                />
              </div>
              <Select value={revenueStatusFilter} onValueChange={(v) => { setRevenueStatusFilter(v); setRevenuePage(1); }}>
                <SelectTrigger className="w-[150px]" data-testid="select-revenue-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setRevenuePage(1)}
              >
                <Search className="h-4 w-4 mr-2" />
                SEARCH
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-green-700">Total Revenue</p>
                <p className="text-2xl font-bold text-green-800">{stats?.totalRevenue || 0} ETB</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">This Month</p>
                <p className="text-2xl font-bold text-blue-800">+{stats?.monthlyRevenue || 0} ETB</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700">Paid Bookings</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {allBookings.filter((b) => b.paymentStatus === 'paid').length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-700">Pending Payments</p>
                <p className="text-2xl font-bold text-purple-800">
                  {allBookings.filter((b) => b.paymentStatus === 'pending').length}
                </p>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#1a3a4a] text-white">
                    <TableRow>
                      <TableHead className="text-white font-semibold">Date</TableHead>
                      <TableHead className="text-white font-semibold">Booking ID</TableHead>
                      <TableHead className="text-white font-semibold">Transaction ID</TableHead>
                      <TableHead className="text-white font-semibold">Phone</TableHead>
                      <TableHead className="text-white font-semibold">Guest</TableHead>
                      <TableHead className="text-white font-semibold">Currency</TableHead>
                      <TableHead className="text-white font-semibold">Amount</TableHead>
                      <TableHead className="text-white font-semibold">Type</TableHead>
                      <TableHead className="text-white font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBookings.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-gray-50">
                        <TableCell className="text-sm">
                          {format(new Date(booking.createdAt), 'MM/dd/yyyy, h:mm:ss a')}
                        </TableCell>
                        <TableCell className="font-mono text-sm font-medium">
                          #{booking.id}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-blue-600">
                          {booking.paymentRef || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {booking.user?.phoneNumber || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{booking.user?.firstName} {booking.user?.lastName}</p>
                            <p className="text-xs text-gray-500">{booking.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">ETB</TableCell>
                        <TableCell className="text-sm font-semibold">
                          {parseFloat(booking.totalPrice).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">Booking</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              booking.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : booking.paymentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }
                          >
                            {booking.paymentStatus === 'paid' ? 'Success' : 
                             booking.paymentStatus === 'pending' ? 'Pending' : 'Failed'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedBookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  Rows per page: {revenuePerPage}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {((revenuePage - 1) * revenuePerPage) + 1}-{Math.min(revenuePage * revenuePerPage, filteredBookings.length)} of {filteredBookings.length}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setRevenuePage(p => Math.max(1, p - 1))}
                      disabled={revenuePage === 1}
                    >
                      &lt;
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setRevenuePage(p => Math.min(totalRevenuePages, p + 1))}
                      disabled={revenuePage >= totalRevenuePages}
                    >
                      &gt;
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRevenueDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}