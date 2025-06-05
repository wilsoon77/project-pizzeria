import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Checkout: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    direccion: user?.direccion || '',
    telefono: user?.telefono || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    if (!customerInfo.nombre || !customerInfo.email || !customerInfo.direccion || !customerInfo.telefono) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      // Format order items for the API - add subtotal
      const orderItems = items.map(item => {
        const precio = item.pizza.precio_base * item.size.factor_precio;
        return {
          pizza_id: item.pizza.id || item.pizza.pizza_id,
          tamano_id: item.size.id || item.size.tamano_id,
          cantidad: item.quantity,
          precio_unitario: precio,
          subtotal: precio * item.quantity // Add subtotal field
        };
      });

      // Use a default customer ID if not logged in or ID is missing
      // Use ID 2 which is your example user account
      const cliente_id = user?.cliente_id || 2;

      // Create order payload with total
      const orderData = {
        cliente_id: cliente_id,
        direccion_entrega: customerInfo.direccion, // Make sure this matches exactly
        telefono_contacto: customerInfo.telefono,  // Make sure this matches exactly
        metodo_pago: paymentMethod,
        total: totalCost,
        items: orderItems
      };

      console.log("Sending order data:", orderData);

      // Send to API
      const response = await axios.post(`${API_URL}/ordenes`, orderData);

      console.log("Order response:", response.data);

      const orden_id = response.data.orden_id;

      clearCart();
      toast.success('¡Pedido realizado con éxito!');
      
      // Redirección actualizada a la página de confirmación de orden
      navigate('/orden-confirmacion', { state: { orden_id, total: totalCost } });
    } catch (error) {
      console.error('Error al realizar el pedido:', error);
      toast.error('Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = getTotalPrice() > 100 ? 0 : 3.99;
  const totalCost = getTotalPrice() + shippingCost;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario de información */}
        <div>
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Información de entrega</h2>

              <div className="mb-4">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={customerInfo.nombre}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección de entrega
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={customerInfo.direccion}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={customerInfo.telefono}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Método de pago</h2>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="tarjeta"
                    name="payment"
                    value="tarjeta"
                    checked={paymentMethod === 'tarjeta'}
                    onChange={() => setPaymentMethod('tarjeta')}
                    className="mr-2"
                  />
                  <label htmlFor="tarjeta" className="text-sm font-medium text-gray-700">
                    Tarjeta de crédito/débito
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="efectivo"
                    name="payment"
                    value="efectivo"
                    checked={paymentMethod === 'efectivo'}
                    onChange={() => setPaymentMethod('efectivo')}
                    className="mr-2"
                  />
                  <label htmlFor="efectivo" className="text-sm font-medium text-gray-700">
                    Pago en efectivo al recibir
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="paypal"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                    className="mr-2"
                  />
                  <label htmlFor="paypal" className="text-sm font-medium text-gray-700">
                    PayPal
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Resumen de la compra */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>

            <div className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <div key={index} className="py-3 flex justify-between">
                  <div>
                    <span className="font-medium">{item.pizza.nombre}</span>
                    <div className="text-sm text-gray-500">
                      {item.quantity} x {item.size.nombre}
                    </div>
                  </div>
                  <div className="font-medium">
                    Q{(item.pizza.precio_base * item.size.factor_precio * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Subtotal</span>
                <span>Q{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Gastos de envío</span>
                <span>{shippingCost === 0 ? 'Gratis' : `Q${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg mt-2">
                <span>Total</span>
                <span>Q{totalCost.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                className="btn-primary w-full py-3 mt-4"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : 'Confirmar pedido'}
              </button>

              <div className="mt-4 text-xs text-gray-500">
                <p>* Al realizar el pedido, aceptas nuestros términos y condiciones de compra.</p>
                <p>* Los precios incluyen IVA.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;