import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HardDrive, 
  Lock,
  Camera,
  Thermometer,
  AlertTriangle,
  CheckCircle,
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

interface HardwareDeployment {
  id: number;
  propertyId: number;
  hardwareType: string;
  serialNumber: string;
  manufacturer: string;
  status: string;
  warrantyExpiry: string;
  installationDate: string;
  cost: string;
}

export default function HardwareDeploymentTab() {
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: hardware, isLoading } = useQuery<HardwareDeployment[]>({
    queryKey: ["/api/admin/hardware"],
  });

  // Mock data until API is created
  const mockHardware: HardwareDeployment[] = hardware || [];

  const filteredHardware = mockHardware.filter(h => 
    typeFilter === "all" || h.hardwareType === typeFilter
  );

  const lockboxCount = mockHardware.filter(h => h.hardwareType === "lockbox").length;
  const cameraCount = mockHardware.filter(h => h.hardwareType === "camera").length;
  const smartLockCount = mockHardware.filter(h => h.hardwareType === "smart_lock").length;
  
  const expiringWarranties = mockHardware.filter(h => {
    const expiryDate = new Date(h.warrantyExpiry);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  }).length;

  const totalInvestment = mockHardware.reduce((sum, h) => sum + parseFloat(h.cost || "0"), 0);

  const getHardwareIcon = (type: string) => {
    switch (type) {
      case "lockbox": return <Lock className="h-4 w-4" />;
      case "camera": return <Camera className="h-4 w-4" />;
      case "smart_lock": return <Lock className="h-4 w-4" />;
      case "thermostat": return <Thermometer className="h-4 w-4" />;
      default: return <HardDrive className="h-4 w-4" />;
    }
  };

  const isWarrantyExpiringSoon = (warrantyExpiry: string) => {
    const expiryDate = new Date(warrantyExpiry);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  };

  const exportCSV = () => {
    if (!filteredHardware.length) return;
    
    const headers = ["ID", "Type", "Serial Number", "Manufacturer", "Installation Date", "Warranty Expiry", "Status", "Cost"];
    const rows = filteredHardware.map(h => [
      h.id,
      h.hardwareType,
      h.serialNumber,
      h.manufacturer,
      h.installationDate,
      h.warrantyExpiry,
      h.status,
      h.cost
    ]);
    
    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hardware-deployments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#CD7F32]" />
              Lockboxes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lockboxCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Deployed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Camera className="h-4 w-4 text-[#CD7F32]" />
              Cameras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cameraCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Installed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#CD7F32]" />
              Smart Locks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smartLockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Warranty Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringWarranties}</div>
            <p className="text-xs text-muted-foreground mt-1">Expiring soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-[#CD7F32]" />
              Total Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {totalInvestment.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Hardware cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Hardware Deployment Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-[#CD7F32]" />
                Hardware Deployment Tracker
              </CardTitle>
              <CardDescription>
                Monitor lockboxes, cameras, and smart devices
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              disabled={!filteredHardware.length}
              data-testid="button-export-hardware-csv"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={typeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("all")}
              data-testid="filter-all-hardware"
            >
              All ({mockHardware.length})
            </Button>
            <Button
              variant={typeFilter === "lockbox" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("lockbox")}
              data-testid="filter-lockbox"
            >
              <Lock className="h-4 w-4 mr-1" />
              Lockboxes ({lockboxCount})
            </Button>
            <Button
              variant={typeFilter === "camera" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("camera")}
              data-testid="filter-camera"
            >
              <Camera className="h-4 w-4 mr-1" />
              Cameras ({cameraCount})
            </Button>
            <Button
              variant={typeFilter === "smart_lock" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("smart_lock")}
              data-testid="filter-smart-lock"
            >
              <Lock className="h-4 w-4 mr-1" />
              Smart Locks ({smartLockCount})
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading hardware...</div>
          ) : filteredHardware.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HardDrive className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hardware deployments yet</p>
              <p className="text-xs mt-1">Hardware tracking will appear here once devices are deployed</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Installed</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHardware.map((item) => (
                  <TableRow key={item.id} data-testid={`hardware-row-${item.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getHardwareIcon(item.hardwareType)}
                        <span className="capitalize">{item.hardwareType.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.serialNumber}</TableCell>
                    <TableCell>{item.manufacturer}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(item.installationDate).toLocaleDateString('en-ET')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {new Date(item.warrantyExpiry).toLocaleDateString('en-ET')}
                        </span>
                        {isWarrantyExpiringSoon(item.warrantyExpiry) && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expiring
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          item.status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {item.status === "active" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ETB {parseFloat(item.cost).toLocaleString()}
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
