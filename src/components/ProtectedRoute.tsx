import { Navigate, Outlet } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  session: Session | null;
}

export default function ProtectedRoute({ session }: ProtectedRouteProps) {
  if (!session) {
    // Redirect to login if there is no active session
    return <Navigate to="/" replace />;
  }

  // Render the child routes if authenticated
  return <Outlet />;
}