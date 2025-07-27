import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, UserPlus, Edit, Trash2, Shield, Search, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  agentid: string;
  Agent: string;
  Email: string;
  Profile?: string;
  avatar?: string;
  role?: "Admin" | "Team Lead" | "Agent";
  status?: "Active" | "Inactive" | "Pending";
  lastLogin?: string;
}

interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
  last_sign_in_at?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<string[]>([]);
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    Agent: "",
    Email: "",
    Profile: "",
    role: "Agent" as const
  });

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("csr_agent_proflie")
        .select("*")
        .order("Agent");

      if (error) throw error;

      // Get user roles from auth
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      
      const usersWithRoles = data?.map(user => {
        const authUser = authUsers?.users.find((au: any) => au.email === user.Email);
        return {
          ...user,
          Agent: user.Agent || "",
          Email: user.Email || "",
          Profile: user.Profile || "",
          role: "Agent" as "Admin" | "Team Lead" | "Agent",
          status: authUser ? "Active" : "Pending" as "Active" | "Inactive" | "Pending",
          lastLogin: authUser?.last_sign_in_at || null
        };
      }) || [];

      setUsers(usersWithRoles);

      // Get teams from daily stats
      const { data: teamData } = await supabase
        .from("daily_stats")
        .select("Team Lead Group")
        .not("Team Lead Group", "is", null);
      
      const uniqueTeams = [...new Set(teamData?.map((record: any) => record["Team Lead Group"]) || [])] as string[];
      setTeams(uniqueTeams);

    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      // Get all auth users
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      
      // Get users who don't have roles assigned
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("user_id");

      const assignedUserIds = userRoles?.map(ur => ur.user_id) || [];
      
      const pending = authUsers?.users.filter((user: any) => 
        !assignedUserIds.includes(user.id) && 
        user.email_confirmed_at // Only show confirmed users
      ).map((user: any) => ({
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      })) || [];

      setPendingUsers(pending);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    }
  };

  const handleApproveUser = async (userId: string, email: string, role: "admin" | "manager" | "agent" = "agent") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert([{
          user_id: userId,
          role: role
        }]);

      if (error) throw error;

      // Also create a profile entry if it doesn't exist
      const { error: profileError } = await supabase
        .from("csr_agent_proflie")
        .upsert([{
          Email: email,
          Agent: email.split('@')[0], // Use email prefix as default name
          Profile: "Agent"
        }]);

      if (profileError) console.error("Profile creation error:", profileError);

      toast({
        title: "Success",
        description: `User approved with ${role} role`
      });

      fetchUsers();
      fetchPendingUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive"
      });
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User access rejected"
      });

      fetchPendingUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive"
      });
    }
  };

  const handleCreateUser = async () => {
    try {
      const { error } = await supabase
        .from("csr_agent_proflie")
        .insert([{
          Agent: newUser.Agent,
          Email: newUser.Email,
          Profile: newUser.Profile
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User created successfully"
      });

      setIsCreateDialogOpen(false);
      setNewUser({
        Agent: "",
        Email: "",
        Profile: "",
        role: "Agent"
      });
      fetchUsers();

    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from("csr_agent_proflie")
        .update({
          Agent: editingUser.Agent,
          Email: editingUser.Email,
          Profile: editingUser.Profile
        })
        .eq("agentid", editingUser.agentid);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully"
      });

      setEditingUser(null);
      fetchUsers();

    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("csr_agent_proflie")
        .delete()
        .eq("agentid", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully"
      });

      fetchUsers();

    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.Agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.Email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin": return "destructive";
      case "Team Lead": return "default";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.Agent}
                  onChange={(e) => setNewUser({ ...newUser, Agent: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.Email}
                  onChange={(e) => setNewUser({ ...newUser, Email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="profile">Profile</Label>
                <Input
                  id="profile"
                  value={newUser.Profile}
                  onChange={(e) => setNewUser({ ...newUser, Profile: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateUser} className="w-full">
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Pending Approvals ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Registered: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveUser(user.id, user.email, "agent")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve as Agent
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveUser(user.id, user.email, "manager")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Approve as Manager
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectUser(user.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Team Lead">Team Lead</SelectItem>
                <SelectItem value="Agent">Agent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.agentid}>
                    <TableCell className="font-medium">{user.Agent}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role!)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          user.status === "Active" ? "default" : 
                          user.status === "Pending" ? "secondary" : "destructive"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={editingUser?.agentid === user.agentid} onOpenChange={(open) => !open && setEditingUser(null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            {editingUser && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-name">Full Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={editingUser.Agent}
                                    onChange={(e) => setEditingUser({ ...editingUser, Agent: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-email">Email</Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    value={editingUser.Email}
                                    onChange={(e) => setEditingUser({ ...editingUser, Email: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-profile">Profile</Label>
                                  <Input
                                    id="edit-profile"
                                    value={editingUser.Profile}
                                    onChange={(e) => setEditingUser({ ...editingUser, Profile: e.target.value })}
                                  />
                                </div>
                                <Button onClick={handleUpdateUser} className="w-full">
                                  Update User
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.Agent}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.agentid)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
