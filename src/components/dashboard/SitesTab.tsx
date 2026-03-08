import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ExternalLink, Globe, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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

  useEffect(() => {
    fetchSites();
  }, []);

  // Check email verification status
  useEffect(() => {
    if (!user) return;
    // With auto-confirm, email_confirmed_at is set immediately.
    // We check user_metadata or use a custom check.
    // Since auto-confirm is on, we'll check if user has confirmed via the
    // confirmation email by looking at email_confirmed_at timestamp vs created_at.
    // If they were confirmed within 1 second of creation, it was auto-confirmed.
    const confirmed = user.email_confirmed_at;
    const created = user.created_at;
    if (confirmed && created) {
      const confirmedAt = new Date(confirmed).getTime();
      const createdAt = new Date(created).getTime();
      // If confirmed within 2 seconds of creation, it was auto-confirm (not manual)
      const wasAutoConfirmed = Math.abs(confirmedAt - createdAt) < 2000;
      setEmailVerified(!wasAutoConfirmed);
    } else {
      setEmailVerified(false);
    }
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
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });
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
      if (error.code === "23505") {
        toast.error("This domain is already registered");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Site added!");
      setDomain("");
      setSiteName("");
      setDialogOpen(false);
      fetchSites();
    }
  };

  const resetDialog = (open: boolean) => {
    setDialogOpen(open);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Websites</h1>
            <p className="text-muted-foreground">Manage your tracked websites</p>
          </div>

          {/* Verify email dialog */}
          <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Verify Your Email
                </DialogTitle>
                <DialogDescription>
                  You need to verify your email address before adding websites.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-foreground/70">
                  We sent a confirmation email to <strong>{user?.email}</strong>. 
                  Click the link in that email to verify your account, then come back to add your first site.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleResendConfirmation}
                    disabled={resending}
                    className="w-full gap-2"
                  >
                    {resending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {resending ? "Sending..." : "Resend Confirmation Email"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Already verified? Try refreshing the page.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add site dialog */}
          <Dialog open={dialogOpen} onOpenChange={resetDialog}>
            <Button className="gap-2" onClick={handleAddSiteClick}>
              <Plus className="h-4 w-4" />
              Add website
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new website</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteName">Display name (optional)</Label>
                  <Input
                    id="siteName"
                    placeholder="My Website"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={adding}>
                  {adding ? "Adding..." : "Add website"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Email verification banner */}
        {!emailVerified && (
          <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
            <CardContent className="flex items-center gap-3 py-4">
              <Mail className="h-5 w-5 shrink-0 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Email verification required</p>
                <p className="text-xs text-muted-foreground">
                  Verify your email to start adding websites and tracking analytics.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleResendConfirmation} disabled={resending}>
                {resending ? "Sending..." : "Resend"}
              </Button>
            </CardContent>
          </Card>
        )}

        {sites.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No websites yet</h3>
              <p className="mb-6 text-sm text-foreground/60">Add your first website to start tracking analytics</p>
              <Button className="gap-2" onClick={handleAddSiteClick}>
                <Plus className="h-4 w-4" />
                Add your first website
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <Card
                key={site.id}
                className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-md"
                onClick={() => navigate(`/sites/${site.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{site.name || site.domain}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {site.domain}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-foreground/60">
                    Added {new Date(site.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SitesTab;
