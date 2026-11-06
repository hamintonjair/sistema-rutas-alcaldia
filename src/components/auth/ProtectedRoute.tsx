import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../services/api';

interface ProtectedRouteProps {
  userContext: UserContext;
  allowedRoles: string[];
  children: React.ReactElement;
}

export const getNormalizedRoleCode = (role?: string): 'admin' | 'coordinator' | 'institutional' | 'public' => {
  const r = (role || '').toLowerCase().trim();
  if (r === 'admin' || r === 'administrador' || r === 'administrador general') return 'admin';
  if (r === 'coordinator' || r === 'coordinador' || r === 'coordinadora' || r === 'coordinador de la ruta') return 'coordinator';
  if (r === 'institutional' || r === 'institucional' || r === 'usuario institucional') return 'institutional';
  return 'public';
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  userContext,
  allowedRoles,
  children,
}) => {
  const location = useLocation();

  const userRoleCode = getNormalizedRoleCode(userContext.role);

  // Unauthenticated user redirected to /login
  if (userRoleCode === 'public') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedAllowed = allowedRoles.map(getNormalizedRoleCode);

  // Role Access Guard
  if (!normalizedAllowed.includes(userRoleCode)) {
    // Redirect user to their proper dashboard based on role
    if (userRoleCode === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (userRoleCode === 'coordinator') {
      return <Navigate to="/coordinacion" replace />;
    }
    if (userRoleCode === 'institutional') {
      return <Navigate to="/mi-entidad" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
