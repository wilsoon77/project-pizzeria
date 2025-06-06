import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Package, Truck, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface OrderDetails {
  id: number;
  cliente_id: number;
  fecha_orden: string;
  estado: string;
  direccion_entrega: string;
  telefono_contacto: string;
  metodo_pago: string;
  total: number;
  items: {
    detalle_id: number;
    pizza_nombre: string;
    tamano: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  factura?: {
    estado_pago: string;
    numero_factura: string;
    monto_total: number;
  };
}

const OrderStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/ordenes/${id}`);
        console.log('Order data:', response.data);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('No se pudo cargar la información del pedido');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D72323]"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-xl">{error || 'Pedido no encontrado'}</div>
        </div>
      </div>
    );
  }

  // Get order status for progress bar
  const statusSteps = ['recibido', 'en preparacion', 'en camino', 'entregado'];
  const currentStepIndex = order && order.estado ? statusSteps.indexOf(order.estado.toLowerCase()) : 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  };

  // Format payment method
  const formatPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'tarjeta': return 'Tarjeta';
      case 'efectivo': return 'Efectivo';
      case 'paypal': return 'PayPal';
      default: return method;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Seguimiento de Pedido #{order.id}</h1>
      <p className="text-gray-600 text-center mb-8">Gracias por tu compra. Aquí puedes ver el estado de tu pedido.</p>

      {/* Order Status Progress */}
      <div className="relative mb-12">
        <div className="h-1 bg-gray-200 absolute top-6 left-0 right-0 z-0">
          <div 
            className="h-1 bg-[#D72323]" 
            style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between relative z-10">
          <div className={`flex flex-col items-center ${currentStepIndex >= 0 ? 'text-[#D72323]' : 'text-gray-400'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentStepIndex >= 0 ? 'bg-[#D72323] text-white' : 'bg-gray-200'
            }`}>
              <ShoppingBag size={20} />
            </div>
            <span className="mt-2 text-sm">Pedido recibido</span>
          </div>

          <div className={`flex flex-col items-center ${currentStepIndex >= 1 ? 'text-[#D72323]' : 'text-gray-400'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentStepIndex >= 1 ? 'bg-[#D72323] text-white' : 'bg-gray-200'
            }`}>
              <Package size={20} />
            </div>
            <span className="mt-2 text-sm">En preparación</span>
          </div>

          <div className={`flex flex-col items-center ${currentStepIndex >= 2 ? 'text-[#D72323]' : 'text-gray-400'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentStepIndex >= 2 ? 'bg-[#D72323] text-white' : 'bg-gray-200'
            }`}>
              <Truck size={20} />
            </div>
            <span className="mt-2 text-sm">En camino</span>
          </div>

          <div className={`flex flex-col items-center ${currentStepIndex >= 3 ? 'text-[#D72323]' : 'text-gray-400'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentStepIndex >= 3 ? 'bg-[#D72323] text-white' : 'bg-gray-200'
            }`}>
              <CheckCircle size={20} />
            </div>
            <span className="mt-2 text-sm">Entregado</span>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Detalles del pedido</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-b pb-2">
            <p className="text-gray-600">Número de pedido</p>
            <p className="font-medium">{order.id}</p>
          </div>
          
          <div className="border-b pb-2">
            <p className="text-gray-600">Fecha</p>
            <p className="font-medium">{formatDate(order.fecha_orden)}</p>
          </div>
          
          <div className="border-b pb-2">
            <p className="text-gray-600">Estado</p>
            <p className="font-medium capitalize">{order.estado.replace('_', ' ')}</p>
          </div>
          
          <div className="border-b pb-2">
            <p className="text-gray-600">Método de pago</p>
            <p className="font-medium">{formatPaymentMethod(order.metodo_pago)}</p>
          </div>
          
          <div className="border-b pb-2">
            <p className="text-gray-600">Estado del pago</p>
            <p className={`font-medium ${
              order.factura?.estado_pago === 'completado' ? 'text-green-600' : 
              order.factura?.estado_pago === 'pendiente' ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {order.factura?.estado_pago === 'completado' ? 'Completado' : 
               order.factura?.estado_pago === 'pendiente' ? 'Pendiente' : 'No disponible'}
            </p>
          </div>
          
          <div className="border-b pb-2">
            <p className="text-gray-600">Dirección de entrega</p>
            <p className="font-medium">{order.direccion_entrega}</p>
          </div>
        </div>
        
        {order.items && order.items.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold mb-2">Items del pedido</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Producto</th>
                    <th className="px-4 py-2 text-right">Cant.</th>
                    <th className="px-4 py-2 text-right">Precio</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.detalle_id}>
                      <td className="px-4 py-2">
                        <div className="font-medium">{item.pizza_nombre}</div>
                        <div className="text-gray-600 text-xs">{item.tamano}</div>
                      </td>
                      <td className="px-4 py-2 text-right">{item.cantidad}</td>
                      <td className="px-4 py-2 text-right">Q{item.precio_unitario.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-medium">Q{item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right font-bold">Total</td>
                    <td className="px-4 py-2 text-right font-bold">Q{order.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;