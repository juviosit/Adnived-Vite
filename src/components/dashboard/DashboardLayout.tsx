import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BarChart3, Link2, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

type DashboardLayoutProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: Record<string, ReactNode>;
};

const DashboardLayout = ({ activeTab, onTabChange, children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-foreground tracking-tight text-lg">
              <span className="font-bold">adnived</span>
              <span className="font-normal">Analytics</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/utm-builder">
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 h-9">
                <Link2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">UTM Builder</span>
              </Button>
            </Link>
            <div className="hidden sm:block h-5 w-px bg-border/60 mx-1" />
            <span className="hidden md:block text-sm text-foreground/60 max-w-[200px] truncate">{user?.email}</span>
            <Button variant="ghost" size="sm" className="rounded-full h-9 gap-1.5 text-foreground/60 hover:text-foreground" onClick={signOut}>
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6 md:py-10">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="mb-8 h-11 p-1 bg-muted/50">
            <TabsTrigger value="sites" className="rounded-lg px-5 data-[state=active]:shadow-sm">Sites</TabsTrigger>
            <TabsTrigger value="plan" className="rounded-lg px-5 data-[state=active]:shadow-sm">Plan</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg px-5 data-[state=active]:shadow-sm">Settings</TabsTrigger>
          </TabsList>
          {Object.entries(children).map(([key, content]) => (
            <TabsContent key={key} value={key}>
              {content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardLayout;
