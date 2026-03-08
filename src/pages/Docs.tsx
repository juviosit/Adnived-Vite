import SEO from "@/components/SEO";
import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { BarChart3, ChevronDown, ChevronRight, Menu, X, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { docCategories, getDocBySlug, getAdjacentDocs } from "@/docs/docsData";
import { docContent } from "@/docs/docsContent";
import { cn } from "@/lib/utils";

const DocsSidebar = ({ currentSlug, onNavigate }: { currentSlug: string; onNavigate?: () => void }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    docCategories.forEach((cat) => {
      const hasActive = cat.pages.some((p) => p.slug === currentSlug);
      initial[cat.name] = hasActive || cat.name === "Get Started";
    });
    return initial;
  });

  const toggle = (name: string) =>
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <nav className="space-y-1 py-4">
      {docCategories.map((cat) => (
        <div key={cat.name}>
          <button
            onClick={() => toggle(cat.name)}
            className="flex w-full items-center justify-between px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent/50 rounded-lg transition-colors"
          >
            {cat.name}
            {openCategories[cat.name] ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {openCategories[cat.name] && (
            <div className="ml-2 space-y-0.5">
              {cat.pages.map((page) => (
                <Link
                  key={page.slug}
                  to={`/docs/${page.slug}`}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-md px-4 py-1.5 text-sm transition-colors",
                    currentSlug === page.slug
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {page.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

const DocsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSlug = slug || "welcome";
  const doc = getDocBySlug(currentSlug);

  if (!doc) return <Navigate to="/docs/welcome" replace />;

  const { prev, next } = getAdjacentDocs(currentSlug);
  const Content = docContent[currentSlug];

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${doc.title} – Docs`} description={`Documentation: ${doc.title}. Learn how to use adnivedAnalytics for privacy-first web analytics.`} path={`/docs/${currentSlug}`} />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-foreground tracking-tight"><span className="font-bold">adnived</span><span className="font-normal">Analytics</span></span>
            </Link>
            <span className="hidden sm:inline text-sm font-medium text-muted-foreground">Docs</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/">Home</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border/50">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
            <ScrollArea className="h-full">
              <DocsSidebar currentSlug={currentSlug} />
            </ScrollArea>
          </div>
        </aside>

        {/* Sidebar - mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-14 bottom-0 w-72 bg-background border-r border-border overflow-y-auto">
              <DocsSidebar currentSlug={currentSlug} onNavigate={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:px-10 lg:py-10">
            {/* Breadcrumb */}
            <div className="mb-6 flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <Link to="/docs/welcome" className="hover:text-foreground transition-colors">Docs</Link>
              <span>›</span>
              <span className="text-muted-foreground">{doc.category}</span>
              <span>›</span>
              <span className="text-foreground font-medium">{doc.title}</span>
            </div>

            <h1 className="mb-8 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{doc.title}</h1>

            {/* Content */}
            <div className="prose-docs">
              {Content ? <Content /> : <p className="text-muted-foreground">Documentation coming soon.</p>}
            </div>

            {/* Prev / Next navigation */}
            <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border pt-6">
              {prev ? (
                <Link
                  to={`/docs/${prev.slug}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Previous</p>
                    <p className="font-medium text-foreground">{prev.title}</p>
                  </div>
                </Link>
              ) : <div />}
              {next ? (
                <Link
                  to={`/docs/${next.slug}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors sm:text-right self-end sm:self-auto"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">Next</p>
                    <p className="font-medium text-foreground">{next.title}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              ) : <div />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocsPage;
