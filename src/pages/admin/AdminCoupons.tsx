import SEO from "@/components/SEO";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Coupon = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  free_months: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    freeMonths: "",
    maxUses: "",
    expiresAt: "",
  });

  const fetchCoupons = async () => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    setCoupons((data as Coupon[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", discountType: "percentage", discountValue: "", freeMonths: "", maxUses: "", expiresAt: "" });
    setDialogOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      discountType: c.discount_type,
      discountValue: c.discount_value.toString(),
      freeMonths: c.free_months.toString(),
      maxUses: c.max_uses?.toString() || "",
      expiresAt: c.expires_at ? c.expires_at.slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, code });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code.toUpperCase().trim(),
      discount_type: form.discountType,
      discount_value: parseFloat(form.discountValue || "0"),
      free_months: parseInt(form.freeMonths || "0"),
      max_uses: form.maxUses ? parseInt(form.maxUses) : null,
      expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };

    if (editing) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Coupon updated");
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Coupon created");
    }
    setDialogOpen(false);
    fetchCoupons();
  };

  const toggleActive = async (c: Coupon) => {
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    fetchCoupons();
  };

  const deleteCoupon = async (c: Coupon) => {
    if (c.used_count > 0) {
      toast.error("Cannot delete a coupon that has been used. Deactivate it instead.");
      return;
    }
    const { error } = await supabase.from("coupons").delete().eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Coupon deleted");
    fetchCoupons();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard");
  };

  const formatDiscount = (c: Coupon) => {
    if (c.discount_type === "percentage") return `${c.discount_value}% off`;
    if (c.discount_type === "fixed") return `$${c.discount_value} off`;
    if (c.discount_type === "free_months") return `${c.free_months} free month${c.free_months !== 1 ? "s" : ""}`;
    return "-";
  };

  return (
    <AdminLayout>
      <SEO title="Admin Coupons" description="Manage discount coupons." path="/admin/coupons" noindex />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <div className="flex gap-2">
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. LAUNCH50"
                  required
                  className="uppercase"
                />
                <Button type="button" variant="outline" size="sm" onClick={generateCode}>
                  Generate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage off</SelectItem>
                  <SelectItem value="fixed">Fixed amount off</SelectItem>
                  <SelectItem value="free_months">Free months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.discountType !== "free_months" && (
              <div className="space-y-2">
                <Label>{form.discountType === "percentage" ? "Discount (%)" : "Discount ($)"}</Label>
                <Input
                  type="number"
                  step={form.discountType === "percentage" ? "1" : "0.01"}
                  min="0"
                  max={form.discountType === "percentage" ? "100" : undefined}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  required
                />
              </div>
            )}
            {form.discountType === "free_months" && (
              <div className="space-y-2">
                <Label>Free Months</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.freeMonths}
                  onChange={(e) => setForm({ ...form, freeMonths: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Uses (empty = unlimited)</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expires At (optional)</Label>
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">{editing ? "Save Changes" : "Create Coupon"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No coupons yet. Create one to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold">{c.code}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(c.code)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatDiscount(c)}</Badge>
                    </TableCell>
                    <TableCell>
                      {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}
                    </TableCell>
                    <TableCell>
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCoupon(c)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminCoupons;
