import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { firebaseUser, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background" data-testid="auth-loading">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) return <Navigate to="/auth" replace />;

  // Not yet chosen role
  if (!profile?.role && !roles) return <Navigate to="/role" replace />;

  if (roles && profile) {
    if (!roles.includes(profile.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
