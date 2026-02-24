import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Key, Users, Trash2, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";

type TeamMember = {
  id: string;
  user_id: string;
  site_id: string;
  role: string;
  created_at: string;
  profiles?: { email: string | null; full_name: string | null } | null;
  sites?: { domain: string; name: string | null } | null;
};

type Site = {
  id: string;
  domain: string;
  name: string | null;
};

type Plan = {
  slug: string;
  price_cents: number;
};

const SettingsTab = () => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("viewer");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [inviting, setInviting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const isPaidPlan = currentPlan && currentPlan.price_cents > 0;

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [sitesRes, membersRes, subRes] = await Promise.all([
      supabase.from("sites").select("id, domain, name").eq("user_id", user.id),
      supabase
        .from("site_members")
        .select("id, user_id, site_id, role, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("user_subscriptions")
        .select("plan_id, plans(slug, price_cents)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .single(),
    ]);

    setSites(sitesRes.data || []);
    
    // Get the plan info
    if (subRes.data && subRes.data.plans) {
      const planData = subRes.data.plans as unknown as Plan;
      setCurrentPlan(planData);
    }

    // For each member, fetch profile and site info
    if (membersRes.data && membersRes.data.length > 0) {
      const memberSiteIds = membersRes.data.map((m) => m.site_id);
      const memberUserIds = membersRes.data.map((m) => m.user_id);

      const [profilesRes, memberSitesRes] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name").in("id", memberUserIds),
        supabase.from("sites").select("id, domain, name").in("id", memberSiteIds),
      ]);

      const profilesMap = new Map((profilesRes.data || []).map((p) => [p.id, p]));
      const sitesMap = new Map((memberSitesRes.data || []).map((s) => [s.id, s]));

      const enriched = membersRes.data.map((m) => ({
        ...m,
        profiles: profilesMap.get(m.user_id) || null,
        sites: sitesMap.get(m.site_id) || null,
      }));

      setMembers(enriched);
    } else {
      setMembers([]);
    }

    setLoadingMembers(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedSites.length === 0) {
      toast.error("Please select at least one site");
      return;
    }

    setInviting(true);

    // Look up the user by email
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", inviteEmail)
      .single();

    if (!profileData) {
      toast.error("No user found with that email. They need to sign up first.");
      setInviting(false);
      return;
    }

    if (profileData.id === user.id) {
      toast.error("You cannot invite yourself");
      setInviting(false);
      return;
    }

    // Insert site_members for each selected site
    const inserts = selectedSites.map((siteId) => ({
      site_id: siteId,
      user_id: profileData.id,
      role: inviteRole as "viewer" | "admin",
      invited_by: user.id,
    }));

    const { error } = await supabase.from("site_members").insert(inserts);
    setInviting(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("This user already has access to one or more selected sites");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success(`Invited ${inviteEmail} to ${selectedSites.length} site(s)`);
      setInviteEmail("");
      setSelectedSites([]);
      setInviteDialogOpen(false);
      fetchData();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase.from("site_members").delete().eq("id", memberId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Team member removed");
      fetchData();
    }
  };

  const toggleSite = (siteId: string) => {
    setSelectedSites((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  // Group members by user
  const membersByUser = members.reduce<Record<string, TeamMember[]>>((acc, m) => {
    const key = m.user_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and team</p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5 text-muted-foreground" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? "Updating..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-muted-foreground" />
                Team Members
              </CardTitle>
              <CardDescription>
                {isPaidPlan
                  ? "Invite team members and manage site access"
                  : "Upgrade to a paid plan to add team members"}
              </CardDescription>
            </div>
            {isPaidPlan && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" size="sm">
                    <UserPlus className="h-4 w-4" />
                    Add member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inviteEmail">Email address</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        placeholder="teammate@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        The user must have an existing account
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer — can view analytics</SelectItem>
                          <SelectItem value="admin">Admin — can manage site settings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Select sites to grant access</Label>
                      {sites.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No sites to share. Add a site first.</p>
                      ) : (
                        <div className="space-y-2 rounded-lg border border-border p-3">
                          {sites.map((site) => (
                            <label
                              key={site.id}
                              className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
                            >
                              <Checkbox
                                checked={selectedSites.includes(site.id)}
                                onCheckedChange={() => toggleSite(site.id)}
                              />
                              <span className="text-sm text-foreground">
                                {site.name || site.domain}
                              </span>
                              <span className="text-xs text-muted-foreground">{site.domain}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={inviting || sites.length === 0}>
                      {inviting ? "Inviting..." : "Send invite"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isPaidPlan ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Shield className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="mb-1 font-medium text-foreground">Paid plan required</p>
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro or Max to invite team members
              </p>
            </div>
          ) : loadingMembers ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : Object.keys(membersByUser).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No team members yet. Invite someone to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(membersByUser).map(([userId, userMembers]) => {
                const profile = userMembers[0]?.profiles;
                return (
                  <div key={userId} className="rounded-lg border border-border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {profile?.full_name || profile?.email || "Unknown user"}
                        </p>
                        {profile?.full_name && (
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {userMembers.map((m) => (
                        <div key={m.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">
                              {m.sites?.name || m.sites?.domain || "Unknown site"}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {m.role}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveMember(m.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
