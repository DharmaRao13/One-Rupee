import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { loading, isAdmin, session } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground font-display">
        🦉 Verifying admin session…
      </div>
    );
  }
  if (!session) return <Navigate to="/auth?next=/admin" replace state={{ from: loc.pathname }} />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default AdminGuard;
