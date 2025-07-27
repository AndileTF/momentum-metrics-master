
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Search, BarChart3, Users, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type TimePeriod = "daily" | "weekly" | "monthly";

interface PerformanceData {
  Agent: string;
  agentid: string;
  Email: string;
  "Team Lead Group": string;
  Group: string;
  Calls: number;
  "Live Chat": number;
  "Sales Tickets": number;
  "Support/DNS Emails": number;
  "Billing Tickets": number;
  "Social Tickets": number;
  "Walk-Ins": number;
  "Total Issues": number;
  "Helpdesk ticketing": number;
  avgPerDay: number;
  trend: "up" | "down" | "stable";
}

export function PerformanceMetrics() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeamLead, setSelectedTeamLead] = useState<string>("all");
  const [myTeamOnly, setMyTeamOnly] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [teamLeads, setTeamLeads] = useState<string[]>([]);
  const [currentUserTeam, setCurrentUserTeam] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState({
    totalAgents: 0,
    totalIssues: 0,
    avgIssuesPerAgent: 0,
    topTeam: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamLeads();
    fetchCurrentUserTeam();
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [timePeriod, selectedTeamLead, myTeamOnly]);

  const fetchTeamLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_stats")
        .select("Team Lead Group")
        .not("Team Lead Group", "is", null);

      if (error) throw error;

      const uniqueTeamLeads = [...new Set(data?.map(record => record["Team Lead Group"]) || [])];
      setTeamLeads(uniqueTeamLeads.filter(Boolean));
    } catch (error) {
      console.error("Error fetching team leads:", error);
    }
  };

  const fetchCurrentUserTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profile")
        .select("team_lead_name")
        .eq("email", user.email)
        .maybeSingle();

      if (error) throw error;
      setCurrentUserTeam(data?.team_lead_name || "");
    } catch (error) {
      console.error("Error fetching current user team:", error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      let startDate: Date;
      let days: number;

      switch (timePeriod) {
        case "daily":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          days = 1;
          break;
        case "weekly":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          days = 7;
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          days = 30;
          break;
      }

      let query = supabase
        .from("daily_stats")
        .select("*")
        .gte("Date", startDate.toISOString().split('T')[0]);

      // Apply team lead filter
      if (myTeamOnly && currentUserTeam) {
        query = query.eq("Team Lead Group", currentUserTeam);
      } else if (selectedTeamLead !== "all") {
        query = query.eq("Team Lead Group", selectedTeamLead);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Aggregate data by agent
      const aggregatedData: Record<string, any> = {};
      const teamTotals: Record<string, number> = {};
      
      data?.forEach((record: any) => {
        const agent = record.Agent;
        const team = record["Team Lead Group"];
        
        if (!aggregatedData[agent]) {
          aggregatedData[agent] = {
            Agent: record.Agent,
            agentid: record.agentid,
            Email: record.Email,
            "Team Lead Group": team,
            Group: record.Group,
            Calls: 0,
            "Live Chat": 0,
            "Sales Tickets": 0,
            "Support/DNS Emails": 0,
            "Billing Tickets": 0,
            "Social Tickets": 0,
            "Walk-Ins": 0,
            "Total Issues": 0,
            "Helpdesk ticketing": 0,
          };
        }
        
        // Convert to numbers and handle null values
        const calls = parseInt(record.Calls?.toString()) || 0;
        const liveChat = parseInt(record["Live Chat"]?.toString()) || 0;
        const salesTickets = parseInt(record["Sales Tickets"]?.toString()) || 0;
        const supportEmails = parseInt(record["Support/DNS Emails"]?.toString()) || 0;
        const billingTickets = parseInt(record["Billing Tickets"]?.toString()) || 0;
        const socialTickets = parseInt(record["Social Tickets"]?.toString()) || 0;
        const walkIns = parseInt(record["Walk-Ins"]?.toString()) || 0;
        const totalIssues = calls + liveChat + salesTickets + supportEmails + billingTickets + socialTickets + walkIns;
        
        aggregatedData[agent].Calls += calls;
        aggregatedData[agent]["Live Chat"] += liveChat;
        aggregatedData[agent]["Sales Tickets"] += salesTickets;
        aggregatedData[agent]["Support/DNS Emails"] += supportEmails;
        aggregatedData[agent]["Billing Tickets"] += billingTickets;
        aggregatedData[agent]["Social Tickets"] += socialTickets;
        aggregatedData[agent]["Walk-Ins"] += walkIns;
        aggregatedData[agent]["Total Issues"] += totalIssues;
        aggregatedData[agent]["Helpdesk ticketing"] += parseInt(record["Helpdesk ticketing"]?.toString()) || 0;

        // Team totals
        teamTotals[team] = (teamTotals[team] || 0) + totalIssues;
      });

      // Calculate averages and trends
      const performanceList = Object.values(aggregatedData).map((agent: any) => ({
        ...agent,
        avgPerDay: Math.round(agent["Total Issues"] / days * 10) / 10,
        trend: agent["Total Issues"] > 0 ? "up" : "stable" as "up" | "down" | "stable"
      }));

      // Calculate team stats
      const totalIssues = performanceList.reduce((sum, agent) => sum + agent["Total Issues"], 0);
      const topTeam = Object.entries(teamTotals).sort(([,a], [,b]) => b - a)[0]?.[0] || "";

      setTeamStats({
        totalAgents: performanceList.length,
        totalIssues,
        avgIssuesPerAgent: Math.round(totalIssues / performanceList.length * 10) / 10,
        topTeam
      });

      setPerformanceData(performanceList.sort((a, b) => b["Total Issues"] - a["Total Issues"]));

    } catch (error) {
      console.error("Error fetching performance data:", error);
      toast({
        title: "Error",
        description: "Failed to load performance metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = performanceData.filter(agent =>
    agent.Agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent["Team Lead Group"].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case "daily": return "Today";
      case "weekly": return "This Week";
      case "monthly": return "This Month";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Metrics</SelectItem>
                  <SelectItem value="weekly">Weekly Metrics</SelectItem>
                  <SelectItem value="monthly">Monthly Metrics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Team Lead</Label>
              <Select value={selectedTeamLead} onValueChange={setSelectedTeamLead}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teamLeads.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>My Team Only</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="my-team-only"
                  checked={myTeamOnly}
                  onCheckedChange={setMyTeamOnly}
                  disabled={!currentUserTeam}
                />
                <Label htmlFor="my-team-only" className="text-sm">
                  {currentUserTeam ? `${currentUserTeam} team` : "No team"}
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <Button onClick={fetchPerformanceData} variant="outline" className="w-full">
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{teamStats.totalAgents}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{teamStats.totalIssues}</p>
                <p className="text-sm text-muted-foreground">Total Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-2xl font-bold">{teamStats.avgIssuesPerAgent}</p>
              <p className="text-sm text-muted-foreground">Avg per Agent</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-lg font-bold">{teamStats.topTeam}</p>
              <p className="text-sm text-muted-foreground">Top Team</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Performance Metrics - {getPeriodLabel(timePeriod)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead>Live Chat</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Support</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Social</TableHead>
                  <TableHead>Walk-ins</TableHead>
                  <TableHead>Total Issues</TableHead>
                  <TableHead>Avg/Day</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((agent) => (
                  <TableRow key={agent.agentid}>
                    <TableCell className="font-medium">{agent.Agent}</TableCell>
                    <TableCell>{agent["Team Lead Group"]}</TableCell>
                    <TableCell>{agent.Calls}</TableCell>
                    <TableCell>{agent["Live Chat"]}</TableCell>
                    <TableCell>{agent["Sales Tickets"]}</TableCell>
                    <TableCell>{agent["Support/DNS Emails"]}</TableCell>
                    <TableCell>{agent["Billing Tickets"]}</TableCell>
                    <TableCell>{agent["Social Tickets"]}</TableCell>
                    <TableCell>{agent["Walk-Ins"]}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-bold">
                        {agent["Total Issues"]}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent.avgPerDay}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
