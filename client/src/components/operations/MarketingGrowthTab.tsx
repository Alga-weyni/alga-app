import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users as UsersIcon,
  DollarSign,
  Target,
  Instagram,
  Facebook,
  Send,
  Download
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MarketingCampaign {
  id: number;
  campaignName: string;
  platform: string;
  status: string;
  budget: string;
  spent: string;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate: string;
}

export default function MarketingGrowthTab() {
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const { data: campaigns, isLoading } = useQuery<MarketingCampaign[]>({
    queryKey: ["/api/admin/marketing/campaigns"],
  });

  // Mock data until API is created
  const mockCampaigns: MarketingCampaign[] = campaigns || [];

  const filteredCampaigns = mockCampaigns.filter(c => 
    platformFilter === "all" || c.platform === platformFilter
  );

  const totalBudget = mockCampaigns.reduce((sum, c) => sum + parseFloat(c.budget || "0"), 0);
  const totalSpent = mockCampaigns.reduce((sum, c) => sum + parseFloat(c.spent || "0"), 0);
  const totalImpressions = mockCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalConversions = mockCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const totalClicks = mockCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);

  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : "0.00";

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram": return <Instagram className="h-4 w-4" />;
      case "facebook": return <Facebook className="h-4 w-4" />;
      case "tiktok": return <SiTiktok className="h-4 w-4" />;
      case "telegram": return <Send className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const exportCSV = () => {
    if (!filteredCampaigns.length) return;
    
    const headers = ["Campaign", "Platform", "Budget", "Spent", "Impressions", "Clicks", "Conversions", "CTR", "Status"];
    const rows = filteredCampaigns.map(c => [
      c.campaignName.replace(/,/g, ";"),
      c.platform,
      c.budget,
      c.spent,
      c.impressions,
      c.clicks,
      c.conversions,
      c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) + "%" : "0%",
      c.status
    ]);
    
    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketing-campaigns-${new Date().toISOString().split('T')[0]}.csv`;
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
              <DollarSign className="h-4 w-4 text-[#CD7F32]" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {totalBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalSpent > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-[#CD7F32]" />
              Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total reach</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-[#CD7F32]" />
              Click-Through Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctr}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalClicks.toLocaleString()} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-[#CD7F32]" />
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCampaigns.filter(c => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {mockCampaigns.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#CD7F32]" />
                Marketing Campaign Performance
              </CardTitle>
              <CardDescription>
                Track social media and growth initiatives
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              disabled={!filteredCampaigns.length}
              data-testid="button-export-campaigns-csv"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={platformFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlatformFilter("all")}
              data-testid="filter-all-platforms"
            >
              All Platforms
            </Button>
            <Button
              variant={platformFilter === "facebook" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlatformFilter("facebook")}
              data-testid="filter-facebook"
            >
              <Facebook className="h-4 w-4 mr-1" />
              Facebook
            </Button>
            <Button
              variant={platformFilter === "instagram" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlatformFilter("instagram")}
              data-testid="filter-instagram"
            >
              <Instagram className="h-4 w-4 mr-1" />
              Instagram
            </Button>
            <Button
              variant={platformFilter === "tiktok" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlatformFilter("tiktok")}
              data-testid="filter-tiktok"
            >
              <SiTiktok className="h-4 w-4 mr-1" />
              TikTok
            </Button>
            <Button
              variant={platformFilter === "telegram" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlatformFilter("telegram")}
              data-testid="filter-telegram"
            >
              <Send className="h-4 w-4 mr-1" />
              Telegram
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading campaigns...</div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No marketing campaigns yet</p>
              <p className="text-xs mt-1">Campaign tracking will appear here once marketing initiatives are launched</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => {
                  const campaignCTR = campaign.impressions > 0 
                    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) 
                    : "0.00";
                  
                  return (
                    <TableRow key={campaign.id} data-testid={`campaign-row-${campaign.id}`}>
                      <TableCell className="font-medium">{campaign.campaignName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(campaign.platform)}
                          <span className="capitalize">{campaign.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ETB {parseFloat(campaign.budget).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ETB {parseFloat(campaign.spent).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {campaign.impressions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {campaign.clicks.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {campaign.conversions}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {campaignCTR}%
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            campaign.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : campaign.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
