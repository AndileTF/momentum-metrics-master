
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Users, Building, Calendar, TrendingUp, Phone, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AgentDetails {
  agentid: string;
  Agent: string;
  Email: string;
  Profile: string;
  Employment_Group?: string;
  team_lead_name?: string;
  contract_type?: string;
  avatar?: string;
  role?: string;
  gender?: string;
  post?: string;
  department?: string;
}

interface AgentStats {
  Agent: string;
  agentid: string;
  "Total Issues": number;
  Calls: number;
  "Live Chat": number;
  "Sales Tickets": number;
  "Support/DNS Emails": number;
  "Billing Tickets": number;
  "Social Tickets": number;
  "Walk-Ins": number;
  Date: string;
  "Team Lead Group": string;
}

export function AgentProfile() {
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [agents, setAgents] = useState<AgentDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

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
    }
  };

  const fetchAgentProfile = async (agentId: string) => {
    try {
      setLoading(true);

      // Get agent details from csr_agent_proflie
      const { data: agentData, error: agentError } = await supabase
        .from("csr_agent_proflie")
        .select("*")
        .eq("agentid", agentId)
        .single();

      if (agentError) throw agentError;

      // Get additional profile information
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("agentid", agentId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Profile error:", profileError);
      }

      // Merge the data
      const combinedData = {
        ...agentData,
        ...profileData,
        // Prioritize agentData fields over profileData
        Agent: agentData.Agent || profileData?.name,
        Email: agentData.Email || profileData?.email,
      };

      setAgentDetails(combinedData);
      await fetchAgentStats(agentId);

    } catch (error) {
      console.error("Error fetching agent profile:", error);
      toast({
        title: "Error",
        description: "Failed to load agent profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentStats = async (agentId: string) => {
    try {
      setStatsLoading(true);

      const { data, error } = await supabase
        .from("daily_stats")
        .select("*")
        .eq("agentid", agentId)
        .order("Date", { ascending: false })
        .limit(30);

      if (error) throw error;

      const statsWithTotal = data?.map(record => {
        const calls = parseInt(record.Calls?.toString()) || 0;
        const liveChat = parseInt(record["Live Chat"]?.toString()) || 0;
        const salesTickets = parseInt(record["Sales Tickets"]?.toString()) || 0;
        const supportEmails = parseInt(record["Support/DNS Emails"]?.toString()) || 0;
        const billingTickets = parseInt(record["Billing Tickets"]?.toString()) || 0;
        const socialTickets = parseInt(record["Social Tickets"]?.toString()) || 0;
        const walkIns = parseInt(record["Walk-Ins"]?.toString()) || 0;

        return {
          ...record,
          "Total Issues": calls + liveChat + salesTickets + supportEmails + billingTickets + socialTickets + walkIns,
          Calls: calls,
          "Live Chat": liveChat,
          "Sales Tickets": salesTickets,
          "Support/DNS Emails": supportEmails,
          "Billing Tickets": billingTickets,
          "Social Tickets": socialTickets,
          "Walk-Ins": walkIns,
        };
      }) || [];

      setAgentStats(statsWithTotal);
    } catch (error) {
      console.error("Error fetching agent stats:", error);
      toast({
        title: "Error",
        description: "Failed to load agent statistics",
        variant: "destructive"
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const getTotalStats = () => {
    return agentStats.reduce((acc, stat) => ({
      totalIssues: acc.totalIssues + stat["Total Issues"],
      totalCalls: acc.totalCalls + stat.Calls,
      totalLiveChat: acc.totalLiveChat + stat["Live Chat"],
      totalSalesTickets: acc.totalSalesTickets + stat["Sales Tickets"],
      totalSupportEmails: acc.totalSupportEmails + stat["Support/DNS Emails"],
    }), {
      totalIssues: 0,
      totalCalls: 0,
      totalLiveChat: 0,
      totalSalesTickets: 0,
      totalSupportEmails: 0,
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const generateAvatar = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const initials = getInitials(name);
    const colorIndex = name.length % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="${backgroundColor}"/>
        <text x="60" y="75" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
              text-anchor="middle" fill="white">${initials}</text>
      </svg>`
    )}`;
  };

  const totalStats = getTotalStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Agent Profiles</h2>
      </div>

      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="agent-select">Choose Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger id="agent-select">
                  <SelectValue placeholder="Select an agent to view profile" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.agentid} value={agent.agentid}>
                      {agent.Agent} - {agent.Email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => selectedAgent && fetchAgentProfile(selectedAgent)}
              disabled={!selectedAgent || loading}
            >
              {loading ? "Loading..." : "Load Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent Profile Details */}
      {agentDetails && (
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="stats">Performance Stats</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Agent Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Avatar and Basic Info */}
                  <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="h-32 w-32">
                        <AvatarImage 
                          src={agentDetails.avatar || generateAvatar(agentDetails.Agent)} 
                          alt={agentDetails.Agent}
                        />
                        <AvatarFallback className="text-2xl">
                          {getInitials(agentDetails.Agent)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <h3 className="text-xl font-semibold">{agentDetails.Agent}</h3>
                        <p className="text-muted-foreground">{agentDetails.Profile}</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Personal Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <span>{agentDetails.Email}</span>
                      </div>
                      {agentDetails.gender && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Gender:</span>
                          <span>{agentDetails.gender}</span>
                        </div>
                      )}
                      {agentDetails.post && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Position:</span>
                          <span>{agentDetails.post}</span>
                        </div>
                      )}
                      {agentDetails.department && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Department:</span>
                          <span>{agentDetails.department}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Employment Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Employment Details</h4>
                    <div className="space-y-3">
                      {agentDetails.team_lead_name && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Team Lead:</span>
                          <Badge variant="outline">{agentDetails.team_lead_name}</Badge>
                        </div>
                      )}
                      {agentDetails.Employment_Group && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Employment Group:</span>
                          <span>{agentDetails.Employment_Group}</span>
                        </div>
                      )}
                      {agentDetails.contract_type && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Contract Type:</span>
                          <Badge variant="secondary">{agentDetails.contract_type}</Badge>
                        </div>
                      )}
                      {agentDetails.role && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Role:</span>
                          <Badge variant="default">{agentDetails.role}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Statistics (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">{totalStats.totalIssues}</div>
                          <div className="text-sm text-muted-foreground">Total Issues</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">{totalStats.totalCalls}</div>
                          <div className="text-sm text-muted-foreground">Calls</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">{totalStats.totalLiveChat}</div>
                          <div className="text-sm text-muted-foreground">Live Chat</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">{totalStats.totalSalesTickets}</div>
                          <div className="text-sm text-muted-foreground">Sales Tickets</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">{totalStats.totalSupportEmails}</div>
                          <div className="text-sm text-muted-foreground">Support Emails</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Daily Stats Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 p-2 text-left">Date</th>
                            <th className="border border-gray-200 p-2 text-left">Total Issues</th>
                            <th className="border border-gray-200 p-2 text-left">Calls</th>
                            <th className="border border-gray-200 p-2 text-left">Live Chat</th>
                            <th className="border border-gray-200 p-2 text-left">Sales</th>
                            <th className="border border-gray-200 p-2 text-left">Support</th>
                          </tr>
                        </thead>
                        <tbody>
                          {agentStats.map((stat, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-200 p-2">
                                {new Date(stat.Date).toLocaleDateString()}
                              </td>
                              <td className="border border-gray-200 p-2">
                                <Badge variant="secondary">{stat["Total Issues"]}</Badge>
                              </td>
                              <td className="border border-gray-200 p-2">{stat.Calls}</td>
                              <td className="border border-gray-200 p-2">{stat["Live Chat"]}</td>
                              <td className="border border-gray-200 p-2">{stat["Sales Tickets"]}</td>
                              <td className="border border-gray-200 p-2">{stat["Support/DNS Emails"]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Agent Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Quick Facts</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-medium">{agentDetails.Agent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Team Lead:</span>
                        <span className="font-medium">{agentDetails.team_lead_name || 'Not assigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Department:</span>
                        <span className="font-medium">{agentDetails.department || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contract Type:</span>
                        <span className="font-medium">{agentDetails.contract_type || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Performance Overview</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Issues Handled:</span>
                        <Badge variant="secondary">{totalStats.totalIssues}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Average per Day:</span>
                        <span className="font-medium">
                          {agentStats.length > 0 ? (totalStats.totalIssues / agentStats.length).toFixed(1) : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Days with Data:</span>
                        <span className="font-medium">{agentStats.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
