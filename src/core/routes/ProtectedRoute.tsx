
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles, permissions }) => {
  const { isAuthenticated, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(roles)) {
    // If they are authenticated but don't have the right role, redirect to home
    return <Navigate to="/" replace />;
  }
  
  if (permissions && !hasPermission(permissions)) {
    // If they are authenticated but don't have the right permission, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
