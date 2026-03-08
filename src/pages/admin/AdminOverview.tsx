import SEO from "@/components/SEO";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Globe, CreditCard, Eye } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({ users: 0, sites: 0, pageviews: 0, subscriptions: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [profiles, sites, pageviews, subs] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("sites").select("id", { count: "exact", head: true }),
        supabase.from("pageviews").select("id", { count: "exact", head: true }),
        supabase.from("user_subscriptions").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        users: profiles.count || 0,
        sites: sites.count || 0,
        pageviews: pageviews.count || 0,
        subscriptions: subs.count || 0,
      });
    };
    fetch();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users },
    { label: "Total Sites", value: stats.sites, icon: Globe },
    { label: "Total Pageviews", value: stats.pageviews, icon: Eye },
    { label: "Subscriptions", value: stats.subscriptions, icon: CreditCard },
  ];

  return (
    <AdminLayout>
      <SEO title="Admin Overview" description="Admin dashboard overview." path="/admin" noindex />
      <h1 className="mb-6 text-2xl font-bold text-foreground">Admin Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <c.icon className="h-5 w-5 text-muted-foreground" />
              <p className="mt-3 text-3xl font-bold text-foreground">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
