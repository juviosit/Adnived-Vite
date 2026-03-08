import SEO from "@/components/SEO";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Save, TestTube, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type PaymentSettingsSafe = {
  id: string;
  provider: string;
  app_id: string;
  currency: string;
  is_test_mode: boolean;
  redirect_url: string;
  callback_url: string;
  app_token: string;
  hash_salt: string;
};

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
  const [hasToken, setHasToken] = useState(false);
  const [hasSalt, setHasSalt] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    app_id: "",
    app_token: "", // only for new values, never pre-filled
    hash_salt: "", // only for new values, never pre-filled
    currency: "LKR",
    is_test_mode: true,
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
        .select("id, provider, app_id, currency, is_test_mode, redirect_url, callback_url, app_token, hash_salt")
        .limit(1)
        .single(),
      supabase
        .from("payment_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (settingsRes.data) {
      const s = settingsRes.data as unknown as PaymentSettingsSafe;
      setSettingsId(s.id);
      setHasToken(!!s.app_token && s.app_token.length > 0);
      setHasSalt(!!s.hash_salt && s.hash_salt.length > 0);
      setForm({
        app_id: s.app_id,
        app_token: "",
        hash_salt: "",
        currency: s.currency,
        is_test_mode: s.is_test_mode,
        redirect_url: s.redirect_url,
        callback_url: s.callback_url,
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
        app_id: form.app_id,
        app_token: form.app_token, // empty string = don't change
        hash_salt: form.hash_salt, // empty string = don't change
        currency: form.currency,
        is_test_mode: form.is_test_mode,
        redirect_url: form.redirect_url,
        callback_url: form.callback_url,
      },
    });

    setSaving(false);
    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Payment settings saved");
      // Update configured status
      if (form.app_token.trim()) setHasToken(true);
      if (form.hash_salt.trim()) setHasSalt(true);
      setForm((f) => ({ ...f, app_token: "", hash_salt: "" }));
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
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
        <p className="text-muted-foreground">Configure OnePay payment integration</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              OnePay API Configuration
            </CardTitle>
            <CardDescription>
              Enter your credentials from the{" "}
              <a
                href="https://merchant.onepay.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                OnePay Merchant Portal
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_test_mode}
                  onCheckedChange={(checked) => setForm({ ...form, is_test_mode: checked })}
                />
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4 text-muted-foreground" />
                  <Label>Test Mode</Label>
                </div>
                {form.is_test_mode && (
                  <Badge variant="secondary">Sandbox — no real charges</Badge>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="app_id">App ID</Label>
                  <Input
                    id="app_id"
                    value={form.app_id}
                    onChange={(e) => setForm({ ...form, app_id: e.target.value })}
                    placeholder="e.g. 80NR1189D04CD635D8ACD"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LKR">LKR — Sri Lankan Rupee</SelectItem>
                      <SelectItem value="USD">USD — US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="app_token">App Token</Label>
                  {hasToken && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <ShieldCheck className="h-3 w-3" /> Configured
                    </Badge>
                  )}
                </div>
                <Input
                  id="app_token"
                  type="password"
                  value={form.app_token}
                  onChange={(e) => setForm({ ...form, app_token: e.target.value })}
                  placeholder={hasToken ? "Leave empty to keep current value" : "Paste your app token"}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="hash_salt">Hash Salt</Label>
                  {hasSalt && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <ShieldCheck className="h-3 w-3" /> Configured
                    </Badge>
                  )}
                </div>
                <Input
                  id="hash_salt"
                  type="password"
                  value={form.hash_salt}
                  onChange={(e) => setForm({ ...form, hash_salt: e.target.value })}
                  placeholder={hasSalt ? "Leave empty to keep current value" : "Paste your hash salt"}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="redirect_url">Redirect URL (after payment)</Label>
                  <Input
                    id="redirect_url"
                    type="url"
                    value={form.redirect_url}
                    onChange={(e) => setForm({ ...form, redirect_url: e.target.value })}
                    placeholder="https://yoursite.com/dashboard?tab=plan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="callback_url">Callback URL (webhook)</Label>
                  <Input
                    id="callback_url"
                    type="url"
                    value={form.callback_url}
                    onChange={(e) => setForm({ ...form, callback_url: e.target.value })}
                    placeholder="https://yourproject.supabase.co/functions/v1/onepay-callback"
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
                    <TableHead>OnePay ID</TableHead>
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
                        {tx.onepay_transaction_id || "—"}
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
