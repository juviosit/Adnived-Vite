import SEO from "@/components/SEO";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, BarChart3, Target, GitBranch, Menu, Radio, Settings,
  Link2, Megaphone, FileText, Globe, Monitor, LayoutDashboard,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import GoalsPanel from "@/components/analytics/GoalsPanel";
import OverviewSection from "@/components/analytics/OverviewSection";
import FunnelsPanel from "@/components/analytics/FunnelsPanel";
import SiteSettingsPanel from "@/components/analytics/SiteSettingsPanel";
import BreakdownPage from "@/components/analytics/BreakdownPage";
import { cn } from "@/lib/utils";


type Section = "realtime" | "overview" | "sources" | "campaigns" | "pages" | "locations" | "technology" | "goals" | "funnels" | "settings";

const NAV_ITEMS: { section: Section; label: string; icon: React.ElementType; group: string }[] = [
  { section: "realtime", label: "Realtime", icon: Radio, group: "Traffic" },
  { section: "overview", label: "Overview", icon: BarChart3, group: "Traffic" },
  { section: "sources", label: "Sources", icon: Link2, group: "Acquisition" },
  { section: "campaigns", label: "Campaigns", icon: Megaphone, group: "Acquisition" },
  { section: "pages", label: "Pages", icon: FileText, group: "Content" },
  { section: "locations", label: "Locations", icon: Globe, group: "Audience" },
  { section: "technology", label: "Technology", icon: Monitor, group: "Audience" },
  { section: "goals", label: "Goals", icon: Target, group: "Behavior" },
  { section: "funnels", label: "Funnels", icon: GitBranch, group: "Behavior" },
  
  { section: "settings", label: "Settings", icon: Settings, group: "Site" },
];

const SiteAnalytics = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const { signOut } = useAuth();
  const [site, setSite] = useState<{ id: string; domain: string; name: string | null; public_share: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentVisitors, setCurrentVisitors] = useState<number | null>(null);
  

  useEffect(() => {
    if (!siteId) return;
    const fetchSite = () => {
      supabase
        .from("sites")
        .select("id, domain, name, public_share")
        .eq("id", siteId)
        .single()
        .then(({ data }) => {
          if (data) setSite(data);
          setLoading(false);
        });
    };
    fetchSite();
    (window as any).__refetchSite = fetchSite;
  }, [siteId]);

  // Realtime current visitors (distinct sessions in last 5 minutes)
  useEffect(() => {
    if (!siteId) return;
    const fetchCurrent = async () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("pageviews")
        .select("session_hash")
        .eq("site_id", siteId)
        .gte("timestamp", fiveMinAgo);
      const unique = new Set(data?.map((d) => d.session_hash).filter(Boolean));
      setCurrentVisitors(unique.size);
    };
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [siteId]);


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
      <SEO title={`${site.name || site.domain} – Analytics`} description={`Analytics dashboard for ${site.domain}. View traffic, sources, and conversions.`} path={`/sites/${siteId}`} noindex />
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden md:flex h-screen w-56 shrink-0 flex-col border-r border-border/50 bg-sidebar-background">
        <div className="flex flex-col border-b border-border/50 px-4">
          <Link to="/dashboard" className="flex h-14 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-foreground tracking-tight"><span className="font-bold">adnived</span><span className="font-normal">Analytics</span></span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 pb-3 group">
            <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="truncate text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{site.name || site.domain}</span>
          </Link>
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
                   <div className="flex flex-col border-b border-border/50 px-4">
                     <Link to="/dashboard" className="flex h-14 items-center gap-2">
                       <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                        <BarChart3 className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="text-foreground tracking-tight"><span className="font-bold">adnived</span><span className="font-normal">Analytics</span></span>
                     </Link>
                     <Link to="/dashboard" className="flex items-center gap-2 pb-3 group">
                       <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                       <span className="truncate text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{site.name || site.domain}</span>
                     </Link>
                   </div>
                  {sidebarNav}
                </SheetContent>
              </Sheet>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="text-lg font-bold text-foreground truncate max-w-[200px] sm:max-w-none">{site.name || site.domain}</h1>
                  {currentVisitors !== null && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      {currentVisitors} current visitor{currentVisitors !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {site.name && <p className="text-xs text-muted-foreground truncate">{site.domain}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          {activeSection === "realtime" && siteId && <OverviewSection siteId={siteId} defaultPreset="realtime" />}
          {activeSection === "overview" && siteId && <OverviewSection siteId={siteId} />}
          {activeSection === "sources" && siteId && <BreakdownPage siteId={siteId} breakdownType="sources" />}
          {activeSection === "campaigns" && siteId && <BreakdownPage siteId={siteId} breakdownType="campaigns" />}
          {activeSection === "pages" && siteId && <BreakdownPage siteId={siteId} breakdownType="pages" />}
          {activeSection === "locations" && siteId && <BreakdownPage siteId={siteId} breakdownType="locations" />}
          {activeSection === "technology" && siteId && <BreakdownPage siteId={siteId} breakdownType="technology" />}
          {activeSection === "goals" && siteId && <GoalsPanel siteId={siteId} />}
          {activeSection === "funnels" && siteId && <FunnelsPanel siteId={siteId} />}
          {activeSection === "settings" && site && (
            <SiteSettingsPanel site={site} onUpdate={() => {
              supabase.from("sites").select("id, domain, name, public_share").eq("id", site.id).single().then(({ data }) => { if (data) setSite(data); });
            }} />
          )}
        </main>
      </div>
    </div>
  );
};

export default SiteAnalytics;
