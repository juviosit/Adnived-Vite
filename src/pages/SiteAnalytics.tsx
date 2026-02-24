import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Copy, Code, BarChart3, Target, GitBranch, Menu, X,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import GoalsPanel from "@/components/analytics/GoalsPanel";
import OverviewSection from "@/components/analytics/OverviewSection";
import FunnelsPanel from "@/components/analytics/FunnelsPanel";
import { cn } from "@/lib/utils";

type Section = "overview" | "goals" | "funnels";

const NAV_ITEMS: { section: Section; label: string; icon: React.ElementType; group: string }[] = [
  { section: "overview", label: "Overview", icon: BarChart3, group: "Traffic" },
  { section: "goals", label: "Goals", icon: Target, group: "Behavior" },
  { section: "funnels", label: "Funnels", icon: GitBranch, group: "Behavior" },
];

const SiteAnalytics = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const { signOut } = useAuth();
  const [site, setSite] = useState<{ id: string; domain: string; name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!siteId) return;
    supabase
      .from("sites")
      .select("id, domain, name")
      .eq("id", siteId)
      .single()
      .then(({ data }) => {
        if (data) setSite(data);
        setLoading(false);
      });
  }, [siteId]);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const trackingSnippet = `<script defer data-domain="${site?.domain}" src="https://${projectId}.supabase.co/functions/v1/track"></script>`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Site not found</p>
      </div>
    );
  }

  const handleNavClick = (section: Section) => {
    setActiveSection(section);
    setMobileOpen(false);
  };

  const sidebarNav = (
    <nav className="flex-1 overflow-y-auto p-3 space-y-4">
      {Object.entries(
        NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((groups, item) => {
          (groups[item.group] ??= []).push(item);
          return groups;
        }, {})
      ).map(([group, items]) => (
        <div key={group}>
          <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{group}</p>
          {items.map((item) => (
            <button
              key={item.section}
              onClick={() => handleNavClick(item.section)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                activeSection === item.section
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden md:flex h-screen w-56 shrink-0 flex-col border-r border-border/50 bg-sidebar-background">
        <div className="flex h-14 items-center gap-2 border-b border-border/50 px-4">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="truncate text-sm font-semibold text-foreground">{site.name || site.domain}</span>
        </div>
        {sidebarNav}
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-56 p-0 bg-sidebar-background">
                  <div className="flex h-14 items-center gap-2 border-b border-border/50 px-4">
                    <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <span className="truncate text-sm font-semibold text-foreground">{site.name || site.domain}</span>
                  </div>
                  {sidebarNav}
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="text-lg font-bold text-foreground">{site.name || site.domain}</h1>
                {site.name && <p className="text-xs text-muted-foreground">{site.domain}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Code className="h-4 w-4" />
                    <span className="hidden sm:inline">Tracking snippet</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Install tracking snippet</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    Add this snippet to the <code>&lt;head&gt;</code> of your website:
                  </p>
                  <div className="relative rounded-lg bg-muted p-4">
                    <code className="text-xs break-all">{trackingSnippet}</code>
                    <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => { navigator.clipboard.writeText(trackingSnippet); toast.success("Copied to clipboard!"); }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          {activeSection === "overview" && siteId && <OverviewSection siteId={siteId} />}
          {activeSection === "goals" && siteId && <GoalsPanel siteId={siteId} />}
          {activeSection === "funnels" && siteId && <FunnelsPanel siteId={siteId} />}
        </main>
      </div>
    </div>
  );
};

export default SiteAnalytics;
