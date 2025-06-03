import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'user' 
}) => {
  const { user, loading, isAdmin } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Esto evita el loader infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setTimeoutReached(true);
        console.warn('Tiempo de carga excedido - posible error de autenticación');
      }
    }, 5000); // 5 segundos máximo de carga
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Solo mantenemos la lógica esencial
  useEffect(() => {
    // Este código era para depuración y ya no es necesario
    // pero mantenemos el efecto para posibles futuras mejoras
  }, [loading, timeoutReached, user, isAdmin, requiredRole]);

  if (loading && !timeoutReached) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D72323]"></div>
      </div>
    );
  }
  
  // Si pasaron 5 segundos y sigue cargando, hay un problema
  if (timeoutReached && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="text-red-500 mb-4 font-bold">Error de autenticación</div>
        <p className="mb-4">No se pudo verificar tu identidad.</p>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="bg-[#D72323] text-white px-4 py-2 rounded"
        >
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si la ruta requiere ser admin
  if (requiredRole === 'admin' && !isAdmin()) {
    // Si el usuario está intentando acceder a una ruta de admin pero no es admin,
    // redirigir a la página de login de admin
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;