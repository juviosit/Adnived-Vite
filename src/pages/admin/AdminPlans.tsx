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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type Plan = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  max_hits: number | null;
  max_sites: number | null;
  is_active: boolean;
};

const AdminPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", price: "", maxHits: "", maxSites: "" });

  const fetchPlans = async () => {
    const { data } = await supabase.from("plans").select("*").order("price_cents");
    setPlans((data || []) as Plan[]);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", price: "", maxHits: "", maxSites: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Plan) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      price: (p.price_cents / 100).toString(),
      maxHits: p.max_hits?.toString() || "",
      maxSites: p.max_sites?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug,
      price_cents: Math.round(parseFloat(form.price || "0") * 100),
      max_hits: form.maxHits ? parseInt(form.maxHits) : null,
      max_sites: form.maxSites ? parseInt(form.maxSites) : null,
    };

    if (editing) {
      const { error } = await supabase.from("plans").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Plan updated");
    } else {
      const { error } = await supabase.from("plans").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Plan created");
    }
    setDialogOpen(false);
    fetchPlans();
  };

  const toggleActive = async (plan: Plan) => {
    const { error } = await supabase.from("plans").update({ is_active: !plan.is_active }).eq("id", plan.id);
    if (error) { toast.error(error.message); return; }
    fetchPlans();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Plans & Pricing</h1>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Plan
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Plan" : "Create Plan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Price ($/month)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Hits (empty = unlimited)</Label>
                <Input type="number" value={form.maxHits} onChange={(e) => setForm({ ...form, maxHits: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Max Sites (empty = unlimited)</Label>
                <Input type="number" value={form.maxSites} onChange={(e) => setForm({ ...form, maxSites: e.target.value })} />
              </div>
            </div>
            <Button type="submit" className="w-full">{editing ? "Save Changes" : "Create Plan"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Max Hits</TableHead>
                  <TableHead>Max Sites</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="secondary">{p.slug}</Badge></TableCell>
                    <TableCell>${(p.price_cents / 100).toFixed(2)}</TableCell>
                    <TableCell>{p.max_hits?.toLocaleString() || "Unlimited"}</TableCell>
                    <TableCell>{p.max_sites?.toLocaleString() || "Unlimited"}</TableCell>
                    <TableCell>
                      <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
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

export default AdminPlans;
