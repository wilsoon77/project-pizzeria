import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, FileText, ShoppingBag, ArrowDown, ArrowUp, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface DetalleOrden {
  detalle_id: number;
  orden_id: number;
  pizza_id: number;
  pizza_nombre: string;
  tamano_id: number; // Corregido: cambiado de 'tamaño' a 'tamano_id'
  cantidad: number;
  precio_unitario: number;
}

interface Orden {
  orden_id: number;
  cliente_id: number;
  cliente_nombre: string;
  fecha: string;
  estado: string; // Cambiado de un tipo específico a string genérico
  metodo_pago: string;
  direccion_entrega: string;
  telefono_contacto: string;
  total: number;
  items: DetalleOrden[];
}

const AdminOrdenes: React.FC = () => {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [ordenarPor, setOrdenarPor] = useState<string>('fecha');
  const [ordenDesc, setOrdenDesc] = useState<boolean>(true);
  const [facturasGeneradas, setFacturasGeneradas] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchOrdenes();
  }, []);

const fetchOrdenes = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${API_URL}/ordenes`);
    
    // Transformar los datos para corregir el formato
    const ordenesFormateadas = response.data.map((orden: any) => {
      // Corregir el campo estado que viene como array
      const estadoCorregido = Array.isArray(orden.estado) 
        ? orden.estado[0] // Tomar el primer valor si es un array
        : (orden.estado || 'desconocido');
        
      return {
        ...orden,
        estado: estadoCorregido
      };
    });
    
    console.log('Órdenes formateadas:', ordenesFormateadas[0]);
    setOrdenes(ordenesFormateadas);
  } catch (error) {
    console.error('Error al cargar las órdenes:', error);
    toast.error('No se pudieron cargar las órdenes');
  } finally {
    setLoading(false);
  }
};

  const handleActualizarEstado = async (orden_id: number, nuevoEstado: Orden['estado']) => {
    try {
      const response = await axios.patch(`${API_URL}/ordenes/${orden_id}`, { estado: nuevoEstado });
      
      // Actualizar el estado en el array local
      const ordenesActualizadas = ordenes.map(orden => 
        orden.orden_id === orden_id ? { ...orden, estado: nuevoEstado } : orden
      );
      
      setOrdenes(ordenesActualizadas);
      
      if (selectedOrden && selectedOrden.orden_id === orden_id) {
        setSelectedOrden({ ...selectedOrden, estado: nuevoEstado });
      }
      
      toast.success(`Estado de la orden #${orden_id} actualizado a: ${formatEstado(nuevoEstado)}`);
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      toast.error('Error al actualizar el estado de la orden');
    }
  };

  

  const handleGenerarFactura = async (orden_id: number) => {
    try {
      const response = await axios.post(`${API_URL}/facturas/generar/${orden_id}`);
      
      // Si la operación fue exitosa
      if (response.data) {
        // Si ya existía una factura
        if (response.data.message === 'La factura ya existe') {
          toast.success(`La factura #${response.data.factura_id} ya existe por un monto de ${response.data.monto_total.toFixed(2)}Q`);
        } else {
          // Si se generó una nueva factura
          toast.success(`Factura #${response.data.factura_id} generada por ${response.data.monto_total.toFixed(2)}Q`);
        }
        
        // Marcar esta orden como facturada en el estado local
        setFacturasGeneradas(prev => ({
          ...prev,
          [orden_id]: true
        }));
      }
    } catch (error) {
      console.error('Error al generar la factura:', error);
      toast.error('Error al generar la factura');
    }
  };

  const filteredOrdenes = ordenes
    .filter(orden => {
      // Filtro por búsqueda
      const matchesSearch = 
        orden.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.orden_id.toString().includes(searchTerm);
      
      // Filtro por estado
      const matchesEstado = filtroEstado === 'todos' || orden.estado === filtroEstado;
      
      return matchesSearch && matchesEstado;
    })
    .sort((a, b) => {
      // Ordenamiento
      if (ordenarPor === 'fecha') {
        return ordenDesc 
          ? new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          : new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      } else if (ordenarPor === 'total') {
        return ordenDesc ? b.total - a.total : a.total - b.total;
      } else if (ordenarPor === 'orden_id') {
        return ordenDesc ? b.orden_id - a.orden_id : a.orden_id - b.orden_id;
      }
      return 0;
    });

  // Función para formatear la fecha
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

// Función para obtener el color del estado
const getEstadoColor = (estado: Orden['estado']) => {
  if (!estado || typeof estado !== 'string') {
    return 'bg-gray-100 text-gray-800';
  }
  
  switch (estado.toLowerCase()) {
    case 'recibido':
      return 'bg-blue-100 text-blue-800';
    case 'en preparacion':
      return 'bg-yellow-100 text-yellow-800';
    case 'en camino':
      return 'bg-indigo-100 text-indigo-800';
    case 'entregado':
      return 'bg-green-100 text-green-800';
    case 'cancelado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

 // Función para formatear el estado para mostrar
const formatEstado = (estado: Orden['estado']) => {
  // Verificar que estado sea un string
  if (!estado || typeof estado !== 'string') {
    return 'Desconocido';
  }
  
  switch (estado.toLowerCase()) {
    case 'en preparacion':
      return 'En preparación';
    default:
      return estado.charAt(0).toUpperCase() + estado.slice(1);
  }
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
        <h1 className="text-3xl font-bold mb-2">Gestión de Órdenes</h1>
        <p className="text-gray-600">Administra y monitorea los pedidos de los clientes.</p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#D72323]"
            >
              <option value="todos">Todos los estados</option>
              <option value="recibido">Recibido</option>
              <option value="en preparacion">En preparación</option>
              <option value="en camino">En camino</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-full md:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72323]"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Ordenar por:</span>
          <select
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D72323]"
          >
            <option value="fecha">Fecha</option>
            <option value="total">Total</option>
            <option value="orden_id">Número de orden</option>
          </select>
          
          <button 
            onClick={() => setOrdenDesc(!ordenDesc)}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
            title={ordenDesc ? "Orden descendente" : "Orden ascendente"}
          >
            {ordenDesc ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de Órdenes */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrdenes.length > 0 ? (
                  filteredOrdenes.map((orden) => (
                    <tr 
                      key={orden.orden_id} 
                      className={`hover:bg-gray-50 ${selectedOrden?.orden_id === orden.orden_id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{orden.orden_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{orden.cliente_nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatFecha(orden.fecha)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Q{orden.total.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(orden.estado)}`}>
                          {formatEstado(orden.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setSelectedOrden(orden)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleGenerarFactura(orden.orden_id)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Generar factura"
                          >
                            <FileText size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron órdenes con los criterios seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de detalles */}
        <div>
          {selectedOrden ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Orden #{selectedOrden.orden_id}</h2>
                <button 
                  onClick={() => setSelectedOrden(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Información general</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">{selectedOrden.cliente_nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">{formatFecha(selectedOrden.fecha)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(selectedOrden.estado)}`}>
                      {formatEstado(selectedOrden.estado)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Método de pago</p>
                    <p className="font-medium capitalize">{selectedOrden.metodo_pago}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono de contacto</p>
                    <p className="font-medium">{selectedOrden.telefono_contacto || 'No especificado'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Dirección de entrega</p>
                    <p className="font-medium">{selectedOrden.direccion_entrega || 'No especificada'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Productos</h3>
                <div className="space-y-3">
                  {selectedOrden.items && selectedOrden.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{item.pizza_nombre}</p>
                        <p className="text-sm text-gray-500">
                          Tamaño #{item.tamano_id} x {item.cantidad}
                        </p>
                      </div>
                      <p className="font-medium">Q{(item.precio_unitario * item.cantidad).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                  <p className="font-bold">Total</p>
                  <p className="font-bold">Q{selectedOrden.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Actualizar estado</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleActualizarEstado(selectedOrden.orden_id, 'recibido')}
                    className={`px-3 py-1 rounded text-xs font-medium border ${selectedOrden.estado === 'recibido' ? 'bg-blue-500 text-white' : 'border-blue-500 text-blue-500 hover:bg-blue-50'}`}
                  >
                    Recibido
                  </button>
                  <button
                    onClick={() => handleActualizarEstado(selectedOrden.orden_id, 'en preparacion')}
                    className={`px-3 py-1 rounded text-xs font-medium border ${selectedOrden.estado === 'en preparacion' ? 'bg-yellow-500 text-white' : 'border-yellow-500 text-yellow-500 hover:bg-yellow-50'}`}
                  >
                    En preparación
                  </button>
                  <button
                    onClick={() => handleActualizarEstado(selectedOrden.orden_id, 'en camino')}
                    className={`px-3 py-1 rounded text-xs font-medium border ${selectedOrden.estado === 'en camino' ? 'bg-indigo-500 text-white' : 'border-indigo-500 text-indigo-500 hover:bg-indigo-50'}`}
                  >
                    En camino
                  </button>
                  <button
                    onClick={() => handleActualizarEstado(selectedOrden.orden_id, 'entregado')}
                    className={`px-3 py-1 rounded text-xs font-medium border ${selectedOrden.estado === 'entregado' ? 'bg-green-500 text-white' : 'border-green-500 text-green-500 hover:bg-green-50'}`}
                  >
                    Entregado
                  </button>
                  <button
                    onClick={() => handleActualizarEstado(selectedOrden.orden_id, 'cancelado')}
                    className={`px-3 py-1 rounded text-xs font-medium border ${selectedOrden.estado === 'cancelado' ? 'bg-red-500 text-white' : 'border-red-500 text-red-500 hover:bg-red-50'}`}
                  >
                    Cancelado
                  </button>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleGenerarFactura(selectedOrden.orden_id)}
                  className="btn-primary w-full flex items-center justify-center"
                  disabled={facturasGeneradas[selectedOrden.orden_id]}
                >
                  <Download size={18} className="mr-2" />
                  {facturasGeneradas[selectedOrden.orden_id] 
                    ? 'Factura ya generada' 
                    : 'Generar factura'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center mb-4">
                <ShoppingBag size={48} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Detalles de la orden</h2>
              <p className="text-gray-600">
                Selecciona una orden de la lista para ver sus detalles y gestionarla.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrdenes;