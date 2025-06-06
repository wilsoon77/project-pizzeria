import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  // Helper function to get the size ID consistently
  const getSizeId = (size: any) => {
    return size.id || size.tamano_id;
  };

  // Helper function to get pizza images consistently
  const getPizzaImage = (pizza: any) => {
    return pizza.imagen || pizza.imagen_url || "https://images.pexels.com/photos/2271194/pexels-photo-2271194.jpeg?auto=compress&cs=tinysrgb&w=600";
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-8">Añade algunas deliciosas pizzas a tu carrito</p>
        <Link to="/menu" className="btn-primary">
          Ver Menú
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={`${item.pizza.id || item.pizza.pizza_id}-${getSizeId(item.size)}`} className="cart-item-enter">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={getPizzaImage(item.pizza)} 
                          alt={item.pizza.nombre} 
                          className="h-16 w-16 object-cover rounded"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.pizza.nombre}</div>
                          <div className="text-sm text-gray-500">Tamaño: {item.size.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Q{(item.pizza.precio_base * item.size.factor_precio).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-sm text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        Q{(item.pizza.precio_base * item.size.factor_precio * item.quantity).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Eliminar item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <Link to="/menu" className="text-[#D72323] hover:underline inline-flex items-center">
              <ShoppingBag size={16} className="mr-2" /> Continuar comprando
            </Link>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Resumen del pedido</h2>
            
            <div className="mb-4">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>Q{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Gastos de envío</span>
                <span>{getTotalPrice() > 100 ? 'Gratis' : 'Q10.00'}</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="flex justify-between py-2">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">
                    Q{(getTotalPrice() + (getTotalPrice() > 100 ? 0 : 10)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <Link 
              to="/checkout" 
              className="btn-primary w-full py-3 text-center"
            >
              Proceder al pago
            </Link>
            
            <div className="mt-6 text-xs text-gray-500">
              <p>* Los gastos de envío son gratuitos para pedidos superiores a Q100.</p>
              <p>* Los precios incluyen IVA.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;