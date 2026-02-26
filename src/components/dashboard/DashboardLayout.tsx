import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
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
      <header className="border-b border-border/50 bg-background">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">adnived</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
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
