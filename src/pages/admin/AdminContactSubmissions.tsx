import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

interface Submission {
  id: string;
  name: string;
  email: string;
  contact_number: string | null;
  inquiry_type: string;
  message: string;
  status: string;
  created_at: string;
}

const AdminContactSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    setSubmissions((data as Submission[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("contact_submissions").update({ status }).eq("id", id);
    toast({ title: `Marked as ${status}` });
    fetchSubmissions();
  };

  const deleteSubmission = async (id: string) => {
    await supabase.from("contact_submissions").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetchSubmissions();
  };

  return (
    <AdminLayout>
      <SEO title="Contact Submissions - Admin" description="Manage contact form submissions" path="/admin/contact" />
      <h1 className="mb-6 text-2xl font-bold text-foreground">Contact submissions</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-muted-foreground">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-nowrap text-xs">{format(new Date(s.created_at), "dd MMM yyyy")}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs">{s.email}</TableCell>
                  <TableCell className="text-xs">{s.contact_number || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{s.inquiry_type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs">{s.message}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "new" ? "default" : "outline"} className="capitalize">{s.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {s.status === "new" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, "resolved")}>
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteSubmission(s.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminContactSubmissions;
