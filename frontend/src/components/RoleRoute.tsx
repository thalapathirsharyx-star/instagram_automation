import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Which signed-in role a page belongs to. The sidebar already shows each role
 * only its own pages; this keeps a typed-in URL to the same rules:
 *  - 'admin'  SUPER_ADMIN only (the Flazly team's /admin/* pages)
 *  - 'client' any workspace member (client admin or agent), never a super admin
 *  - 'owner'  the workspace owner (CLIENT_ADMIN): AI persona, Team, Billing
 * The backend enforces the same boundaries on its endpoints; this is the UI side.
 */
export type RouteAccess = 'admin' | 'client' | 'owner';

const RoleRoute: React.FC<{ access: RouteAccess; children: React.ReactNode }> = ({ access, children }) => {
  const { user } = useAuth();
  const role = user?.roleCode;
  const isSuperAdmin = role === 'SUPER_ADMIN';

  if (access === 'admin' && !isSuperAdmin) return <Navigate to="/dashboard" replace />;
  if (access !== 'admin' && isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (access === 'owner' && role !== 'CLIENT_ADMIN') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default RoleRoute;
