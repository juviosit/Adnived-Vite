import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: string;
  plan_name: string | null;
  plan_id: string | null;
  sub_id: string | null;
};

type Plan = { id: string; name: string; slug: string };

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [profilesRes, rolesRes, subsRes, plansRes] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, created_at"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("user_subscriptions").select("id, user_id, plan_id, plans(name)"),
      supabase.from("plans").select("id, name, slug"),
    ]);

    const roles = (rolesRes.data || []) as any[];
    const subs = (subsRes.data || []) as any[];
    const profilesList = (profilesRes.data || []) as any[];

    const merged: UserRow[] = profilesList.map((p: any) => {
      const role = roles.find((r: any) => r.user_id === p.id);
      const sub = subs.find((s: any) => s.user_id === p.id);
      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        created_at: p.created_at,
        role: role?.role || "user",
        plan_name: sub?.plans?.name || "None",
        plan_id: sub?.plan_id || null,
        sub_id: sub?.id || null,
      };
    });

    setUsers(merged);
    setPlans((plansRes.data || []) as Plan[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const changePlan = async (user: UserRow, newPlanId: string) => {
    if (user.sub_id) {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ plan_id: newPlanId, hits_used: 0 })
        .eq("id", user.sub_id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase
        .from("user_subscriptions")
        .insert({ user_id: user.id, plan_id: newPlanId });
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Plan updated");
    fetchData();
  };

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Users</h1>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell>{u.full_name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={u.plan_id || ""} onValueChange={(v) => changePlan(u, v)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="No plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
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

export default AdminUsers;
