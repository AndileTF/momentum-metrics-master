import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Trophy, Medal, TrendingUp, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AgentCard } from "./AgentCard";
import { RefreshIndicator } from "./RefreshIndicator";

type TimePeriod = "daily" | "weekly" | "monthly";

interface AgentStats {
  Agent: string;
  agentid: string;
  "Total Issues handled": number;
  "Helpdesk ticketing": number;
  Calls: number;
  "Live Chat": number;
  Email: string;
  "Support/DNS Emails": string;
  "Social Tickets": string;
  "Billing Tickets": string;
  "Walk-Ins": string;
  Date: string;
  rank: number;
}

export function Dashboard() {
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAgentStats = async (period: TimePeriod) => {
    try {
      setRefreshing(true);
      
      let query = supabase
        .from("Daily Stats")
        .select("*");

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
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      const { data, error } = await query.gte("Date", startDate.toISOString().split('T')[0]);

      if (error) {
        console.error("Error fetching agent stats:", error);
        return;
      }

      // Aggregate data by agent for weekly/monthly views
      const aggregatedData: Record<string, Omit<AgentStats, 'rank'>> = {};
      
      data?.forEach((record) => {
        const agent = record.Agent;
        if (!aggregatedData[agent]) {
          aggregatedData[agent] = {
            ...record,
            "Total Issues handled": 0,
            "Helpdesk ticketing": 0,
            Calls: 0,
            "Live Chat": 0,
          };
        }
        
        aggregatedData[agent]["Total Issues handled"] += record["Total Issues handled"] || 0;
        aggregatedData[agent]["Helpdesk ticketing"] += record["Helpdesk ticketing"] || 0;
        aggregatedData[agent].Calls += record.Calls || 0;
        aggregatedData[agent]["Live Chat"] += record["Live Chat"] || 0;
      });

      // Convert to array and sort by total issues
      const sortedAgents = Object.values(aggregatedData)
        .sort((a, b) => (b["Total Issues handled"] || 0) - (a["Total Issues handled"] || 0))
        .slice(0, 10)
        .map((agent, index) => ({ ...agent, rank: index + 1 }));

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
      case "daily": return "Today";
      case "weekly": return "This Week";
      case "monthly": return "This Month";
    }
  };

  const getStatsIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-champion" />;
    if (rank === 2) return <Trophy className="h-6 w-6 text-primary" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-accent" />;
    return <TrendingUp className="h-5 w-5 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-xl text-muted-foreground">Loading Momentum Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MOMENTUM
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Agent Performance Leaderboard • {getPeriodLabel(timePeriod)}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as TimePeriod[]).map((period) => (
              <Button
                key={period}
                variant={timePeriod === period ? "default" : "outline"}
                onClick={() => setTimePeriod(period)}
                className={`filter-button capitalize ${
                  timePeriod === period ? "active" : ""
                }`}
              >
                {period}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <RefreshIndicator 
              refreshing={refreshing} 
              lastRefresh={lastRefresh}
            />
            <Badge variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {agents.length} Agents
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.slice(0, 3).map((agent, index) => (
            <Card key={agent.agentid} className={`rank-card ${index === 0 ? "rank-1" : ""} p-6`}>
              <div className="flex items-center justify-between">
                <div>
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
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Top Performers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {agents.map((agent, index) => (
              <AgentCard
                key={agent.agentid}
                agent={agent}
                rank={index + 1}
                className="leaderboard-enter"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        </div>

        {/* Auto-refresh Info */}
        <div className="text-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 inline mr-2" />
          Dashboard refreshes automatically every 5 minutes
        </div>
      </div>
    </div>
  );
}