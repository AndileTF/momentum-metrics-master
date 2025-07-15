
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Trophy, Medal, User, Phone, MessageCircle, Mail, MessageSquare, CreditCard, Users, Calendar } from "lucide-react";

interface AgentStats {
  Agent: string;
  agentid: string;
  "Total Issues handled": number;
  "Helpdesk ticketing": number;
  Calls: number;
  "Live Chat": number;
  Email: string;
  "Support/DNS Emails": number | null;
  "Social Tickets": number | null;
  "Billing Tickets": number | null;
  "Walk-Ins": number | null;
  Date: string;
  rank: number;
  latestDate?: string;
  avatar?: string;
}

interface AgentCardProps {
  agent: AgentStats;
  rank: number;
  className?: string;
  style?: React.CSSProperties;
  timePeriod?: "daily" | "weekly" | "monthly";
}

export function AgentCard({ agent, rank, className = "", style, timePeriod = "daily" }: AgentCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const getRankIcon = () => {
    if (rank === 1) return <Crown className="h-5 w-5 lg:h-6 lg:w-6 text-champion" />;
    if (rank === 2) return <Trophy className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />;
    if (rank === 3) return <Medal className="h-5 w-5 lg:h-6 lg:w-6 text-accent" />;
    return null;
  };

  const getRankClass = () => {
    if (rank === 1) return "champion-glow rank-1";
    return "rank-card";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case "helpdesk": return <Phone className="h-4 w-4" />;
      case "calls": return <Phone className="h-4 w-4" />;
      case "chat": return <MessageCircle className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "social": return <MessageSquare className="h-4 w-4" />;
      case "billing": return <CreditCard className="h-4 w-4" />;
      case "walkins": return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <Card
      className={`${getRankClass()} p-4 lg:p-6 xl:p-8 cursor-pointer transition-all duration-300 hover:scale-105 ${className}`}
      style={style}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {!isFlipped ? (
        // Front of card - Optimized for large displays
        <div className="space-y-3 lg:space-y-4">
          {/* Rank and Crown */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getRankIcon()}
              <Badge 
                variant={rank === 1 ? "default" : "outline"}
                className={`text-xs lg:text-sm ${rank === 1 ? "bg-champion text-champion-foreground" : ""}`}
              >
                #{rank}
              </Badge>
            </div>
            {rank === 1 && (
              <div className="text-xs lg:text-sm font-medium text-champion">
                CHAMPION
              </div>
            )}
          </div>

          {/* Avatar - Larger for big displays */}
          <div className="flex justify-center">
            <Avatar className="h-16 w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24 border-2 border-primary">
              <AvatarImage 
                src={agent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.Agent}`}
                onError={(e) => {
                  console.log(`Failed to load avatar for ${agent.Agent}:`, agent.avatar);
                  // Fallback to dicebear on error
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.Agent}`;
                }}
              />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold text-sm lg:text-base xl:text-lg">
                {getInitials(agent.Agent)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Agent Info - Better typography scaling */}
          <div className="text-center space-y-2 lg:space-y-3">
            <h3 className="font-semibold text-base lg:text-lg xl:text-xl">{agent.Agent}</h3>
            <div className="space-y-1 lg:space-y-2">
              <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">
                {agent["Total Issues handled"]}
              </p>
              <p className="text-xs lg:text-sm text-muted-foreground">Total Issues</p>
              {timePeriod === "daily" && (agent.latestDate || agent.Date) && (
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(agent.latestDate || agent.Date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Hover Hint */}
          <div className="text-center text-xs text-muted-foreground opacity-50">
            Click to view breakdown
          </div>
        </div>
      ) : (
        // Back of card - Detailed breakdown with better spacing
        <div className="space-y-3 lg:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm lg:text-base">{agent.Agent}</h3>
            <Badge variant="outline" className="text-xs lg:text-sm">#{rank}</Badge>
          </div>

          {/* Metrics Breakdown - Better spacing */}
          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center justify-between metric-badge rounded-lg p-2 lg:p-3">
              <div className="flex items-center gap-2">
                {getMetricIcon("helpdesk")}
                <span className="text-xs lg:text-sm">Helpdesk</span>
              </div>
              <span className="font-semibold text-sm lg:text-base">{agent["Helpdesk ticketing"] || 0}</span>
            </div>

            <div className="flex items-center justify-between metric-badge rounded-lg p-2 lg:p-3">
              <div className="flex items-center gap-2">
                {getMetricIcon("calls")}
                <span className="text-xs lg:text-sm">Calls</span>
              </div>
              <span className="font-semibold text-sm lg:text-base">{agent.Calls || 0}</span>
            </div>

            <div className="flex items-center justify-between metric-badge rounded-lg p-2 lg:p-3">
              <div className="flex items-center gap-2">
                {getMetricIcon("chat")}
                <span className="text-xs lg:text-sm">Live Chat</span>
              </div>
              <span className="font-semibold text-sm lg:text-base">{agent["Live Chat"] || 0}</span>
            </div>

            <div className="flex items-center justify-between metric-badge rounded-lg p-2 lg:p-3">
              <div className="flex items-center gap-2">
                {getMetricIcon("email")}
                <span className="text-xs lg:text-sm">Support Emails</span>
              </div>
              <span className="font-semibold text-sm lg:text-base">{agent["Support/DNS Emails"] || 0}</span>
            </div>

            <div className="flex items-center justify-between metric-badge rounded-lg p-2 lg:p-3">
              <div className="flex items-center gap-2">
                {getMetricIcon("social")}
                <span className="text-xs lg:text-sm">Social</span>
              </div>
              <span className="font-semibold text-sm lg:text-base">{agent["Social Tickets"] || 0}</span>
            </div>

            <div className="flex items-center justify-between metric-badge rounded-lg p-2 lg:p-3">
              <div className="flex items-center gap-2">
                {getMetricIcon("billing")}
                <span className="text-xs lg:text-sm">Billing</span>
              </div>
              <span className="font-semibold text-sm lg:text-base">{agent["Billing Tickets"] || 0}</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between text-base lg:text-lg font-bold">
              <span>Total Issues</span>
              <span className="text-primary">{agent["Total Issues handled"]}</span>
            </div>
          </div>

          {/* Click hint */}
          <div className="text-center text-xs text-muted-foreground opacity-50">
            Click to go back
          </div>
        </div>
      )}
    </Card>
  );
}
