import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
      </div>
    );
  }

  // Not logged in → go login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but NOT admin → go to public collection
  if (!isAdmin) {
    return <Navigate to="/collection" replace />;
  }

  // Only YOU reach here
  return children;
}

export default AdminRoute;