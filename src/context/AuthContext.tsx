import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export interface User {
  cliente_id?: number;
  id?: number;  // Add this for admin users
  nombre: string;
  email: string;
  direccion?: string;
  telefono?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null; // Añadimos el token para que esté disponible en el contexto
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  adminLogin: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Verificar si hay usuario guardado al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const isAdminFlag = localStorage.getItem('isAdmin') === 'true';

      if (savedToken) {
        try {
          // Configura los headers para esta petición específica en lugar de globalmente
          const headers: Record<string, string> = {
            'Authorization': `Bearer ${savedToken}`
          };
          
          if (isAdminFlag) {
            headers['x-is-admin'] = 'true';
          }
          
          // Usa los headers directamente en la petición
          const response = await axios.get(`${API_URL}/auth/me`, { headers });
          
          // Si es admin según localStorage, asegúrate de mantener ese rol
          if (isAdminFlag) {
            setUser({...response.data, role: 'admin'});
          } else {
            setUser(response.data);
          }
          
          // Configura los headers defaults para futuras peticiones
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          if (isAdminFlag) {
            axios.defaults.headers.common['x-is-admin'] = 'true';
          }
          setToken(savedToken); // Guarda el token en el estado
        } catch (error) {
          console.error('Error verificando autenticación:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          delete axios.defaults.headers.common['Authorization'];
          delete axios.defaults.headers.common['x-is-admin'];
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: newToken, user: userData } = response.data;

      console.log('Login response:', response.data);

      // Make sure we have valid user data
      if (!userData || !userData.nombre) {
        throw new Error('El servidor no devolvió información de usuario válida');
      }

      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(userData);
      setToken(newToken); // Actualiza el token en el estado
      toast.success(`Bienvenido, ${userData.nombre}!`);
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

 const register = async (userData: Partial<User> & { password: string }) => {
  try {
    setLoading(true);
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    
    const token = response.data.token;
    if (token) {
      localStorage.setItem('token', token);
      setUser(response.data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error en registro:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Error al conectar con el servidor');
    }
  } finally {
    setLoading(false);
  }
};

  const adminLogin = async (username: string, password: string) => {
    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/admin/login`, {
        email: username,
        password
      });

      const { token: newToken, user: adminUser } = response.data;

      if (!adminUser) {
        throw new Error('El servidor no devolvió información de administrador válida');
      }

      // Explicitly set the role property to ensure admin status is properly tracked
      const userWithRole = {
        ...adminUser,
        role: 'admin'
      };

      localStorage.setItem('token', newToken);
      localStorage.setItem('isAdmin', 'true');

      // También establece el header personalizado para peticiones futuras
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      axios.defaults.headers.common['x-is-admin'] = 'true';

      setUser(userWithRole);
      setToken(newToken); // Actualiza el token en el estado

      toast.success(`Bienvenido, Administrador ${adminUser.nombre || ''}!`);
    } catch (error) {
      console.error('Error en login de admin:', error);
      toast.error('Error al iniciar sesión como administrador');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['x-is-admin']; // Añade esta línea
    setUser(null);
    setToken(null); // Limpia el token en el estado
    toast.success('Sesión cerrada');
  };

  const isAdmin = () => {
    // Check both user role and localStorage for admin status
    const adminStatus = user?.role === 'admin' || localStorage.getItem('isAdmin') === 'true';
    return adminStatus;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token, // Exponemos el token aquí
      login,
      register,
      logout,
      isAdmin,
      adminLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};