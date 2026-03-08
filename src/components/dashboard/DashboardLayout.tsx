import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BarChart3, Link2 } from "lucide-react";
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
      <header className="border-b border-border/40 bg-background">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-foreground tracking-tight"><span className="font-bold">adnived</span><span className="font-normal">Analytics</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground/70">{user?.email}</span>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
