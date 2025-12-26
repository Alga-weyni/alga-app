import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BackButton } from "@/components/back-button";
import Header from "@/components/header";
import {
  Search,
  Eye,
  Shield,
  UserCheck,
  UserX,
  FileText,
  Users,
  Home,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface IdDocument {
  id: number;
  userId: string;
  documentType: string;
  documentUrl: string;
  status: string;
  createdAt: string;
}

interface AdminUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
  phoneNumber: string | null;
  phoneVerified: boolean;
  idVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  bookingsCount: number;
  propertiesCount: number;
  hasIdDocuments: boolean;
  idDocuments: IdDocument[];
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ROLES = [
  { value: "all", label: "All Roles" },
  { value: "guest", label: "Guest" },
  { value: "host", label: "Host" },
  { value: "admin", label: "Admin" },
  { value: "operator", label: "Operator" },
  { value: "delala", label: "Delala" },
];

const STATUSES = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "unverified", label: "Unverified" },
];

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800 border-red-200";
    case "operator":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "host":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "agent":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "service_provider":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusBadge = (status: string, idVerified: boolean) => {
  if (status === "suspended") {
    return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Suspended</Badge>;
  }
  if (!idVerified) {
    return <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700"><AlertCircle className="w-3 h-3" /> Unverified</Badge>;
  }
  return <Badge variant="outline" className="gap-1 border-green-300 text-green-700"><CheckCircle className="w-3 h-3" /> Active</Badge>;
};

export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState("");

  const ITEMS_PER_PAGE = 15;

  if (user && user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf5f0]">
        <Card className="w-96 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">You don't have permission to access this page. Only administrators can view this page.</p>
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
    
    if (roleFilter !== "all") {
      params.append("role", roleFilter);
    }
    if (statusFilter !== "all") {
      params.append("status", statusFilter);
    }
    if (searchQuery.trim()) {
      params.append("search", searchQuery.trim());
    }
    
    return params.toString();
  };

  const { data, isLoading, refetch } = useQuery<UsersResponse>({
    queryKey: ['/api/admin/users', currentPage, roleFilter, statusFilter, searchQuery],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const response = await fetch(`/api/admin/users?${queryString}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
      setRoleDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Status Updated",
        description: "User status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleFilterChange = (filter: "role" | "status", value: string) => {
    if (filter === "role") {
      setRoleFilter(value);
    } else {
      setStatusFilter(value);
    }
    setCurrentPage(1);
  };

  const getUserInitials = (user: AdminUser) => {
    const first = user.firstName?.charAt(0) || "";
    const last = user.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U";
  };

  const getUserDisplayName = (user: AdminUser) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email || "Unknown User";
  };

  const formatRole = (role: string) => {
    if (role === "agent") return "Delala";
    if (role === "service_provider") return "Service Provider";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(data.totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination data-testid="pagination-container">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              data-testid="button-pagination-prev"
            />
          </PaginationItem>
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={page === currentPage}
                className="cursor-pointer"
                data-testid={`button-pagination-${page}`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(Math.min(data.totalPages, currentPage + 1))}
              className={currentPage === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              data-testid="button-pagination-next"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf5f0]">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-[#2d1405]" data-testid="text-page-title">User Management</h1>
            <p className="text-gray-600">Manage all users on the platform</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </form>
              <Select value={roleFilter} onValueChange={(v) => handleFilterChange("role", v)}>
                <SelectTrigger className="w-full md:w-40" data-testid="select-role-filter">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value} data-testid={`option-role-${role.value}`}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => handleFilterChange("status", v)}>
                <SelectTrigger className="w-full md:w-40" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value} data-testid={`option-status-${status.value}`}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users {data && <span className="text-sm font-normal text-gray-500">({data.total} total)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : data?.users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.users.map((u) => (
                      <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10" data-testid={`avatar-user-${u.id}`}>
                              {u.profileImageUrl ? (
                                <AvatarImage src={u.profileImageUrl} alt={getUserDisplayName(u)} />
                              ) : null}
                              <AvatarFallback className="bg-[#2d1405] text-white">
                                {getUserInitials(u)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-[#2d1405]" data-testid={`text-name-${u.id}`}>
                                {getUserDisplayName(u)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {u.email && (
                              <div className="flex items-center gap-1 text-gray-600" data-testid={`text-email-${u.id}`}>
                                <Mail className="h-3 w-3" />
                                {u.email}
                              </div>
                            )}
                            {u.phoneNumber && (
                              <div className="flex items-center gap-1 text-gray-600" data-testid={`text-phone-${u.id}`}>
                                <Phone className="h-3 w-3" />
                                {u.phoneNumber}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getRoleBadgeColor(u.role)}`} data-testid={`badge-role-${u.id}`}>
                            {formatRole(u.role)}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`badge-status-${u.id}`}>
                          {getStatusBadge(u.status, u.idVerified)}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm" data-testid={`text-created-${u.id}`}>
                          {format(new Date(u.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(u);
                                setDetailsDialogOpen(true);
                              }}
                              data-testid={`button-view-${u.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(u);
                                setNewRole(u.role);
                                setRoleDialogOpen(true);
                              }}
                              data-testid={`button-role-${u.id}`}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            {u.status === "suspended" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => changeStatusMutation.mutate({ userId: u.id, status: "active" })}
                                disabled={changeStatusMutation.isPending}
                                data-testid={`button-activate-${u.id}`}
                              >
                                <UserCheck className="h-4 w-4 text-green-600" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => changeStatusMutation.mutate({ userId: u.id, status: "suspended" })}
                                disabled={changeStatusMutation.isPending}
                                data-testid={`button-suspend-${u.id}`}
                              >
                                <UserX className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                            {u.hasIdDocuments && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setDocumentsDialogOpen(true);
                                }}
                                data-testid={`button-documents-${u.id}`}
                              >
                                <FileText className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              {renderPagination()}
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-user-details">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Full profile information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {selectedUser.profileImageUrl ? (
                    <AvatarImage src={selectedUser.profileImageUrl} alt={getUserDisplayName(selectedUser)} />
                  ) : null}
                  <AvatarFallback className="bg-[#2d1405] text-white text-xl">
                    {getUserInitials(selectedUser)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{getUserDisplayName(selectedUser)}</h3>
                  <Badge className={getRoleBadgeColor(selectedUser.role)}>{formatRole(selectedUser.role)}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{selectedUser.email || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{selectedUser.phoneNumber || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  {getStatusBadge(selectedUser.status, selectedUser.idVerified)}
                </div>
                <div>
                  <p className="text-gray-500">ID Verified</p>
                  <p className="font-medium">{selectedUser.idVerified ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone Verified</p>
                  <p className="font-medium">{selectedUser.phoneVerified ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">{format(new Date(selectedUser.createdAt), "PPP")}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Activity Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold" data-testid="text-bookings-count">{selectedUser.bookingsCount}</p>
                      <p className="text-xs text-gray-500">Bookings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Home className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold" data-testid="text-properties-count">{selectedUser.propertiesCount}</p>
                      <p className="text-xs text-gray-500">Properties</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)} data-testid="button-close-details">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent data-testid="dialog-change-role">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role for {selectedUser ? getUserDisplayName(selectedUser) : "user"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger data-testid="select-new-role">
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="host">Host</SelectItem>
                <SelectItem value="agent">Delala (Agent)</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="service_provider">Service Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)} data-testid="button-cancel-role">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedUser && newRole) {
                  changeRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
                }
              }}
              disabled={changeRoleMutation.isPending || !newRole}
              data-testid="button-save-role"
            >
              {changeRoleMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-documents">
          <DialogHeader>
            <DialogTitle>ID Documents</DialogTitle>
            <DialogDescription>
              Verification documents for {selectedUser ? getUserDisplayName(selectedUser) : "user"}
            </DialogDescription>
          </DialogHeader>
          {selectedUser?.idDocuments && selectedUser.idDocuments.length > 0 ? (
            <div className="space-y-4">
              {selectedUser.idDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium capitalize">{doc.documentType.replace(/_/g, " ")}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded {format(new Date(doc.createdAt), "PPP")}
                      </p>
                    </div>
                    <Badge
                      variant={doc.status === "approved" ? "default" : doc.status === "rejected" ? "destructive" : "outline"}
                    >
                      {doc.status}
                    </Badge>
                  </div>
                  {doc.documentUrl && (
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      data-testid={`link-document-${doc.id}`}
                    >
                      <FileText className="h-4 w-4" />
                      View Document
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No documents found</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocumentsDialogOpen(false)} data-testid="button-close-documents">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
