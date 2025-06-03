import React from 'react';
import ProtectedRoute from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute es ahora un componente wrapper que utiliza ProtectedRoute con requiredRole="admin"
 * Se mantiene para retrocompatibilidad, pero se recomienda usar directamente ProtectedRoute
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  console.log("Using deprecated AdminRoute component. Consider using ProtectedRoute with requiredRole='admin' instead");
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute;