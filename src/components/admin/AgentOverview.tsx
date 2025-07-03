
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AgentData {
  Agent: string;
  agentid: string;
  Email: string | null;
  Date: string;
  "Total Issues handled": number;
  "Helpdesk ticketing": number;
  Calls: number;
  "Live Chat": number;
  "Support/DNS Emails": number;
  "Social Tickets": number;
  "Billing Tickets": number;
  "Walk-Ins": number;
  Group: string | null;
  "Team Lead Group": string | null;
}

export function AgentOverview() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<keyof AgentData>("Date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    filterAndSortAgents();
  }, [agents, searchTerm, sortBy, sortOrder]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("Daily Stats")
        .select("*")
        .order("Date", { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast({
        title: "Error",
        description: "Failed to load agent data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortAgents = () => {
    let filtered = agents.filter(agent =>
      agent.Agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.Email && agent.Email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredAgents(filtered);
  };

  const handleSort = (column: keyof AgentData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleDelete = async (agent: AgentData) => {
    if (!confirm(`Are you sure you want to delete the record for ${agent.Agent} on ${agent.Date}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("Daily Stats")
        .delete()
        .eq("Agent", agent.Agent)
        .eq("Date", agent.Date);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Record deleted successfully"
      });

      fetchAgents();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
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
          <User className="h-5 w-5" />
          Agent Data Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by agent name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {filteredAgents.length} Records
          </Badge>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("Agent")}
                >
                  Agent {sortBy === "Agent" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("Date")}
                >
                  Date {sortBy === "Date" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("Total Issues handled")}
                >
                  Total Issues {sortBy === "Total Issues handled" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Breakdown</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent, index) => (
                <TableRow key={`${agent.Agent}-${agent.Date}-${index}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{agent.Agent}</p>
                      <p className="text-xs text-muted-foreground">{agent.Email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(agent.Date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {agent["Total Issues handled"]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="space-y-1">
                      <div>Helpdesk: {agent["Helpdesk ticketing"]}</div>
                      <div>Calls: {agent.Calls}</div>
                      <div>Chat: {agent["Live Chat"]}</div>
                      <div>Email: {agent["Support/DNS Emails"]}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>
                      <div>{agent.Group || "N/A"}</div>
                      <div className="text-muted-foreground">{agent["Team Lead Group"] || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(agent)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No agents found matching your search criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
