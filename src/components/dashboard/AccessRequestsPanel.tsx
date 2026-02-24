import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Inbox, Clock } from "lucide-react";
import { toast } from "sonner";

type AccessRequest = {
  id: string;
  domain: string;
  site_id: string;
  requester_id: string;
  status: string;
  created_at: string;
  requester_email?: string;
  requester_name?: string;
};

const AccessRequestsPanel = () => {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<AccessRequest[]>([]);
  const [myRequests, setMyRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isPaidPlan, setIsPaidPlan] = useState(false);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;

    // Fetch incoming requests (for sites I own) and my outgoing requests
    const [incomingRes, myRes, subRes] = await Promise.all([
      supabase
        .from("access_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }) as any,
      supabase
        .from("access_requests")
        .select("*")
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false }) as any,
      supabase
        .from("user_subscriptions")
        .select("plan_id, plans(price_cents)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .single(),
    ]);

    if (subRes.data?.plans) {
      const plans = subRes.data.plans as unknown as { price_cents: number };
      setIsPaidPlan(plans.price_cents > 0);
    }

    // Get my site IDs to distinguish incoming vs outgoing
    const { data: mySites } = await supabase
      .from("sites")
      .select("id")
      .eq("user_id", user.id);
    const mySiteIds = new Set((mySites || []).map((s) => s.id));

    const allRequests = incomingRes.data || [];
    const incoming = allRequests.filter(
      (r) => mySiteIds.has(r.site_id) && r.requester_id !== user.id
    );

    // Enrich with requester profile info
    if (incoming.length > 0) {
      const requesterIds = [...new Set(incoming.map((r: AccessRequest) => r.requester_id))] as string[];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", requesterIds);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
      incoming.forEach((r) => {
        const p = profileMap.get(r.requester_id);
        if (p) {
          r.requester_email = p.email || undefined;
          r.requester_name = p.full_name || undefined;
        }
      });
    }

    setIncomingRequests(incoming);
    setMyRequests(myRes.data || []);
    setLoading(false);
  };

  const handleApprove = async (request: AccessRequest) => {
    if (!isPaidPlan) {
      toast.error("You need a paid plan to accept team members");
      return;
    }

    setProcessing(request.id);

    // Add as site_member with viewer role
    const { error: memberError } = await supabase.from("site_members").insert({
      site_id: request.site_id,
      user_id: request.requester_id,
      role: "viewer",
      invited_by: user?.id,
    });

    if (memberError) {
      if (memberError.code === "23505") {
        toast.error("This user already has access");
      } else {
        toast.error(memberError.message);
        setProcessing(null);
        return;
      }
    }

    // Update request status
    await supabase
      .from("access_requests")
      .update({ status: "approved" })
      .eq("id", request.id);

    toast.success(`Access granted to ${request.requester_email || "user"}`);
    setProcessing(null);
    fetchAll();
  };

  const handleDeny = async (request: AccessRequest) => {
    setProcessing(request.id);
    await supabase
      .from("access_requests")
      .update({ status: "denied" })
      .eq("id", request.id);
    toast.success("Request denied");
    setProcessing(null);
    fetchAll();
  };

  if (loading) return null;

  const hasContent = incomingRequests.length > 0 || myRequests.length > 0;
  if (!hasContent) return null;

  return (
    <div className="space-y-6">
      {/* Incoming requests (I'm the site owner) */}
      {incomingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Inbox className="h-5 w-5 text-muted-foreground" />
              Access Requests
            </CardTitle>
            <CardDescription>
              People requesting access to your sites
              {!isPaidPlan && (
                <span className="ml-1 text-destructive">
                  — Upgrade to a paid plan to approve requests
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {req.requester_name || req.requester_email || "Unknown user"}
                  </p>
                  {req.requester_name && req.requester_email && (
                    <p className="text-xs text-muted-foreground">{req.requester_email}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Wants access to <strong>{req.domain}</strong> ·{" "}
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDeny(req)}
                    disabled={processing === req.id}
                  >
                    <X className="h-3.5 w-3.5" />
                    Deny
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => handleApprove(req)}
                    disabled={processing === req.id || !isPaidPlan}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* My outgoing requests */}
      {myRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              My Access Requests
            </CardTitle>
            <CardDescription>Domains you've requested access to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
              >
                <div>
                  <p className="text-sm text-foreground">{req.domain}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={
                    req.status === "approved"
                      ? "default"
                      : req.status === "denied"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {req.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccessRequestsPanel;
