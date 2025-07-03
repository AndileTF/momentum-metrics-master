
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Mail, MessageSquare, CreditCard, Users, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChannelLeader {
  Agent: string;
  agentid: string;
  value: number;
  channel: string;
}

type TimePeriod = "daily" | "weekly" | "monthly";

interface TopIssueGeneratorsProps {
  timePeriod: TimePeriod;
}

export function TopIssueGenerators({ timePeriod }: TopIssueGeneratorsProps) {
  const [channelLeaders, setChannelLeaders] = useState<ChannelLeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannelLeaders();
  }, [timePeriod]);

  const fetchChannelLeaders = async () => {
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

      // Aggregate data by channel
      const channelAggregates: Record<string, Record<string, number>> = {
        "Helpdesk ticketing": {},
        "Calls": {},
        "Live Chat": {},
        "Support/DNS Emails": {},
        "Social Tickets": {},
        "Billing Tickets": {}
      };

      data?.forEach((record) => {
        const agent = record.Agent;
        
        Object.keys(channelAggregates).forEach((channel) => {
          if (!channelAggregates[channel][agent]) {
            channelAggregates[channel][agent] = 0;
          }
          channelAggregates[channel][agent] += record[channel as keyof typeof record] as number || 0;
        });
      });

      // Find top performer for each channel
      const leaders: ChannelLeader[] = [];
      
      Object.entries(channelAggregates).forEach(([channel, agents]) => {
        const topAgent = Object.entries(agents).reduce((max, [agent, value]) => {
          return value > max.value ? { agent, value } : max;
        }, { agent: "", value: 0 });

        if (topAgent.agent && topAgent.value > 0) {
          leaders.push({
            Agent: topAgent.agent,
            agentid: topAgent.agent.toLowerCase().replace(/\s+/g, '-'),
            value: topAgent.value,
            channel: channel
          });
        }
      });

      setChannelLeaders(leaders);
    } catch (error) {
      console.error("Error fetching channel leaders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "Helpdesk ticketing": return <Phone className="h-5 w-5" />;
      case "Calls": return <Phone className="h-5 w-5" />;
      case "Live Chat": return <MessageCircle className="h-5 w-5" />;
      case "Support/DNS Emails": return <Mail className="h-5 w-5" />;
      case "Social Tickets": return <MessageSquare className="h-5 w-5" />;
      case "Billing Tickets": return <CreditCard className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const getChannelName = (channel: string) => {
    switch (channel) {
      case "Helpdesk ticketing": return "Helpdesk";
      case "Support/DNS Emails": return "Support Emails";
      case "Social Tickets": return "Social";
      case "Billing Tickets": return "Billing";
      default: return channel;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-champion" />
            Top Issue Generators by Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-champion" />
          Top Issue Generators by Channel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channelLeaders.map((leader) => (
            <div
              key={`${leader.channel}-${leader.Agent}`}
              className="p-4 rounded-lg border bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-primary">
                  {getChannelIcon(leader.channel)}
                  <span className="font-medium text-sm">{getChannelName(leader.channel)}</span>
                </div>
                <Crown className="h-4 w-4 text-champion" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{leader.Agent}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-champion/10 text-champion border-champion/20">
                    {leader.value} issues
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {channelLeaders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No data available for the selected time period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
