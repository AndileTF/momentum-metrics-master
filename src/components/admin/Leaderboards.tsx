import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, TrendingUp, TrendingDown } from "lucide-react";
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
  const [topPerformers, setTopPerformers] = useState<LeaderboardAgent[]>([]);
  const [bottomPerformers, setBottomPerformers] = useState<LeaderboardAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboards();
  }, [timePeriod, selectedMetric]);

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

      const { data, error } = await supabase
        .from("Daily Stats")
        .select("*")
        .gte("Date", startDate.toISOString().split('T')[0]);

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
        
        const calls = record.Calls || 0;
        const liveChat = record["Live Chat"] || 0;
        const salesTickets = record["Sales Tickets"] || 0;
        const supportEmails = record["Support/DNS Emails"] || 0;
        const billingTickets = record["Billing Tickets"] || 0;
        const socialTickets = record["Social Tickets"] || 0;
        const walkIns = record["Walk-Ins"] || 0;
        
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

      // Top 10 performers
      setTopPerformers(rankedAgents.slice(0, 10));
      
      // Bottom 5 performers (excluding those with 0 values)
      const activeAgents = rankedAgents.filter(agent => agent.value > 0);
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
      <div className="flex gap-4 items-center">
        <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
          <SelectTrigger className="w-48">
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

        <Button onClick={fetchLeaderboards} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Performers - {getMetricLabel(selectedMetric)}
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
            </div>
          </CardContent>
        </Card>

        {/* Bottom Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Needs Improvement - {getMetricLabel(selectedMetric)}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}