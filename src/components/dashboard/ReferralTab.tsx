import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Send, Check, Clock, X } from "lucide-react";
import { toast } from "sonner";

const ReferralTab = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("plan_id, plans(slug)")
        .eq("user_id", user.id)
        .single();
      const slug = (sub?.plans as any)?.slug;
      setIsPaidUser(slug === "pro" || slug === "max");
      setChecking(false);
    };
    check();
    fetchReferrals();
  }, [user]);

  const fetchReferrals = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });
    setReferrals(data || []);
  };

  const generateCode = () => {
    return "REF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSendReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email.trim()) return;
    setLoading(true);

    const code = generateCode();
    const { error } = await supabase.from("referrals").insert({
      referrer_id: user.id,
      referral_email: email.trim().toLowerCase(),
      referral_code: code,
    });

    setLoading(false);
    if (error) {
      toast.error("Failed to create referral");
    } else {
      toast.success("Referral created! Share the link with your friend.");
      setEmail("");
      fetchReferrals();
    }
  };

  const copyLink = (code: string) => {
    const link = `${window.location.origin}/refer?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

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

  if (checking) return null;

  if (!isPaidUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Referral Program</CardTitle>
          <CardDescription>Upgrade to a paid plan to unlock the referral program and earn free months of Pro.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Paid users can refer friends and both get 1 month of Pro free when they sign up.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Refer a Friend</CardTitle>
          <CardDescription>
            Send a referral to a friend. When they sign up within 30 days, you both get 1 month of Pro free!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendReferral} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="ref-email" className="sr-only">Friend's email</Label>
              <Input
                id="ref-email"
                type="email"
                placeholder="friend@example.com"
                className="rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="rounded-full gap-2">
              <Send className="h-4 w-4" />
              {loading ? "Sending..." : "Create Referral"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>{referrals.length} referral{referrals.length !== 1 ? "s" : ""} sent</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No referrals yet. Invite a friend to get started!</p>
          ) : (
            <div className="space-y-3">
              {referrals.map((ref) => (
                <div key={ref.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ref.referral_email}</p>
                    <p className="text-xs text-muted-foreground">
                      Code: {ref.referral_code} · Expires {new Date(ref.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {statusBadge(ref.status)}
                    <Button variant="outline" size="sm" className="rounded-full gap-1" onClick={() => copyLink(ref.referral_code)}>
                      <Copy className="h-3 w-3" /> Copy Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralTab;
