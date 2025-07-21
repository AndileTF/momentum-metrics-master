
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Users, Database, Plus, FileSpreadsheet, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ExcelUploader } from "@/components/admin/ExcelUploader";
import { AgentOverview } from "@/components/admin/AgentOverview";
import { ManualDataEntry } from "@/components/admin/ManualDataEntry";
import { Leaderboards } from "@/components/admin/Leaderboards";
import { PerformanceMetrics } from "@/components/admin/PerformanceMetrics";
import { AgentProfile } from "@/components/admin/AgentProfile";
import { UserManagement } from "@/components/admin/UserManagement";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalAgents: number;
  totalRecords: number;
  latestUpload: string | null;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"upload" | "agents" | "manual" | "leaderboards" | "metrics" | "profiles" | "users">("upload");
  const [stats, setStats] = useState<AdminStats>({
    totalAgents: 0,
    totalRecords: 0,
    latestUpload: null
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Get total agents
      const { data: agents, error: agentsError } = await supabase
        .from("Agents")
        .select("agentid");

      if (agentsError) throw agentsError;

      // Get total records and latest upload
      const { data: records, error: recordsError } = await supabase
        .from("Daily Stats")
        .select("Date")
        .order("Date", { ascending: false });

      if (recordsError) throw recordsError;

      setStats({
        totalAgents: agents?.length || 0,
        totalRecords: records?.length || 0,
        latestUpload: records?.[0]?.Date || null
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      toast({
        title: "Error",
        description: "Failed to load admin statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const tabButtons = [
    { id: "upload", label: "Excel Upload", icon: Upload },
    { id: "agents", label: "Agent Overview", icon: Users },
    { id: "manual", label: "Manual Entry", icon: Plus },
    { id: "leaderboards", label: "Leaderboards", icon: Users },
    { id: "metrics", label: "Performance Metrics", icon: Database },
    { id: "profiles", label: "Agent Profiles", icon: Users },
    { id: "users", label: "User Management", icon: Users }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-xl text-muted-foreground">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-background">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <img 
              src="/lovable-uploads/076cdbc1-71db-4395-8d53-3018b3b7e27d.png" 
              alt="Liquid Intelligent Technologies" 
              className="h-12 w-auto"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-liquid bg-clip-text text-transparent">
              ADMIN PANEL
            </h1>
            <p className="text-lg text-muted-foreground">
              Data Management & Agent Administration
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAgents}</p>
                  <p className="text-sm text-muted-foreground">Total Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalRecords}</p>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {stats.latestUpload 
                      ? new Date(stats.latestUpload).toLocaleDateString()
                      : "No uploads yet"
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Latest Upload</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            {tabButtons.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "upload" && (
            <ExcelUploader onUploadComplete={fetchAdminStats} />
          )}
          
          {activeTab === "agents" && (
            <AgentOverview />
          )}
          
          {activeTab === "manual" && (
            <ManualDataEntry onEntryComplete={fetchAdminStats} />
          )}
          
          {activeTab === "leaderboards" && (
            <Leaderboards />
          )}
          
          {activeTab === "metrics" && (
            <PerformanceMetrics />
          )}
          
          {activeTab === "profiles" && (
            <AgentProfile />
          )}
          
          {activeTab === "users" && (
            <UserManagement />
          )}
        </div>
      </div>
    </div>
  );
}
