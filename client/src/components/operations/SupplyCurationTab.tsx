import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Check, 
  X, 
  Clock,
  AlertCircle,
  MapPin,
  Download
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/api-config";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: number;
  title: string;
  city: string;
  pricePerNight: string;
  status: string;
  operatorVerified: boolean;
  securityDeposit: string | null;
  hostId: string;
  createdAt: string;
}

export default function SupplyCurationTab() {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const verifyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      return await apiRequest("POST", `/api/properties/${propertyId}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property Verified",
        description: "Property has been successfully verified"
      });
    }
  });

  const filteredProperties = properties?.filter(p => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return !p.operatorVerified && p.status === "active";
    if (filterStatus === "verified") return p.operatorVerified;
    if (filterStatus === "inactive") return p.status !== "active";
    return true;
  }) || [];

  const pendingCount = properties?.filter(p => !p.operatorVerified && p.status === "active").length || 0;
  const verifiedCount = properties?.filter(p => p.operatorVerified).length || 0;
  const totalProperties = properties?.length || 0;

  const exportCSV = () => {
    if (!filteredProperties.length) return;
    
    const headers = ["ID", "Title", "City", "Price", "Status", "Verified", "Host ID"];
    const rows = filteredProperties.map(p => [
      p.id,
      p.title.replace(/,/g, ";"),
      p.city,
      p.pricePerNight,
      p.status,
      p.operatorVerified ? "Yes" : "No",
      p.hostId
    ]);
    
    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `properties-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Home className="h-4 w-4 text-[#CD7F32]" />
              Total Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">In system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalProperties > 0 ? Math.round((verifiedCount / totalProperties) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties?.filter(p => !p.securityDeposit && p.operatorVerified).length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Missing deposits</p>
          </CardContent>
        </Card>
      </div>

      {/* Property Verification Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-[#CD7F32]" />
                Property Verification Queue
              </CardTitle>
              <CardDescription>
                Review and approve property listings for quality
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                disabled={!filteredProperties.length}
                data-testid="button-export-properties-csv"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              data-testid="filter-all"
            >
              All ({totalProperties})
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
              data-testid="filter-pending"
            >
              <Clock className="h-4 w-4 mr-1" />
              Pending ({pendingCount})
            </Button>
            <Button
              variant={filterStatus === "verified" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("verified")}
              data-testid="filter-verified"
            >
              <Check className="h-4 w-4 mr-1" />
              Verified ({verifiedCount})
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading properties...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No properties found matching filter
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Price/Night</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id} data-testid={`property-row-${property.id}`}>
                    <TableCell className="font-mono text-sm">#{property.id}</TableCell>
                    <TableCell className="font-medium max-w-[300px]">
                      <div className="flex items-start gap-2">
                        <Home className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <div className="truncate">{property.title}</div>
                          {!property.securityDeposit && (
                            <Badge variant="destructive" className="mt-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              No Deposit
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {property.city}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ETB {parseFloat(property.pricePerNight).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {property.operatorVerified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!property.operatorVerified && property.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyMutation.mutate(property.id)}
                          disabled={verifyMutation.isPending}
                          data-testid={`button-verify-${property.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
