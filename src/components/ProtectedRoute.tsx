import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [planSelected, setPlanSelected] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    const check = async () => {
      const [profileRes, roleRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("plan_selected")
          .eq("id", session.user.id)
          .single(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle(),
      ]);

      const admin = !!roleRes.data;
      setIsAdmin(admin);
      // Admins always bypass plan selection
      setPlanSelected(admin || (profileRes.data?.plan_selected ?? false));
      setChecked(true);
    };

    check();
  }, [session, location.pathname]);

  if (loading || (session && !checked)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (planSelected && location.pathname === "/select-plan") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!planSelected && location.pathname !== "/select-plan") {
    return <Navigate to="/select-plan" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
