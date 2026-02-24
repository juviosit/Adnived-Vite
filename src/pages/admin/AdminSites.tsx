import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

type SiteRow = {
  id: string;
  domain: string;
  name: string | null;
  created_at: string;
  owner_email: string | null;
  user_id: string;
};

const AdminSites = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSites = async () => {
    const { data: sitesData } = await supabase.from("sites").select("id, domain, name, created_at, user_id");
    const { data: profiles } = await supabase.from("profiles").select("id, email");

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.email]));
    const merged: SiteRow[] = (sitesData || []).map((s: any) => ({
      ...s,
      owner_email: profileMap.get(s.user_id) || "Unknown",
    }));

    setSites(merged);
    setLoading(false);
  };

  useEffect(() => { fetchSites(); }, []);

  const deleteSite = async (id: string) => {
    const { error } = await supabase.from("sites").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Site deleted");
    fetchSites();
  };

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Sites</h1>
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
                  <TableHead>Domain</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.domain}</TableCell>
                    <TableCell>{s.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.owner_email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/sites/${s.id}`)}>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteSite(s.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
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

export default AdminSites;
