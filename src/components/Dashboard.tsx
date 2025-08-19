import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Trophy, Medal, TrendingUp, Users, Clock, Calendar, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AgentCard } from "./AgentCard";
import { RefreshIndicator } from "./RefreshIndicator";
type TimePeriod = "daily" | "weekly" | "monthly";
interface AgentStats {
  Agent: string;
  agentid: string;
  "Total Issues handled": number;
  Calls: number;
  "Live Chat": number;
  Email: string;
  "Support/DNS Emails": number | null;
  "Social Tickets": number | null;
  "Billing Tickets": number | null;
  "Sales Tickets": number | null;
  "Walk-Ins": number | null;
  Date: string;
  rank: number;
  latestDate?: string;
  avatar?: string;
}
export function Dashboard() {
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto-rotation between time periods every 10 seconds
  useEffect(() => {
    if (!autoRotate) return;
    const periods: TimePeriod[] = ["daily", "weekly", "monthly"];
    let currentIndex = 0;
    const rotationInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % periods.length;
      setTimePeriod(periods[currentIndex]);
    }, 10000);
    return () => clearInterval(rotationInterval);
  }, [autoRotate]);
  const fetchAgentStats = async (period: TimePeriod) => {
    try {
      setRefreshing(true);

      // Filter by time period
      const now = new Date();
      let startDate: Date;
      switch (period) {
        case "daily":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "weekly":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "monthly":
          // Show last 30 days for monthly view to ensure we have data
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Fetch public-safe stats via RPC (works without auth)
      const start = startDate.toISOString().split('T')[0];
      const {
        data: rows,
        error
      } = await supabase.rpc('get_public_daily_stats', {
        _start_date: start
      });
      if (error) {
        console.error('Error fetching public daily stats:', error);
        return;
      }

      // Normalize keys to match existing aggregator expectations
      const normalized = (rows || []).map((r: any) => ({
        Agent: r["Agent"],
        agentid: r.agentid,
        Email: r["Email"],
        Date: r["Date"],
        Calls: r["Calls"],
        "Live Chat": r["Live Chat"],
        "Billing Tickets": r["Billing Tickets"],
        "Sales Tickets": r["Sales Tickets"],
        "Support/DNS Emails": r["Support/DNS Emails"],
        "Social Tickets": r["Social Tickets"],
        "Walk-Ins": r["Walk-Ins"],
        avatar: r.avatar
      }));

      // Aggregate data by agent for weekly/monthly views
      const aggregatedData: Record<string, Omit<AgentStats, 'rank'> & {
        latestDate: string;
        avatar?: string;
      }> = {};
      normalized.forEach((record: any) => {
        const agent = record.Agent;
        if (!aggregatedData[agent]) {
          aggregatedData[agent] = {
            ...record,
            "Total Issues handled": 0,
            Calls: 0,
            "Live Chat": 0,
            "Sales Tickets": 0,
            "Support/DNS Emails": 0,
            "Social Tickets": 0,
            "Billing Tickets": 0,
            "Walk-Ins": 0,
            latestDate: record.Date,
            avatar: record.avatar
          };
        }

        // Calculate total from specific columns only - convert to numbers first
        const calls = parseInt(record.Calls?.toString()) || 0;
        const liveChat = parseInt(record["Live Chat"]?.toString()) || 0;
        const billingTickets = parseInt(record["Billing Tickets"]?.toString()) || 0;
        const salesTickets = parseInt(record["Sales Tickets"]?.toString()) || 0;
        const supportEmails = parseInt(record["Support/DNS Emails"]?.toString()) || 0;
        const socialTickets = parseInt(record["Social Tickets"]?.toString()) || 0;
        const walkIns = parseInt(record["Walk-Ins"]?.toString()) || 0;
        const totalIssues = calls + liveChat + billingTickets + salesTickets + supportEmails + socialTickets + walkIns;
        aggregatedData[agent]["Total Issues handled"] += totalIssues;
        aggregatedData[agent].Calls += calls;
        aggregatedData[agent]["Live Chat"] += liveChat;
        aggregatedData[agent]["Sales Tickets"] = (aggregatedData[agent]["Sales Tickets"] || 0) + salesTickets;
        aggregatedData[agent]["Support/DNS Emails"] = (aggregatedData[agent]["Support/DNS Emails"] || 0) + supportEmails;
        aggregatedData[agent]["Social Tickets"] = (aggregatedData[agent]["Social Tickets"] || 0) + socialTickets;
        aggregatedData[agent]["Billing Tickets"] = (aggregatedData[agent]["Billing Tickets"] || 0) + billingTickets;
        aggregatedData[agent]["Walk-Ins"] = (aggregatedData[agent]["Walk-Ins"] || 0) + walkIns;

        // Track the latest date for this agent
        if (new Date(record.Date) > new Date(aggregatedData[agent].latestDate)) {
          aggregatedData[agent].latestDate = record.Date;
        }
      });

      // Avatars already included via RPC (profile.avatar or csr_agent_proflie.Profile). Skip extra queries without auth.

      // Convert to array and sort by total issues
      const sortedAgents = Object.values(aggregatedData).sort((a, b) => (b["Total Issues handled"] || 0) - (a["Total Issues handled"] || 0)).slice(0, 10).map((agent, index) => ({
        ...agent,
        rank: index + 1
      }));
      setAgents(sortedAgents);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchAgentStats(timePeriod);

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchAgentStats(timePeriod);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timePeriod]);
  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case "daily":
        return "Today";
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Month";
    }
  };
  const getDateRange = (period: TimePeriod) => {
    const now = new Date();
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: period === 'monthly' ? 'numeric' : undefined
    });
    switch (period) {
      case "daily":
        return formatDate(now);
      case "weekly":
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return `${formatDate(weekStart)} - ${formatDate(now)}`;
      case "monthly":
        const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return `${formatDate(monthStart)} - ${formatDate(now)}`;
    }
  };
  const getStatsIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-champion" />;
    if (rank === 2) return <Trophy className="h-6 w-6 text-primary" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-accent" />;
    return <TrendingUp className="h-5 w-5 text-muted-foreground" />;
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-xl text-muted-foreground">Loading Momentum Dashboard...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen p-6 bg-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Logo and Title Side by Side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <img src="/lovable-uploads/076cdbc1-71db-4395-8d53-3018b3b7e27d.png" alt="Liquid Intelligent Technologies" className="h-16 w-auto" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                MOMENTUM
              </h1>
              <p className="text-lg text-gray-600">
                Agent Performance Leaderboard
              </p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="text-right space-y-1">
            <p className="text-xl font-semibold text-gray-900">
              {getPeriodLabel(timePeriod)}
            </p>
            <p className="text-sm text-gray-950">
              {getDateRange(timePeriod)}
            </p>
            {autoRotate && <Badge variant="outline" className="text-xs bg-slate-900">
                Auto-rotating every 10 seconds
              </Badge>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as TimePeriod[]).map(period => <Button key={period} variant={timePeriod === period ? "default" : "outline"} onClick={() => {
            setTimePeriod(period);
            setAutoRotate(false); // Stop auto-rotation when user manually selects
          }} className={`filter-button capitalize ${timePeriod === period ? "active" : ""}`}>
                {period}
              </Button>)}
            <Button variant={autoRotate ? "default" : "outline"} onClick={() => setAutoRotate(!autoRotate)} className="filter-button ml-4">
              {autoRotate ? "⏸️ Pause" : "▶️ Auto"}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <RefreshIndicator refreshing={refreshing} lastRefresh={lastRefresh} />
            <Badge variant="outline" className="flex items-center gap-2 bg-slate-900">
              <Users className="h-4 w-4" />
              {agents.length} Agents
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.slice(0, 3).map((agent, index) => <Card key={agent.agentid} className={`rank-card ${index === 0 ? "rank-1" : ""} p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatsIcon(index + 1)}
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1} Position
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{agent.Agent}</h3>
                  <p className="text-2xl font-bold text-primary">
                    {agent["Total Issues handled"]} issues
                  </p>
                  {timePeriod === "daily" && (agent.latestDate || agent.Date) && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(agent.latestDate || agent.Date).toLocaleDateString()}</span>
                    </div>}
                </div>
              </div>
            </Card>)}
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Top Performers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {agents.map((agent, index) => <AgentCard key={agent.agentid} agent={agent} rank={index + 1} timePeriod={timePeriod} className="leaderboard-enter" style={{
            animationDelay: `${index * 0.1}s`
          }} />)}
          </div>
        </div>


        {/* Admin Button */}
        <div className="text-center">
          <Button asChild variant="outline" className="bg-primary/10 border-primary/20 hover:bg-primary/20">
            <Link to="/admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin Panel
            </Link>
          </Button>
        </div>
      </div>
    </div>;
}