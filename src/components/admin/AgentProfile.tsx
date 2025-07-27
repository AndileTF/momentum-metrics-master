import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { User, Mail, Users, Calendar, TrendingUp, Phone, MessageSquare, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  agentid: string;
  Agent: string;
  Email: string;
  Profile?: string;
  avatar?: string;
}

interface AgentStats {
  Calls: number;
  "Live Chat": number;
  "Sales Tickets": number;
  "Support/DNS Emails": number;
  "Billing Tickets": number;
  "Social Tickets": number;
  "Walk-Ins": number;
  "Total Issues": number;
  "Helpdesk ticketing": number;
  Date: string;
}

interface AgentPerformance {
  daily: AgentStats[];
  weekly: AgentStats[];
  monthly: AgentStats[];
  teamAverage: {
    totalIssues: number;
    calls: number;
    liveChat: number;
  };
  rank: number;
  totalAgents: number;
}

export function AgentProfile() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [performance, setPerformance] = useState<AgentPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      fetchAgentPerformance(selectedAgent.agentid);
    }
  }, [selectedAgent]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("csr_agent_proflie")
        .select("*")
        .order("Agent");

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast({
        title: "Error",
        description: "Failed to load agents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentPerformance = async (agentId: string) => {
    try {
      const now = new Date();
      
      // Get last 30 days of data
      const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const { data: agentData, error: agentError } = await supabase
        .from("daily_stats")
        .select("*")
        .eq("agentid", agentId)
        .gte("Date", startDate.toISOString().split('T')[0])
        .order("Date", { ascending: false });

      if (agentError) throw agentError;

      // Get team average data from Daily Stats
      const { data: agentTeamData, error: agentTeamError } = await supabase
        .from("daily_stats")
        .select("\"Team Lead Group\"")
        .eq("agentid", agentId)
        .limit(1);

      if (agentTeamError) throw agentTeamError;

      const teamName = agentTeamData?.[0]?.["Team Lead Group"];
      const { data: teamData, error: teamError } = await supabase
        .from("daily_stats")
        .select("*")
        .eq("Team Lead Group", teamName)
        .gte("Date", startDate.toISOString().split('T')[0]);

      if (teamError) throw teamError;

      // Process the data
      const processedData = agentData?.map(record => {
        const calls = Number(record.Calls) || 0;
        const liveChat = Number(record["Live Chat"]) || 0;
        const salesTickets = Number(record["Sales Tickets"]) || 0;
        const supportEmails = Number(record["Support/DNS Emails"]) || 0;
        const billingTickets = Number(record["Billing Tickets"]) || 0;
        const socialTickets = Number(record["Social Tickets"]) || 0;
        const walkIns = Number(record["Walk-Ins"]) || 0;
        
        return {
          ...record,
          Calls: calls,
          "Live Chat": liveChat,
          "Sales Tickets": salesTickets,
          "Support/DNS Emails": supportEmails,
          "Billing Tickets": billingTickets,
          "Social Tickets": socialTickets,
          "Walk-Ins": walkIns,
          "Total Issues": calls + liveChat + salesTickets + supportEmails + billingTickets + socialTickets + walkIns,
          "Helpdesk ticketing": calls + liveChat + salesTickets + supportEmails + billingTickets + socialTickets + walkIns
        };
      }) || [];

      // Calculate team averages
      const teamStats = teamData?.reduce((acc, record) => {
        const calls = Number(record.Calls) || 0;
        const liveChat = Number(record["Live Chat"]) || 0;
        const salesTickets = Number(record["Sales Tickets"]) || 0;
        const supportEmails = Number(record["Support/DNS Emails"]) || 0;
        const billingTickets = Number(record["Billing Tickets"]) || 0;
        const socialTickets = Number(record["Social Tickets"]) || 0;
        const walkIns = Number(record["Walk-Ins"]) || 0;
        
        acc.totalIssues += calls + liveChat + salesTickets + supportEmails + billingTickets + socialTickets + walkIns;
        acc.calls += calls;
        acc.liveChat += liveChat;
        
        return acc;
      }, { totalIssues: 0, calls: 0, liveChat: 0 });

      const teamDays = teamData?.length || 1;
      const teamAverage = {
        totalIssues: Math.round((teamStats?.totalIssues || 0) / teamDays),
        calls: Math.round((teamStats?.calls || 0) / teamDays),
        liveChat: Math.round((teamStats?.liveChat || 0) / teamDays)
      };

      // Get agent rank
      const { data: allAgentsData, error: rankError } = await supabase
        .from("daily_stats")
        .select("Agent, agentid, Calls, \"Live Chat\", \"Sales Tickets\", \"Support/DNS Emails\", \"Billing Tickets\", \"Social Tickets\", \"Walk-Ins\"")
        .gte("Date", new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0]);

      if (rankError) throw rankError;

      // Calculate total issues for each agent today
      const agentTotals: Record<string, number> = {};
      allAgentsData?.forEach(record => {
        const agent = record.Agent;
        if (!agentTotals[agent]) agentTotals[agent] = 0;
        
        const total = Number(record.Calls || 0) + Number(record["Live Chat"] || 0) + 
                     Number(record["Sales Tickets"] || 0) + Number(record["Support/DNS Emails"] || 0) +
                     Number(record["Billing Tickets"] || 0) + Number(record["Social Tickets"] || 0) +
                     Number(record["Walk-Ins"] || 0);
        agentTotals[agent] += total;
      });

      const sortedAgents = Object.entries(agentTotals)
        .sort(([,a], [,b]) => b - a);
      
              const currentAgentName = agentData?.find(d => d.agentid === agentId)?.Agent;
              const rank = sortedAgents.findIndex(([agentName]) => agentName === currentAgentName) + 1;

      setPerformance({
        daily: processedData.slice(0, 1) as any,
        weekly: processedData.slice(0, 7) as any,
        monthly: processedData as any,
        teamAverage,
        rank,
        totalAgents: sortedAgents.length
      });

    } catch (error) {
      console.error("Error fetching agent performance:", error);
      toast({
        title: "Error",
        description: "Failed to load agent performance",
        variant: "destructive"
      });
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.Agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.Email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = (data: AgentStats[]) => {
    return data.reduce((sum, record) => sum + record["Total Issues"], 0);
  };

  const calculateAverage = (data: AgentStats[]) => {
    const total = calculateTotal(data);
    return data.length > 0 ? Math.round(total / data.length * 10) / 10 : 0;
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
      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => (
              <Card
                key={agent.agentid}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedAgent?.agentid === agent.agentid ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${agent.Agent}`} 
                        alt={agent.Agent} 
                      />
                      <AvatarFallback>
                        {agent.Agent.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{agent.Agent}</p>
                      <p className="text-sm text-muted-foreground truncate">{agent.Profile || "Agent"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Details */}
      {selectedAgent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedAgent.Agent}`} 
                    alt={selectedAgent.Agent} 
                  />
                  <AvatarFallback>
                    {selectedAgent.Agent.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedAgent.Agent}</h3>
                  <p className="text-muted-foreground">{selectedAgent.Profile}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedAgent.Email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Agent Profile</span>
                </div>
              </div>

              {performance && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Rank</span>
                    <Badge variant="secondary">
                      #{performance.rank} of {performance.totalAgents}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Summary */}
          {performance && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Daily */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Today
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Issues</span>
                        <span className="font-medium">{calculateTotal(performance.daily)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Calls</span>
                        <span>{performance.daily[0]?.Calls || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Live Chat</span>
                        <span>{performance.daily[0]?.["Live Chat"] || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly */}
                  <div className="space-y-3">
                    <h4 className="font-medium">This Week</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Issues</span>
                        <span className="font-medium">{calculateTotal(performance.weekly)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Daily Average</span>
                        <span>{calculateAverage(performance.weekly)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">vs Team Avg</span>
                        <span className={
                          calculateAverage(performance.weekly) > performance.teamAverage.totalIssues 
                            ? "text-green-600" : "text-red-600"
                        }>
                          {calculateAverage(performance.weekly) > performance.teamAverage.totalIssues ? "+" : ""}
                          {calculateAverage(performance.weekly) - performance.teamAverage.totalIssues}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly */}
                  <div className="space-y-3">
                    <h4 className="font-medium">This Month</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Issues</span>
                        <span className="font-medium">{calculateTotal(performance.monthly)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Daily Average</span>
                        <span>{calculateAverage(performance.monthly)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Days</span>
                        <span>{performance.monthly.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}