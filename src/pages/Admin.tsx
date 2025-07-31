import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Users, Database, Plus, FileSpreadsheet, AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ExcelUploader } from "@/components/admin/ExcelUploader";
import { AgentOverview } from "@/components/admin/AgentOverview";
import { ManualDataEntry } from "@/components/admin/ManualDataEntry";
import { Leaderboards } from "@/components/admin/Leaderboards";
import { PerformanceMetrics } from "@/components/admin/PerformanceMetrics";
import { AgentProfile } from "@/components/admin/AgentProfile";
import { UserManagement } from "@/components/admin/UserManagement";
import { OnlineExcelViewer } from "@/components/admin/OnlineExcelViewer";
import { AvatarManagement } from "@/components/admin/AvatarManagement";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalAgents: number;
  totalRecords: number;
  latestUpload: string | null;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"upload" | "agents" | "manual" | "leaderboards" | "metrics" | "profiles" | "users" | "excel" | "avatars">("upload");
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
      // Get total agents from profile table
      const { count: agentCount } = await supabase
        .from('profile')
        .select('*', { count: 'exact', head: true });

      // Get total records from daily_stats table
      const { count: recordCount } = await supabase
        .from('daily_stats')
        .select('*', { count: 'exact', head: true });

      // Get latest upload date from daily_stats
      const { data: latestData } = await supabase
        .from('daily_stats')
        .select('Date')
        .order('Date', { ascending: false })
        .limit(1);

      setStats({
        totalAgents: agentCount || 0,
        totalRecords: recordCount || 0,
        latestUpload: latestData?.[0]?.Date || null
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
    { id: "users", label: "User Management", icon: Users },
    { id: "excel", label: "Online Excel", icon: ExternalLink },
    { id: "avatars", label: "Avatar Management", icon: Upload }
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
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #273c88 0%, #c8187d 100%)' }}>
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
            <h1 className="text-4xl font-bold text-white">
              ADMIN PANEL
            </h1>
            <p className="text-lg text-white/80">
              Data Management & Agent Administration
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-white/20">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalAgents || 0}</p>
                  <p className="text-sm text-white/70">Total Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-white/20">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalRecords || 0}</p>
                  <p className="text-sm text-white/70">Total Records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-white/20">
                  <FileSpreadsheet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {stats.latestUpload 
                      ? new Date(stats.latestUpload).toLocaleDateString()
                      : "No uploads yet"
                    }
                  </p>
                  <p className="text-sm text-white/70">Latest Upload</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-white/20">
                  <ExternalLink className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Button 
                    onClick={() => window.open('/', '_blank')}
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-0 h-auto"
                  >
                    View Dashboard
                  </Button>
                  <p className="text-sm text-white/70">Main Dashboard</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center">
          <div className="flex gap-2 p-1 bg-white/10 backdrop-blur-sm rounded-lg">
            {tabButtons.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center gap-2 ${
                  activeTab === id 
                    ? "bg-white text-[#273c88]" 
                    : "text-white hover:bg-white/20"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
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
              
              {activeTab === "excel" && (
                <OnlineExcelViewer />
              )}
              
              {activeTab === "avatars" && (
                <AvatarManagement />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
