import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RefreshIndicatorProps {
  refreshing: boolean;
  lastRefresh: Date;
}

export function RefreshIndicator({ refreshing, lastRefresh }: RefreshIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Badge variant="outline" className="flex items-center gap-2">
      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
      {refreshing ? "Refreshing..." : `Updated ${formatTime(lastRefresh)}`}
    </Badge>
  );
}