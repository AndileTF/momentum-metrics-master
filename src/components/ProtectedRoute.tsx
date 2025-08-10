import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'manager';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState<boolean>(!!requireRole);

  useEffect(() => {
    let isMounted = true;
    const fetchRole = async () => {
      if (!requireRole || !user) {
        setRoleLoading(false);
        return;
      }
      const { data, error } = await supabase.rpc('get_current_user_role');
      if (isMounted) {
        if (!error) setRole((data as string | null) ?? null);
        setRoleLoading(false);
      }
    };
    fetchRole();
    return () => {
      isMounted = false;
    };
  }, [requireRole, user]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const hasAccess = () => {
    if (!requireRole) return true;
    if (!role) return false;
    if (requireRole === 'admin') return role === 'admin';
    if (requireRole === 'manager') return role === 'manager' || role === 'admin';
    return false;
  };

  if (!hasAccess()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
