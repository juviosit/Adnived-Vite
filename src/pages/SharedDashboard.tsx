import SEO from "@/components/SEO";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OverviewSection from "@/components/analytics/OverviewSection";

const SharedDashboard = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<{ id: string; domain: string; name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId) return;
    supabase
      .from("sites")
      .select("id, domain, name, public_share")
      .eq("id", siteId)
      .eq("public_share", true)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError("This dashboard is not publicly available.");
        } else {
          setSite(data);
        }
        setLoading(false);
      });
  }, [siteId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">Not Available</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{site.name || site.domain}</h1>
              {site.name && <p className="text-xs text-muted-foreground">{site.domain}</p>}
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Powered by adnivedAnalytics</span>
        </div>
      </header>
      <main className="p-4 md:p-6">
        <OverviewSection siteId={site.id} />
      </main>
    </div>
  );
};

export default SharedDashboard;
