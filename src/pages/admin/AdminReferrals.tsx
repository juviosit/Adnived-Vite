import SEO from "@/components/SEO";
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, X, Gift } from "lucide-react";

type Referral = {
  id: string;
  referrer_id: string;
  referral_email: string;
  referral_code: string;
  referred_user_id: string | null;
  status: string;
  reward_applied: boolean;
  created_at: string;
  completed_at: string | null;
  expires_at: string;
};

const AdminReferrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { email: string | null; full_name: string | null }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false });

      const refs = (data || []) as Referral[];
      setReferrals(refs);

      // Load profiles for referrer IDs
      const ids = [...new Set(refs.map((r) => r.referrer_id).concat(refs.filter((r) => r.referred_user_id).map((r) => r.referred_user_id!)))];
      if (ids.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", ids);
        const map: Record<string, { email: string | null; full_name: string | null }> = {};
        (profs || []).forEach((p) => {
          map[p.id] = { email: p.email, full_name: p.full_name };
        });
        setProfiles(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const statusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="gap-1 bg-green-100 text-green-700 border-green-200"><Check className="h-3 w-3" /> Completed</Badge>;
      case "expired":
        return <Badge variant="secondary" className="gap-1"><X className="h-3 w-3" /> Expired</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    }
  };

  const completed = referrals.filter((r) => r.status === "completed").length;

  return (
    <AdminLayout>
      <SEO title="Admin - Referrals" description="View referral program activity." path="/admin/referrals" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Referrals</h1>
          <p className="text-muted-foreground">Track referral program activity and rewards.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{referrals.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-green-600">{completed}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{referrals.length > 0 ? Math.round((completed / referrals.length) * 100) : 0}%</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Referral Log</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : referrals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referrals yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">Referrer</th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">Referred Email</th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">Code</th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">Status</th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">Reward</th>
                      <th className="pb-3 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((ref) => (
                      <tr key={ref.id} className="border-b border-border/50">
                        <td className="py-3 pr-4">{profiles[ref.referrer_id]?.email || ref.referrer_id.slice(0, 8)}</td>
                        <td className="py-3 pr-4">{ref.referral_email}</td>
                        <td className="py-3 pr-4 font-mono text-xs">{ref.referral_code}</td>
                        <td className="py-3 pr-4">{statusBadge(ref.status)}</td>
                        <td className="py-3 pr-4">
                          {ref.reward_applied ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">Applied</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3">{new Date(ref.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminReferrals;
