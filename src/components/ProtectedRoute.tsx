import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [planChecked, setPlanChecked] = useState(false);
  const [planSelected, setPlanSelected] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    // Skip plan check if we're already on select-plan
    if (location.pathname === "/select-plan") {
      setPlanChecked(true);
      return;
    }
    supabase
      .from("profiles")
      .select("plan_selected")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        setPlanSelected(data?.plan_selected ?? false);
        setPlanChecked(true);
      });
  }, [session, location.pathname]);

  if (loading || (session && !planChecked)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!planSelected && location.pathname !== "/select-plan") {
    return <Navigate to="/select-plan" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
