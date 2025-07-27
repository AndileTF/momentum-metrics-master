
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Crown, Medal, TrendingUp, TrendingDown, Users, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type TimePeriod = "daily" | "weekly" | "monthly";
type MetricType = "calls" | "live_chat" | "sales_tickets" | "support_emails" | "total_issues";

interface LeaderboardAgent {
  Agent: string;
  agentid: string;
  Email: string;
  value: number;
  rank: number;
  "Team Lead Group": string;
}

export function Leaderboards() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("total_issues");
  const [selectedTeamLead, setSelectedTeamLead] = useState<string>("all");
  const [myTeamOnly, setMyTeamOnly] = useState(false);
  const [topPerformers, setTopPerformers] = useState<LeaderboardAgent[]>([]);
  const [bottomPerformers, setBottomPerformers] = useState<LeaderboardAgent[]>([]);
  const [teamLeads, setTeamLeads] = useState<string[]>([]);
  const [currentUserTeam, setCurrentUserTeam] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamLeads();
    fetchCurrentUserTeam();
  }, []);

  useEffect(() => {
    fetchLeaderboards();
  }, [timePeriod, selectedMetric, selectedTeamLead, myTeamOnly]);

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
        .single();

      if (error) throw error;
      setCurrentUserTeam(data?.team_lead_name || "");
    } catch (error) {
      console.error("Error fetching current user team:", error);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      let startDate: Date;

      switch (timePeriod) {
        case "daily":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "weekly":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
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
      
      data?.forEach((record: any) => {
        const agent = record.Agent;
        if (!aggregatedData[agent]) {
          aggregatedData[agent] = {
            Agent: record.Agent,
            agentid: record.agentid,
            Email: record.Email,
            "Team Lead Group": record["Team Lead Group"],
            calls: 0,
            live_chat: 0,
            sales_tickets: 0,
            support_emails: 0,
            total_issues: 0,
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
        
        aggregatedData[agent].calls += calls;
        aggregatedData[agent].live_chat += liveChat;
        aggregatedData[agent].sales_tickets += salesTickets;
        aggregatedData[agent].support_emails += supportEmails;
        aggregatedData[agent].total_issues += calls + liveChat + salesTickets + supportEmails + billingTickets + socialTickets + walkIns;
      });

      // Convert to array and get metric values
      const agentsWithMetric = Object.values(aggregatedData).map((agent: any) => ({
        ...agent,
        value: agent[selectedMetric],
      }));

      // Sort by metric value
      const sortedAgents = agentsWithMetric.sort((a, b) => b.value - a.value);
      
      // Add ranks
      const rankedAgents = sortedAgents.map((agent, index) => ({
        ...agent,
        rank: index + 1,
      }));

      // Filter out agents with 0 values for meaningful results
      const activeAgents = rankedAgents.filter(agent => agent.value > 0);

      // Top 5 performers
      setTopPerformers(activeAgents.slice(0, 5));
      
      // Bottom 5 performers
      setBottomPerformers(activeAgents.slice(-5).reverse());

    } catch (error) {
      console.error("Error fetching leaderboards:", error);
      toast({
        title: "Error",
        description: "Failed to load leaderboards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMetricLabel = (metric: MetricType) => {
    switch (metric) {
      case "calls": return "Calls";
      case "live_chat": return "Live Chat";
      case "sales_tickets": return "Sales Tickets";
      case "support_emails": return "Support/DNS Emails";
      case "total_issues": return "Total Issues";
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
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
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Metric</Label>
              <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total_issues">Total Issues</SelectItem>
                  <SelectItem value="calls">Calls</SelectItem>
                  <SelectItem value="live_chat">Live Chat</SelectItem>
                  <SelectItem value="sales_tickets">Sales Tickets</SelectItem>
                  <SelectItem value="support_emails">Support/DNS Emails</SelectItem>
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
                  {currentUserTeam ? `Show ${currentUserTeam} team only` : "No team assigned"}
                </Label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={fetchLeaderboards} variant="outline">
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top 5 Performers - {getMetricLabel(selectedMetric)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((agent) => (
                <div key={agent.agentid} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getRankIcon(agent.rank)}
                    <div>
                      <p className="font-medium">{agent.Agent}</p>
                      <p className="text-sm text-muted-foreground">{agent["Team Lead Group"]}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {agent.value}
                  </Badge>
                </div>
              ))}
              {topPerformers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No data available for the selected criteria
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Bottom 5 Performers - {getMetricLabel(selectedMetric)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottomPerformers.map((agent) => (
                <div key={agent.agentid} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">#{agent.rank}</span>
                    <div>
                      <p className="font-medium">{agent.Agent}</p>
                      <p className="text-sm text-muted-foreground">{agent["Team Lead Group"]}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {agent.value}
                  </Badge>
                </div>
              ))}
              {bottomPerformers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No data available for the selected criteria
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
