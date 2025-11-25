import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/back-button";
import {
  Shield,
  User,
  Home,
  Briefcase,
  Settings,
  CheckCircle2,
  XCircle,
  Search,
  UserCheck,
  UserX,
  Filter,
  ShieldCheck,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  status: string;
  phoneVerified: boolean;
  idVerified: boolean;
  profileImageUrl?: string;
}

const PERMISSIONS = {
  guest: {
    name: "Tenant",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    permissions: [
      "Browse and search properties",
      "Make bookings and reservations",
      "Review properties they've stayed at",
      "Browse add-on services",
      "Manage their own profile",
      "Chat with Lemlem AI assistant",
      "Access booking history",
      "Cancel bookings (with policies)",
    ],
    restrictions: [
      "Cannot list properties",
      "Cannot provide services",
      "Cannot access admin features",
      "Cannot verify other users",
    ],
  },
  host: {
    name: "Guesthouse Owner",
    icon: Home,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    permissions: [
      "All Guest permissions",
      "List and manage properties",
      "Set pricing and availability",
      "View and manage bookings",
      "Configure property access codes",
      "Upload property images",
      "Configure Lemlem AI for their properties",
      "View earnings and payouts",
      "Respond to reviews",
      "View property analytics",
    ],
    restrictions: [
      "Cannot verify properties (admin only)",
      "Cannot access other hosts' properties",
      "Cannot manage platform settings",
      "Cannot verify users",
    ],
  },
  operator: {
    name: "Operator",
    icon: ShieldCheck,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    permissions: [
      "Verify user ID documents",
      "Review verification submissions",
      "Approve/reject ID verification",
      "View verification queue",
      "Access operator dashboard",
      "View verification history",
    ],
    restrictions: [
      "Cannot manage properties",
      "Cannot manage users roles",
      "Cannot access platform settings",
      "Cannot manage service providers",
    ],
  },
  admin: {
    name: "Admin",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    permissions: [
      "Full platform access",
      "Manage all users and roles",
      "Verify and manage properties",
      "Approve service providers",
      "Configure Lemlem AI settings",
      "Set platform budget limits",
      "View all analytics and insights",
      "Manage commission and taxes",
      "Access all dashboards",
      "Suspend/activate users",
      "Override system settings",
    ],
    restrictions: [
      "Should use responsibly",
      "Actions are logged",
    ],
  },
};

export default function AdminRolesPermissions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Redirect if not admin
  if (user && user.role !== "admin") {
    navigate("/");
    return null;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ["/api/admin/users"],
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated",
      });
    },
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Status Updated",
        description: "User status has been successfully updated",
      });
    },
  });

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      searchQuery === "" ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phoneNumber.includes(searchQuery);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "operator":
        return "secondary";
      case "host":
        return "default";
      case "guest":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9e9d8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD7F32] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9e9d8]">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <BackButton />

        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-[#CD7F32]" />
          <div>
            <h1 className="text-3xl font-bold text-[#2d1405]">Roles & Permissions</h1>
            <p className="text-gray-600">Manage user access and understand platform roles</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Roles Overview</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
          </TabsList>

          {/* Roles Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(PERMISSIONS).map(([roleKey, roleData]) => {
                const Icon = roleData.icon;
                const userCount = users.filter((u) => u.role === roleKey).length;

                return (
                  <Card
                    key={roleKey}
                    className={`border-2 ${roleData.borderColor}`}
                    data-testid={`card-role-${roleKey}`}
                  >
                    <CardHeader className={roleData.bgColor}>
                      <CardTitle className="flex items-center gap-3">
                        <Icon className={`h-6 w-6 ${roleData.color}`} />
                        <span className={roleData.color}>{roleData.name}</span>
                      </CardTitle>
                      <CardDescription>
                        {userCount} {userCount === 1 ? "user" : "users"} with this role
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Permissions
                        </h4>
                        <ul className="space-y-1">
                          {roleData.permissions.map((permission, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">✓</span>
                              {permission}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Restrictions
                        </h4>
                        <ul className="space-y-1">
                          {roleData.restrictions.map((restriction, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-red-600 mt-0.5">✗</span>
                              {restriction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Manage Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-users"
                      />
                    </div>
                  </div>

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger data-testid="select-filter-role">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="guest">Tenant</SelectItem>
                      <SelectItem value="host">Guesthouse Owner</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger data-testid="select-filter-status">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Update roles and manage user access</CardDescription>
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
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No users found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((userData) => (
                        <TableRow key={userData.id} data-testid={`row-user-${userData.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={userData.profileImageUrl || "/placeholder-avatar.png"}
                                alt={userData.firstName}
                                className="h-8 w-8 rounded-full"
                              />
                              <div>
                                <div className="font-medium">
                                  {userData.firstName} {userData.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{userData.email}</div>
                                <div className="text-xs text-gray-400">{userData.phoneNumber}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeColor(userData.role)}>
                              {PERMISSIONS[userData.role as keyof typeof PERMISSIONS]?.name || userData.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                userData.status === "active"
                                  ? "default"
                                  : userData.status === "suspended"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {userData.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {userData.phoneVerified && (
                                <Badge variant="outline" className="text-green-600 text-xs">
                                  Phone
                                </Badge>
                              )}
                              {userData.idVerified && (
                                <Badge variant="outline" className="text-green-600 text-xs">
                                  ID
                                </Badge>
                              )}
                              {!userData.phoneVerified && !userData.idVerified && (
                                <span className="text-xs text-gray-400">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Select
                                value={userData.role}
                                onValueChange={(role) =>
                                  updateUserRoleMutation.mutate({ userId: userData.id, role })
                                }
                              >
                                <SelectTrigger
                                  className="w-[160px]"
                                  data-testid={`select-role-${userData.id}`}
                                >
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
                                variant={userData.status === "active" ? "destructive" : "default"}
                                size="sm"
                                onClick={() =>
                                  updateUserStatusMutation.mutate({
                                    userId: userData.id,
                                    status: userData.status === "active" ? "suspended" : "active",
                                  })
                                }
                                data-testid={`button-toggle-status-${userData.id}`}
                              >
                                {userData.status === "active" ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
