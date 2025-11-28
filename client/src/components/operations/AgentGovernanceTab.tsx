import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Award,
  Download,
  Filter
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Agent {
  id: number;
  fullName: string;
  phoneNumber: string;
  city: string;
  status: string;
  totalEarnings: string;
  totalProperties: number;
  activeProperties: number;
  createdAt: string;
}

export default function AgentGovernanceTab() {
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/admin/operations/agents"],
  });

  // Filter agents by zone and status
  const filteredAgents = agents?.filter(agent => {
    const zoneMatch = zoneFilter === "all" || agent.city === zoneFilter;
    const statusMatch = statusFilter === "all" || agent.status === statusFilter;
    return zoneMatch && statusMatch;
  }) || [];

  // Calculate leaderboard stats
  const topAgent = filteredAgents.sort((a, b) => 
    parseFloat(b.totalEarnings) - parseFloat(a.totalEarnings)
  )[0];

  const totalCommissionPaid = filteredAgents.reduce((sum, agent) => 
    sum + parseFloat(agent.totalEarnings || "0"), 0
  );

  const totalAgents = filteredAgents.length;
  const activeAgents = filteredAgents.filter(a => a.status === "approved").length;

  const exportCSV = () => {
    if (!filteredAgents.length) return;
    
    const headers = ["Rank", "Name", "Phone", "City", "Properties", "Earnings (ETB)", "Status"];
    const rows = filteredAgents.map((agent, index) => [
      index + 1,
      agent.fullName,
      agent.phoneNumber,
      agent.city,
      agent.activeProperties,
      parseFloat(agent.totalEarnings || '0').toFixed(2),
      agent.status
    ]);
    
    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
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
              <Users className="h-4 w-4 text-[#CD7F32]" />
              Total Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeAgents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#CD7F32]" />
              Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {totalCommissionPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Paid to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-[#CD7F32]" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{topAgent?.fullName || "N/A"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ETB {parseFloat(topAgent?.totalEarnings || "0").toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#CD7F32]" />
              Avg Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {activeAgents > 0 ? (totalCommissionPaid / activeAgents).toFixed(0) : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per agent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#CD7F32]" />
                Agent Leaderboard
              </CardTitle>
              <CardDescription>
                Ranked by total commission earned
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              disabled={!filteredAgents.length}
              data-testid="button-export-agents-csv"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-zone-filter">
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  <SelectItem value="Bole">Bole</SelectItem>
                  <SelectItem value="CMC">CMC (Casanchis)</SelectItem>
                  <SelectItem value="Gerji">Gerji</SelectItem>
                  <SelectItem value="Megenagna">Megenagna</SelectItem>
                  <SelectItem value="Piassa">Piassa</SelectItem>
                  <SelectItem value="Merkato">Merkato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading agents...</div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agents found matching filters
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead className="text-right">Properties</TableHead>
                  <TableHead className="text-right">Earnings (ETB)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent, index) => (
                  <TableRow key={agent.id} data-testid={`agent-row-${agent.id}`}>
                    <TableCell className="font-medium">
                      {index === 0 && "🥇"}
                      {index === 1 && "🥈"}
                      {index === 2 && "🥉"}
                      {index > 2 && `#${index + 1}`}
                    </TableCell>
                    <TableCell className="font-medium">{agent.fullName}</TableCell>
                    <TableCell className="text-sm">{agent.phoneNumber}</TableCell>
                    <TableCell>{agent.city}</TableCell>
                    <TableCell className="text-right">
                      <div>
                        <span className="font-medium">{agent.activeProperties}</span>
                        <span className="text-muted-foreground text-xs"> / {agent.totalProperties}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {parseFloat(agent.totalEarnings).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={agent.status === "approved" ? "default" : "secondary"}
                        className={
                          agent.status === "approved" 
                            ? "bg-green-100 text-green-800" 
                            : agent.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {agent.status}
                      </Badge>
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
