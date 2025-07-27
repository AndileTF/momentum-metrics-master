
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Trophy, Medal, TrendingUp, User, Calendar, Clock } from "lucide-react";

interface AgentCardProps {
  agent: {
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
  };
  rank: number;
  timePeriod: "daily" | "weekly" | "monthly";
  className?: string;
  style?: React.CSSProperties;
}

export function AgentCard({ agent, rank, timePeriod, className, style }: AgentCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const getRankIcon = () => {
    if (rank === 1) return <Crown className="h-8 w-8 text-champion" />;
    if (rank === 2) return <Trophy className="h-8 w-8 text-primary" />;
    if (rank === 3) return <Medal className="h-8 w-8 text-accent" />;
    return <TrendingUp className="h-6 w-6 text-muted-foreground" />;
  };

  const getRankBadgeColor = () => {
    if (rank === 1) return "bg-champion text-champion-foreground";
    if (rank === 2) return "bg-primary text-primary-foreground";
    if (rank === 3) return "bg-accent text-accent-foreground";
    return "bg-muted text-muted-foreground";
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

  return (
    <Card className={`agent-card ${className}`} style={style}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-full">
            <Badge className={`${getRankBadgeColor()} px-3 py-1`}>
              <span className="flex items-center gap-1">
                {getRankIcon()}
                #{rank}
              </span>
            </Badge>
          </div>
          
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              <AvatarImage 
                src={imageError ? generateAvatar(agent.Agent) : agent.avatar || generateAvatar(agent.Agent)}
                alt={agent.Agent}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                className={imageLoading ? 'opacity-0' : 'opacity-100'}
              />
              <AvatarFallback className="text-lg font-semibold bg-primary/10">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">{agent.Agent}</h3>
            <div className="flex flex-col items-center gap-1">
              <Badge variant="outline" className="text-xl font-bold px-4 py-2">
                {agent["Total Issues handled"]} issues
              </Badge>
              <p className="text-sm text-muted-foreground">
                {agent.Calls} calls • {agent["Live Chat"]} chats
              </p>
            </div>
          </div>

          {timePeriod === "daily" && (agent.latestDate || agent.Date) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(agent.latestDate || agent.Date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
