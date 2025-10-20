import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

/**
 * AdminRoute Component
 * 
 * Protected route component that checks if user has admin role.
 * Redirects non-admin users to /dashboard.
 * Shows loading state while checking authentication and role.
 */
export default function AdminRoute() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    try {
      // 1. Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("❌ No user found, redirecting to login");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      console.log("✅ User authenticated:", user.id);

      // 2. Fetch user role from profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Error fetching profile:", profileError);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const userRole = profileData?.role || "user";
      console.log("👤 User role:", userRole);

      // 3. Check if user is admin
      if (userRole === "admin") {
        setIsAdmin(true);
        console.log("✅ Admin access granted");
      } else {
        setIsAdmin(false);
        console.log("❌ Admin access denied - user is not admin");
      }
    } catch (error) {
      console.error("❌ Error checking admin access:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to user dashboard if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render admin routes
  return <Outlet />;
}

