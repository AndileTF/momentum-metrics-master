import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, Trophy, Medal, TrendingUp, User, Calendar, Clock, Phone, MessageSquare, Mail, Users } from "lucide-react";

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
  const [showStats, setShowStats] = useState(false);

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

  const calculateTotalIssues = () => {
    const calls = parseInt(agent.Calls?.toString()) || 0;
    const liveChat = parseInt(agent["Live Chat"]?.toString()) || 0;
    const helpdeskTicketing = parseInt(agent["Helpdesk ticketing"]?.toString()) || 0;
    const supportEmails = parseInt(agent["Support/DNS Emails"]?.toString()) || 0;
    const billingTickets = parseInt(agent["Billing Tickets"]?.toString()) || 0;
    const socialTickets = parseInt(agent["Social Tickets"]?.toString()) || 0;
    const walkIns = parseInt(agent["Walk-Ins"]?.toString()) || 0;
    
    return calls + liveChat + helpdeskTicketing + supportEmails + billingTickets + socialTickets + walkIns;
  };

  const totalIssues = calculateTotalIssues();

  return (
    <Dialog open={showStats} onOpenChange={setShowStats}>
      <DialogTrigger asChild>
        <Card className={`agent-card cursor-pointer hover:shadow-lg transition-shadow ${className}`} style={style}>
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
                <Avatar className="h-32 w-32 border-4 border-primary/20">
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
                    {totalIssues} issues
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {agent.Calls || 0} calls • {agent["Live Chat"] || 0} chats
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
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={agent.avatar || generateAvatar(agent.Agent)} alt={agent.Agent} />
              <AvatarFallback>{getInitials(agent.Agent)}</AvatarFallback>
            </Avatar>
            {agent.Agent} - Detailed Stats
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Phone className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{agent.Calls || 0}</div>
                <div className="text-sm text-muted-foreground">Calls</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{agent["Live Chat"] || 0}</div>
                <div className="text-sm text-muted-foreground">Live Chat</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Mail className="h-8 w-8 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">{agent["Support/DNS Emails"] || 0}</div>
                <div className="text-sm text-muted-foreground">Support Emails</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
                <div className="text-2xl font-bold">{agent["Walk-Ins"] || 0}</div>
                <div className="text-sm text-muted-foreground">Walk-Ins</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Issues Handled:</span>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {totalIssues}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Helpdesk Ticketing:</span>
                  <Badge variant="secondary">{agent["Helpdesk ticketing"] || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Current Rank:</span>
                  <div className="flex items-center gap-2">
                    {getRankIcon()}
                    <span className="font-semibold">#{rank}</span>
                  </div>
                </div>
                {agent.Email && (
                  <div className="flex justify-between items-center">
                    <span>Email:</span>
                    <span className="text-sm text-muted-foreground">{agent.Email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ticket Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Billing Tickets:</span>
                  <span>{agent["Billing Tickets"] || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Social Tickets:</span>
                  <span>{agent["Social Tickets"] || 0}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Time Period</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm capitalize">{timePeriod} Performance</p>
                {(agent.latestDate || agent.Date) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {new Date(agent.latestDate || agent.Date).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
