import SEO from "@/components/SEO";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Save } from "lucide-react";
import { toast } from "sonner";

type Transaction = {
  id: string;
  user_id: string;
  plan_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  onepay_transaction_id: string | null;
  order_reference: string;
  created_at: string;
};

const AdminPaymentSettings = () => {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    currency: "USD",
    redirect_url: "",
    callback_url: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [settingsRes, txRes] = await Promise.all([
      supabase
        .from("payment_settings")
        .select("id, currency, redirect_url, callback_url")
        .limit(1)
        .single(),
      supabase
        .from("payment_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (settingsRes.data) {
      const s = settingsRes.data;
      setSettingsId(s.id);
      setForm({
        currency: s.currency || "USD",
        redirect_url: s.redirect_url || "",
        callback_url: s.callback_url || "",
      });
    }

    setTransactions((txRes.data || []) as unknown as Transaction[]);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsId) return;

    setSaving(true);
    const { data, error } = await supabase.functions.invoke("update-payment-settings", {
      body: {
        id: settingsId,
        currency: form.currency,
        redirect_url: form.redirect_url,
        callback_url: form.callback_url,
      },
    });

    setSaving(false);
    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Payment settings saved");
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "success": return "default";
      case "pending": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Payment Settings" description="Configure payment gateway." path="/admin/payments" noindex />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Payment Gateway</h1>
        <p className="text-muted-foreground">MaxelPay cryptocurrency payment integration</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              MaxelPay Configuration
            </CardTitle>
            <CardDescription>
              API key is stored securely as an environment secret. Configure redirect and webhook URLs below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    placeholder="USD"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="redirect_url">Success/Cancel URL (after payment)</Label>
                  <Input
                    id="redirect_url"
                    type="url"
                    value={form.redirect_url}
                    onChange={(e) => setForm({ ...form, redirect_url: e.target.value })}
                    placeholder="https://yoursite.com/dashboard?tab=plan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="callback_url">Webhook Callback URL</Label>
                  <Input
                    id="callback_url"
                    type="url"
                    value={form.callback_url}
                    onChange={(e) => setForm({ ...form, callback_url: e.target.value })}
                    placeholder="https://yourproject.supabase.co/functions/v1/maxelpay-webhook"
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Last 50 payment transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                No transactions yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Ref</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">{tx.order_reference}</TableCell>
                      <TableCell>
                        {tx.currency} {(tx.amount_cents / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColor(tx.status) as any}>{tx.status}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.onepay_transaction_id || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPaymentSettings;
