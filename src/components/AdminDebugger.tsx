import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para depurar el estado de autenticación de administrador
 * Añade este componente a cualquier página para ver el estado actual
 */
const AdminDebugger: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const localStorageAdmin = localStorage.getItem('isAdmin');
  const localStorageToken = localStorage.getItem('token');
  
  return (
    <div className="bg-gray-100 p-4 mb-4 rounded-lg border border-gray-300 shadow-sm">
      <h3 className="font-bold mb-2">🔍 Estado de Autenticación Admin:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 text-sm">
        <div>
          <p><span className="font-semibold">Token:</span> {localStorageToken ? '✅ Presente' : '❌ No presente'}</p>
          <p><span className="font-semibold">isAdmin (localStorage):</span> {localStorageAdmin || 'No definido'}</p>
          <p><span className="font-semibold">isAdmin():</span> {isAdmin() ? 'true' : 'false'}</p>
          <p><span className="font-semibold">Role:</span> {user?.role || 'No definido'}</p>
        </div>
        <div>
          <button 
            onClick={() => {
              localStorage.setItem('isAdmin', 'true');
              window.location.reload();
            }}
            className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-2"
          >
            Forzar isAdmin=true
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('isAdmin');
              window.location.reload();
            }}
            className="bg-red-500 text-white text-xs px-2 py-1 rounded"
          >
            Borrar isAdmin
          </button>
        </div>
      </div>
      
      <div className="mt-2">
        <p className="font-semibold mb-1">Usuario:</p>
        <div className="bg-white p-2 rounded border border-gray-300 overflow-auto max-h-32">
          <pre className="text-xs">
            {JSON.stringify(user, null, 2) || 'No hay datos de usuario'}
          </pre>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * Este es un componente de depuración para desarrollo. Elimínalo en producción.
        </p>
      </div>
    </div>
  );
};

export default AdminDebugger;
