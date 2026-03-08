import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ExternalLink, Globe, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Site = {
  id: string;
  domain: string;
  name: string | null;
  created_at: string;
};

const SitesTab = () => {
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [siteName, setSiteName] = useState("");
  const [adding, setAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const fetchSites = async () => {
    const { data, error } = await supabase
      .from("sites")
      .select("id, domain, name, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load sites");
    } else {
      setSites(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSites(); }, []);

  useEffect(() => {
    if (!user) return;
    // Check if user is admin — admins skip email verification
    const checkVerification = async () => {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (roleData) {
        setEmailVerified(true);
        return;
      }

      // Refresh session to get latest email_confirmed_at from server
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      const confirmed = freshUser?.email_confirmed_at;
      const created = freshUser?.created_at;
      if (confirmed && created) {
        const confirmedAt = new Date(confirmed).getTime();
        const createdAt = new Date(created).getTime();
        const wasAutoConfirmed = Math.abs(confirmedAt - createdAt) < 2000;
        setEmailVerified(!wasAutoConfirmed);
      } else {
        setEmailVerified(false);
      }
    };
    checkVerification();
  }, [user]);

  const cleanDomain = (d: string) => d.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const handleAddSiteClick = () => {
    if (!emailVerified) {
      setVerifyDialogOpen(true);
      return;
    }
    setDialogOpen(true);
  };

  const handleResendConfirmation = async () => {
    if (!user?.email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
    setResending(false);
    if (error) {
      toast.error("Failed to send confirmation email. Please try again.");
    } else {
      toast.success("Confirmation email sent! Check your inbox.");
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    const cleaned = cleanDomain(domain);
    const { error } = await supabase.from("sites").insert({
      domain: cleaned,
      name: siteName || null,
      user_id: user.id,
    });
    setAdding(false);
    if (error) {
      if (error.code === "23505") toast.error("This domain is already registered");
      else toast.error(error.message);
    } else {
      toast.success("Site added!");
      setDomain("");
      setSiteName("");
      setDialogOpen(false);
      fetchSites();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Websites</h1>
          <p className="mt-1 text-sm text-foreground/50">Manage and monitor your tracked websites</p>
        </div>
        <Button className="gap-2 rounded-full px-5 h-10 self-start" onClick={handleAddSiteClick}>
          <Plus className="h-4 w-4" />
          Add website
        </Button>
      </div>

      {/* Email verification banner */}
      {!emailVerified && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/5">
          <Mail className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm">Verify your email to add websites</p>
            <p className="text-xs text-foreground/50 mt-0.5">
              Check your inbox for the confirmation link
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 rounded-full h-8 text-xs" onClick={handleResendConfirmation} disabled={resending}>
            {resending ? "Sending..." : "Resend"}
          </Button>
        </div>
      )}

      {/* Verify email dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Verify Your Email
            </DialogTitle>
            <DialogDescription>
              Email verification is required before you can add websites.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-foreground/60">
              We sent a confirmation email to <strong className="text-foreground">{user?.email}</strong>.
              Click the link in that email to verify your account.
            </p>
            <Button onClick={handleResendConfirmation} disabled={resending} className="w-full gap-2 rounded-full">
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {resending ? "Sending..." : "Resend Confirmation Email"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Already verified? Try refreshing the page.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add site dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a new website</DialogTitle>
            <DialogDescription>Enter your website domain to start tracking analytics.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSite} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input id="domain" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteName">Display name <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input id="siteName" placeholder="My Website" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="h-10" />
            </div>
            <Button type="submit" className="w-full rounded-full h-10" disabled={adding}>
              {adding ? "Adding..." : "Add website"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sites grid */}
      {sites.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Globe className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold text-foreground">No websites yet</h3>
            <p className="mb-6 text-sm text-foreground/50 text-center max-w-xs">
              Add your first website to start tracking privacy-friendly analytics
            </p>
            <Button className="gap-2 rounded-full px-6" onClick={handleAddSiteClick}>
              <Plus className="h-4 w-4" />
              Add your first website
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card
              key={site.id}
              className="group cursor-pointer transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              onClick={() => navigate(`/sites/${site.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                  {site.name || site.domain}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs">
                  <ExternalLink className="h-3 w-3" />
                  {site.domain}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-foreground/40">
                  Added {new Date(site.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SitesTab;
