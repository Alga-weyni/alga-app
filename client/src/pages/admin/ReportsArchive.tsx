/**
 * Weekly Reports Archive
 * View and download historical weekly performance reports
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  Download,
  Trash2,
  Calendar,
  TrendingUp,
  Users,
  Home,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { reportStorage, type StoredReport } from "@/lib/reportStorage";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function ReportsArchive() {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const allReports = await reportStorage.getAllReports();
      setReports(allReports);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast({
        title: "Error Loading Reports",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (report: StoredReport) => {
    try {
      await reportStorage.downloadReport(report);
      toast({
        title: "📥 Report Downloaded",
        description: `Week ending ${new Date(report.weekEnding).toLocaleDateString('en-ET')}`,
      });
    } catch (error) {
      console.error('Failed to download report:', error);
      toast({
        title: "Download Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (report: StoredReport) => {
    if (!confirm(`Delete report for week ending ${new Date(report.weekEnding).toLocaleDateString('en-ET')}?`)) {
      return;
    }

    try {
      await reportStorage.deleteReport(report.id);
      await loadReports(); // Refresh list
      toast({
        title: "🗑️ Report Deleted",
        description: "Report removed from archive",
      });
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast({
        title: "Delete Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6BD89]/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5B4032] to-[#CD7F32] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FileText className="h-8 w-8" />
                Weekly Reports Archive
              </h1>
              <p className="text-white/90">
                Historical Performance Pulse Reports
              </p>
            </div>
            <Link to="/admin/lemlem-ops">
              <Button variant="outline" className="text-white border-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#CD7F32]" />
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Archived weekly summaries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#CD7F32]" />
                Latest Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {reports.length > 0
                  ? new Date(reports[0].weekEnding).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' })
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Most recent week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#CD7F32]" />
                Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.min(reports.length, 12)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Weeks tracked (max 12)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Download className="h-4 w-4 text-[#CD7F32]" />
                Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Offline</div>
              <p className="text-xs text-muted-foreground mt-1">
                100% browser-native
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#CD7F32]" />
              Archived Reports
            </CardTitle>
            <CardDescription>
              Weekly Performance Pulse PDFs - Download or delete
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No reports generated yet</p>
                <p className="text-sm mt-1">Reports are automatically generated every Friday</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week Ending</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Agents</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Critical Alerts</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} data-testid={`report-row-${report.id}`}>
                      <TableCell className="font-medium">
                        {new Date(report.weekEnding).toLocaleDateString('en-ET', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(report.generatedAt).toLocaleString('en-ET', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {report.metadata.totalAgents}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Home className="h-3 w-3 text-muted-foreground" />
                          {report.metadata.totalProperties}
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.metadata.criticalAlerts > 0 ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <AlertTriangle className="h-3 w-3" />
                            {report.metadata.criticalAlerts}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            None
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(report)}
                            data-testid={`button-download-${report.id}`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(report)}
                            className="text-red-600 hover:bg-red-50"
                            data-testid={`button-delete-${report.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-[#CD7F32]">
          <CardHeader>
            <CardTitle className="text-sm">📅 Automatic Report Generation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Reports are automatically generated every Friday</li>
              <li>• Stored locally in IndexedDB (works offline)</li>
              <li>• Last 12 weeks retained automatically</li>
              <li>• 100% FREE - no cloud storage costs</li>
              <li>• Download manually from Operations Dashboard anytime</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* INSA Compliance Footer */}
      <div className="bg-gradient-to-r from-[#5B4032] to-[#CD7F32] text-white py-4 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between text-sm">
            <div>
              Alga One Member PLC • TIN: 0101809194 • INSA Compliant
            </div>
            <div className="text-right opacity-90">
              Reports Archive System
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
