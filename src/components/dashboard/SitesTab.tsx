import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ExternalLink, Globe, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AccessRequestsPanel from "./AccessRequestsPanel";

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
  const [domainConflict, setDomainConflict] = useState(false);
  const [conflictSiteId, setConflictSiteId] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
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

  const cleanDomain = (d: string) => d.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    setDomainConflict(false);

    const cleaned = cleanDomain(domain);

    const { error } = await supabase.from("sites").insert({
      domain: cleaned,
      name: siteName || null,
      user_id: user.id,
    });

    setAdding(false);

    if (error) {
      // Unique constraint violation → domain exists
      if (error.code === "23505") {
        // Look up the existing site to get its ID
        const { data: existingSite } = await supabase
          .from("sites")
          .select("id")
          .eq("domain", cleaned)
          .limit(1);

        // The query may return empty if RLS blocks it (user doesn't own it)
        // In that case we need a different approach - use an edge function or just show the message
        if (existingSite && existingSite.length > 0) {
          setConflictSiteId(existingSite[0].id);
        } else {
          setConflictSiteId(null);
        }
        setDomainConflict(true);
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

  const handleRequestAccess = async () => {
    if (!user) return;
    setRequesting(true);

    const cleaned = cleanDomain(domain);

    // We need the site_id. If we couldn't get it via RLS, use an edge function
    // For now, try a direct lookup via a function
    if (conflictSiteId) {
      const { error } = await supabase.from("access_requests").insert({
        domain: cleaned,
        site_id: conflictSiteId,
        requester_id: user.id,
      });

      setRequesting(false);
      if (error) {
        if (error.code === "23505") {
          toast.error("You have already requested access to this domain");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Access request sent! The site owner will review your request.");
        setDomain("");
        setSiteName("");
        setDialogOpen(false);
        setDomainConflict(false);
      }
    } else {
      // Can't see the site due to RLS - use the lookup edge function
      const { data, error } = await supabase.functions.invoke("request-site-access", {
        body: { domain: cleaned },
      });

      setRequesting(false);
      if (error) {
        toast.error("Failed to send request");
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Access request sent! The site owner will review your request.");
        setDomain("");
        setSiteName("");
        setDialogOpen(false);
        setDomainConflict(false);
      }
    }
  };

  const resetDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setDomainConflict(false);
      setConflictSiteId(null);
    }
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
          <Dialog open={dialogOpen} onOpenChange={resetDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add website
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new website</DialogTitle>
              </DialogHeader>
              {!domainConflict ? (
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
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                    <Globe className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="mb-1 font-medium text-foreground">
                      Domain already registered
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>{cleanDomain(domain)}</strong> is already tracked by another user.
                      You can request access from the site owner.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setDomainConflict(false)}
                    >
                      Try another domain
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      onClick={handleRequestAccess}
                      disabled={requesting}
                    >
                      <Send className="h-4 w-4" />
                      {requesting ? "Sending..." : "Request access"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {sites.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No websites yet</h3>
              <p className="mb-6 text-sm text-muted-foreground">Add your first website to start tracking analytics</p>
              <Button className="gap-2" onClick={() => setDialogOpen(true)}>
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
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(site.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AccessRequestsPanel />
    </div>
  );
};

export default SitesTab;
