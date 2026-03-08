import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock } from "lucide-react";

type ClosureRequest = {
  id: string;
  user_id: string;
  email: string;
  reason: string | null;
  status: string;
  created_at: string;
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

const AdminClosureRequests = () => {
  const [requests, setRequests] = useState<ClosureRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("account_closure_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("account_closure_requests")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update request.");
      return;
    }
    toast.success(`Request ${status}.`);
    fetchRequests();
  };

  return (
    <AdminLayout>
      <SEO title="Account Closure Requests" description="Manage account closure requests." path="/admin/closure-requests" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Closure Requests</h1>
          <p className="text-sm text-muted-foreground">Review and process user account deletion requests.</p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-muted-foreground">No closure requests yet.</p>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => {
                  const cfg = statusConfig[req.status] ?? statusConfig.pending;
                  return (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {req.reason || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className="gap-1">
                          <cfg.icon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(req.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {req.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, "approved")}>
                              Approve
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => updateStatus(req.id, "rejected")}>
                              Reject
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminClosureRequests;
