import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

type Site = { id: string; domain: string; name: string | null };
type Plan = { slug: string; price_cents: number };

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

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    if (!user) return;
    const [sitesRes, membersRes, subRes] = await Promise.all([
      supabase.from("sites").select("id, domain, name").eq("user_id", user.id),
      supabase.from("site_members").select("id, user_id, site_id, role, created_at").order("created_at", { ascending: false }),
      supabase.from("user_subscriptions").select("plan_id, plans(slug, price_cents)").eq("user_id", user.id).eq("status", "active").limit(1).single(),
    ]);
    setSites(sitesRes.data || []);
    if (subRes.data?.plans) setCurrentPlan(subRes.data.plans as unknown as Plan);
    if (membersRes.data?.length) {
      const memberSiteIds = membersRes.data.map((m) => m.site_id);
      const memberUserIds = membersRes.data.map((m) => m.user_id);
      const [profilesRes, memberSitesRes] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name").in("id", memberUserIds),
        supabase.from("sites").select("id, domain, name").in("id", memberSiteIds),
      ]);
      const profilesMap = new Map((profilesRes.data || []).map((p) => [p.id, p]));
      const sitesMap = new Map((memberSitesRes.data || []).map((s) => [s.id, s]));
      setMembers(membersRes.data.map((m) => ({ ...m, profiles: profilesMap.get(m.user_id) || null, sites: sitesMap.get(m.site_id) || null })));
    } else {
      setMembers([]);
    }
    setLoadingMembers(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setNewPassword(""); setConfirmPassword(""); }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedSites.length === 0) { toast.error("Select at least one site"); return; }
    setInviting(true);
    const { data: profileData } = await supabase.from("profiles").select("id").eq("email", inviteEmail).single();
    if (!profileData) { toast.error("No user found. They need to sign up first."); setInviting(false); return; }
    if (profileData.id === user.id) { toast.error("You cannot invite yourself"); setInviting(false); return; }
    const inserts = selectedSites.map((siteId) => ({ site_id: siteId, user_id: profileData.id, role: inviteRole as "viewer" | "admin", invited_by: user.id }));
    const { error } = await supabase.from("site_members").insert(inserts);
    setInviting(false);
    if (error) { toast.error(error.code === "23505" ? "User already has access" : error.message); }
    else { toast.success(`Invited ${inviteEmail}`); setInviteEmail(""); setSelectedSites([]); setInviteDialogOpen(false); fetchData(); }
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase.from("site_members").delete().eq("id", memberId);
    if (error) toast.error(error.message);
    else { toast.success("Member removed"); fetchData(); }
  };

  const toggleSite = (siteId: string) => {
    setSelectedSites((prev) => prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]);
  };

  const membersByUser = members.reduce<Record<string, TeamMember[]>>((acc, m) => {
    (acc[m.user_id] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-foreground/50">Manage your account and team</p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Key className="h-4 w-4 text-foreground/60" />
            </div>
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required className="h-10" />
            </div>
            <Button type="submit" disabled={changingPassword} className="rounded-full">
              {changingPassword ? "Updating..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Users className="h-4 w-4 text-foreground/60" />
                </div>
                Team Members
              </CardTitle>
              <CardDescription className="mt-1">
                {isPaidPlan ? "Invite team members and manage access" : "Upgrade to a paid plan to add team members"}
              </CardDescription>
            </div>
            {isPaidPlan && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 rounded-full self-start" size="sm">
                    <UserPlus className="h-4 w-4" />
                    Add member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>Add someone to your analytics team</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInvite} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="inviteEmail">Email address</Label>
                      <Input id="inviteEmail" type="email" placeholder="teammate@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required className="h-10" />
                      <p className="text-xs text-foreground/40">The user must have an existing account</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer — can view analytics</SelectItem>
                          <SelectItem value="admin">Admin — can manage settings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Select sites</Label>
                      {sites.length === 0 ? (
                        <p className="text-sm text-foreground/40">No sites yet. Add a site first.</p>
                      ) : (
                        <div className="space-y-1 rounded-xl border border-border p-2">
                          {sites.map((site) => (
                            <label key={site.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50">
                              <Checkbox checked={selectedSites.includes(site.id)} onCheckedChange={() => toggleSite(site.id)} />
                              <span className="text-sm text-foreground">{site.name || site.domain}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full rounded-full" disabled={inviting || sites.length === 0}>
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
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Shield className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="mb-1 font-medium text-foreground">Paid plan required</p>
              <p className="text-sm text-foreground/40">Upgrade to Pro or Max to invite team members</p>
            </div>
          ) : loadingMembers ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : Object.keys(membersByUser).length === 0 ? (
            <p className="py-8 text-center text-sm text-foreground/40">
              No team members yet. Invite someone to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(membersByUser).map(([userId, userMembers]) => {
                const profile = userMembers[0]?.profiles;
                return (
                  <div key={userId} className="rounded-xl border border-border p-4">
                    <div className="mb-3">
                      <p className="font-medium text-foreground text-sm">{profile?.full_name || profile?.email || "Unknown"}</p>
                      {profile?.full_name && <p className="text-xs text-foreground/40">{profile.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                      {userMembers.map((m) => (
                        <div key={m.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">{m.sites?.name || m.sites?.domain || "Unknown"}</span>
                            <Badge variant="outline" className="text-xs">{m.role}</Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRemoveMember(m.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
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
