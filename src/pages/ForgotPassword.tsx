import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center justify-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg text-foreground tracking-tight"><span className="font-bold">adnived</span><span className="font-normal">Analytics</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'll send you a reset link</p>
        </div>
        {sent ? (
          <div className="rounded-2xl bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Check your email for a password reset link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
            <p className="text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
