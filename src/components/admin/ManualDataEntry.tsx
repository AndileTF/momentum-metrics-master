
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ManualDataEntryProps {
  onEntryComplete: () => void;
}

interface FormData {
  Agent: string;
  Email: string;
  Date: string;
  "Helpdesk ticketing": number;
  Calls: number;
  "Live Chat": number;
  "Support/DNS Emails": number;
  "Social Tickets": number;
  "Billing Tickets": number;
  "Walk-Ins": number;
  Group: string;
  "Team Lead Group": string;
}

export function ManualDataEntry({ onEntryComplete }: ManualDataEntryProps) {
  const [formData, setFormData] = useState<FormData>({
    Agent: "",
    Email: "",
    Date: new Date().toISOString().split('T')[0],
    "Helpdesk ticketing": 0,
    Calls: 0,
    "Live Chat": 0,
    "Support/DNS Emails": 0,
    "Social Tickets": 0,
    "Billing Tickets": 0,
    "Walk-Ins": 0,
    Group: "",
    "Team Lead Group": ""
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Agent.trim()) {
      toast({
        title: "Error",
        description: "Agent name is required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const agentid = formData.Agent.toLowerCase().replace(/\s+/g, '-');
      const totalIssues = formData["Helpdesk ticketing"] + 
                         formData.Calls + 
                         formData["Live Chat"] + 
                         formData["Support/DNS Emails"] + 
                         formData["Social Tickets"] + 
                         formData["Billing Tickets"] + 
                         formData["Walk-Ins"];

      const { error } = (await supabase
        .from("daily_stats")
        .insert({
          Agent: formData.Agent,
          agentid: agentid,
          Email: formData.Email || null,
          Date: formData.Date,
          "Helpdesk ticketing": formData["Helpdesk ticketing"],
          Calls: formData.Calls,
          "Live Chat": formData["Live Chat"],
          "Support/DNS Emails": formData["Support/DNS Emails"],
          "Social Tickets": formData["Social Tickets"],
          "Billing Tickets": formData["Billing Tickets"],
          "Walk-Ins": formData["Walk-Ins"],
          "Total Issues handled": totalIssues,
          Group: formData.Group || null,
          "Team Lead Group": formData["Team Lead Group"] || null
        }) as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Data entry completed successfully"
      });

      // Reset form
      setFormData({
        Agent: "",
        Email: "",
        Date: new Date().toISOString().split('T')[0],
        "Helpdesk ticketing": 0,
        Calls: 0,
        "Live Chat": 0,
        "Support/DNS Emails": 0,
        "Social Tickets": 0,
        "Billing Tickets": 0,
        "Walk-Ins": 0,
        Group: "",
        "Team Lead Group": ""
      });

      onEntryComplete();
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error",
        description: "Failed to save data entry",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Manual Data Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="agent">Agent Name *</Label>
              <Input
                id="agent"
                value={formData.Agent}
                onChange={(e) => handleInputChange("Agent", e.target.value)}
                placeholder="Enter agent name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.Email}
                onChange={(e) => handleInputChange("Email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.Date}
                onChange={(e) => handleInputChange("Date", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="group">Group</Label>
              <Input
                id="group"
                value={formData.Group}
                onChange={(e) => handleInputChange("Group", e.target.value)}
                placeholder="Enter group"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="teamlead">Team Lead Group</Label>
            <Input
              id="teamlead"
              value={formData["Team Lead Group"]}
              onChange={(e) => handleInputChange("Team Lead Group", e.target.value)}
              placeholder="Enter team lead group"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Issue Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="helpdesk">Helpdesk Ticketing</Label>
                <Input
                  id="helpdesk"
                  type="number"
                  min="0"
                  value={formData["Helpdesk ticketing"]}
                  onChange={(e) => handleInputChange("Helpdesk ticketing", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="calls">Calls</Label>
                <Input
                  id="calls"
                  type="number"
                  min="0"
                  value={formData.Calls}
                  onChange={(e) => handleInputChange("Calls", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="livechat">Live Chat</Label>
                <Input
                  id="livechat"
                  type="number"
                  min="0"
                  value={formData["Live Chat"]}
                  onChange={(e) => handleInputChange("Live Chat", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="supportemail">Support/DNS Emails</Label>
                <Input
                  id="supportemail"
                  type="number"
                  min="0"
                  value={formData["Support/DNS Emails"]}
                  onChange={(e) => handleInputChange("Support/DNS Emails", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="social">Social Tickets</Label>
                <Input
                  id="social"
                  type="number"
                  min="0"
                  value={formData["Social Tickets"]}
                  onChange={(e) => handleInputChange("Social Tickets", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="billing">Billing Tickets</Label>
                <Input
                  id="billing"
                  type="number"
                  min="0"
                  value={formData["Billing Tickets"]}
                  onChange={(e) => handleInputChange("Billing Tickets", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="walkins">Walk-Ins</Label>
                <Input
                  id="walkins"
                  type="number"
                  min="0"
                  value={formData["Walk-Ins"]}
                  onChange={(e) => handleInputChange("Walk-Ins", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              Total Issues: {
                formData["Helpdesk ticketing"] + 
                formData.Calls + 
                formData["Live Chat"] + 
                formData["Support/DNS Emails"] + 
                formData["Social Tickets"] + 
                formData["Billing Tickets"] + 
                formData["Walk-Ins"]
              }
            </p>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Entry
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
