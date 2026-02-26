import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Copy, ExternalLink, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SiteSettingsPanelProps {
  site: { id: string; domain: string; name: string | null; public_share: boolean };
  onUpdate: () => void;
}

export default function SiteSettingsPanel({ site, onUpdate }: SiteSettingsPanelProps) {
  const navigate = useNavigate();
  const [name, setName] = useState(site.name || "");
  const [domain, setDomain] = useState(site.domain);
  const [publicShare, setPublicShare] = useState(site.public_share);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const shareUrl = `${window.location.origin}/share/${site.id}`;

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("sites")
      .update({ name: name || null, domain, public_share: publicShare })
      .eq("id", site.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved");
      onUpdate();
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("sites").delete().eq("id", site.id);
    setDeleting(false);
    if (error) {
      toast.error("Failed to delete site");
    } else {
      toast.success("Site deleted");
      navigate("/dashboard");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Basic site information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input id="site-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Website" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-domain">Domain</Label>
            <Input id="site-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visibility</CardTitle>
          <CardDescription>Control who can see your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Public Dashboard</p>
              <p className="text-xs text-muted-foreground">Anyone with the link can view analytics</p>
            </div>
            <Switch checked={publicShare} onCheckedChange={(v) => { setPublicShare(v); }} />
          </div>
          {publicShare && (
            <div className="space-y-2">
              <Label>Shared Link</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={shareUrl} className="text-xs" />
                <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); }}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={shareUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                </Button>
              </div>
            </div>
          )}
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? "Saving…" : "Save visibility"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete Site
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {site.name || site.domain}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the site and all its analytics data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting ? "Deleting…" : "Delete permanently"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
