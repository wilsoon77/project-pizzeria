import React, { useState, useEffect } from 'react';
import { User, Search, Mail, Phone, Eye, Edit, Trash2, X, Save, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Estructura de cliente que coincide con la base de datos
interface Cliente {
  id: number;
  nombre: string;
  email: string;
  password_hash?: string;
  direccion?: string;
  telefono?: string;
}

// Formulario con campos opcionales para edición/creación
interface ClienteFormData extends Omit<Cliente, 'id'> {
  id?: number;
  password?: string; // Campo para nueva contraseña, no password_hash
}

const AdminClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<ClienteFormData>({
    nombre: '',
    email: '',
    password: '',
    direccion: '',
    telefono: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/clientes`);
        console.log('Datos de clientes recibidos:', response.data);
        setClientes(response.data);
      } catch (error) {
        console.error('Error al cargar los clientes:', error);
        toast.error('No se pudieron cargar los clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const filteredClientes = clientes.filter(cliente => 
    cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.telefono && cliente.telefono.includes(searchTerm))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCliente({
      ...currentCliente,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!currentCliente.nombre || !currentCliente.email) {
    toast.error('Por favor, completa los campos obligatorios');
    return;
  }

  try {
    setSubmitting(true);
    
    // Crear objeto con los datos a enviar
    const clienteData = {
      nombre: currentCliente.nombre,
      email: currentCliente.email,
      direccion: currentCliente.direccion || null,
      telefono: currentCliente.telefono || null
    };

    // Si hay contraseña y es una nueva, incluirla
    if (currentCliente.password) {
      Object.assign(clienteData, { password: currentCliente.password });
    }
    
    if (isEditing && currentCliente.id) {
      // Actualizar cliente existente
      const response = await axios.put(`${API_URL}/clientes/${currentCliente.id}`, clienteData);
      
      // Usa la respuesta del servidor para actualizar el estado
      const updatedCliente = response.data;
      setClientes(clientes.map(cliente => 
        cliente.id === currentCliente.id ? updatedCliente : cliente
      ));
      
      toast.success('Cliente actualizado correctamente');
    } else {
      // Crear nuevo cliente
      if (!currentCliente.password) {
        toast.error('La contraseña es obligatoria para nuevos clientes');
        setSubmitting(false);
        return;
      }
      
      const response = await axios.post(`${API_URL}/clientes`, clienteData);
      const newCliente = response.data;
      
      setClientes([...clientes, newCliente]);
      toast.success('Cliente creado correctamente');
    }
    
    resetForm();
  } catch (error: any) {
    console.error('Error al guardar el cliente:', error);
    
    // Manejo de errores mejorado
    if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else {
      toast.error('Error al guardar los cambios');
    }
  } finally {
    setSubmitting(false);
  }
};

  const handleEdit = (cliente: Cliente) => {
    setCurrentCliente({
      id: cliente.id,
      nombre: cliente.nombre,
      email: cliente.email,
      password: '', // No llenar la contraseña al editar
      direccion: cliente.direccion || '',
      telefono: cliente.telefono || ''
    });
    setIsEditing(true);
    setShowForm(true);
    setViewingCliente(null);
  };

  const handleDelete = async (id: number) => {
    if (!id) {
      toast.error('ID de cliente no válido');
      return;
    }
    
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        console.log("Eliminando cliente con ID:", id);
        await axios.delete(`${API_URL}/clientes/${id}`);
        
        // Eliminar el cliente del estado local
        setClientes(clientes.filter(cliente => cliente.id !== id));
        toast.success('Cliente eliminado correctamente');
        
        // Si estamos viendo los detalles, cerrar la vista
        if (viewingCliente && viewingCliente.id === id) {
          setViewingCliente(null);
        }
      } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        toast.error('Error al eliminar el cliente');
      }
    }
  };

  const handleView = (cliente: Cliente) => {
    setViewingCliente(cliente);
    setShowForm(false);
  };

  const resetForm = () => {
    setCurrentCliente({
      nombre: '',
      email: '',
      password: '',
      direccion: '',
      telefono: ''
    });
    setIsEditing(false);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D72323]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Clientes</h1>
        <p className="text-gray-600">Administra los clientes registrados en el sistema.</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex justify-end mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#D72323]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Clientes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClientes.length > 0 ? (
                  filteredClientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{cliente.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{cliente.telefono || 'No disponible'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleView(cliente)}
                            className="text-gray-600 hover:text-gray-800"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(cliente)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cliente.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron clientes con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel lateral */}
        <div>
          {viewingCliente && !showForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Detalles del Cliente</h2>
                <button 
                  onClick={() => setViewingCliente(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gray-100 p-6 rounded-full">
                  <User size={40} className="text-gray-600" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nombre completo</h3>
                  <p className="text-lg">{viewingCliente.nombre}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Correo electrónico</h3>
                  <div className="flex items-center">
                    <Mail size={16} className="text-gray-400 mr-2" />
                    <p>{viewingCliente.email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                  <div className="flex items-center">
                    <Phone size={16} className="text-gray-400 mr-2" />
                    <p>{viewingCliente.telefono || 'No proporcionado'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                  <p>{viewingCliente.direccion || 'No proporcionada'}</p>
                </div>
              </div>
              
              <div className="mt-8 flex space-x-3">
                <button
                  onClick={() => handleEdit(viewingCliente)}
                  className="btn-primary flex items-center"
                >
                  <Edit size={18} className="mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(viewingCliente.id)}
                  className="btn-outline flex items-center text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 size={18} className="mr-2" />
                  Eliminar
                </button>
              </div>
            </div>
          )}

          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{isEditing ? 'Editar Cliente' : 'Añadir Cliente'}</h2>
                <button 
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={currentCliente.nombre}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={currentCliente.email}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña {!isEditing && '*'} 
                      {isEditing && <span className="text-xs text-gray-400 ml-1">(Dejar en blanco para mantener la actual)</span>}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={currentCliente.password}
                      onChange={handleInputChange}
                      className="input-field"
                      required={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={currentCliente.telefono || ''}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <textarea
                      id="direccion"
                      name="direccion"
                      value={currentCliente.direccion || ''}
                      onChange={handleInputChange}
                      className="input-field min-h-[80px]"
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-outline"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={submitting}
                  >
                    <Save size={18} className="mr-2" />
                    {submitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {!viewingCliente && !showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center mb-4">
                <User size={48} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Gestión de Clientes</h2>
              <p className="text-gray-600 mb-6">Selecciona un cliente para ver sus detalles o añade uno nuevo.</p>
              <button 
                onClick={() => {
                  setCurrentCliente({
                    nombre: '',
                    email: '',
                    password: '',
                    direccion: '',
                    telefono: ''
                  });
                  setIsEditing(false);
                  setShowForm(true);
                }}
                className="btn-primary flex items-center justify-center mx-auto"
              >
                <User size={18} className="mr-2" />
                Nuevo Cliente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminClientes;