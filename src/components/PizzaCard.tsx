import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Pizza, PizzaSize, useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface PizzaCardProps {
  pizza: Pizza;
  sizes: PizzaSize[];
}

const PizzaCard: React.FC<PizzaCardProps> = ({ pizza, sizes }) => {
  const [selectedSize, setSelectedSize] = useState<PizzaSize>(sizes[0] || { id: 1, tamano_id: 1, nombre: 'Personal', factor_precio: 1 });
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Get pizza ID consistently
  const getPizzaId = () => {
    return pizza.id || pizza.pizza_id || 0;
  };

  const handleAddToCart = () => {
    addToCart(pizza, selectedSize, quantity);
    toast.success(`${pizza.nombre} añadida al carrito`);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Calcular precio con el factor del tamaño
  const calculatePrice = (basePrice: number, factor: number) => {
    return (basePrice * factor).toFixed(2);
  };

  // Get the correct ID from the size object
  const getSizeId = (size: PizzaSize) => {
    // Handle both possible property names
    return size.id || size.tamano_id || 0;
  };
  
  // Get the pizza image URL
  const getPizzaImage = () => {
    // First try imagen (from database), then imagen_url (from context), then fallback
    return pizza.imagen || pizza.imagen_url || "https://images.pexels.com/photos/2271194/pexels-photo-2271194.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
  };

  return (
    <div className="pizza-card group">
      <div className="relative overflow-hidden h-48">
        <img 
          src={getPizzaImage()} 
          alt={pizza.nombre} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-1">{pizza.nombre}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pizza.descripcion}</p>
        
        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium mb-1">Tamaño:</label>
          <div className="flex space-x-2">
            {sizes.map((size) => (
              <button
                key={getSizeId(size)}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                  getSizeId(selectedSize) === getSizeId(size)
                    ? 'bg-[#D72323] text-white border-[#D72323]'
                    : 'border-gray-300 hover:border-[#D72323]'
                }`}
              >
                {size.nombre}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold">
            Q{calculatePrice(pizza.precio_base, selectedSize.factor_precio)}
          </p>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-full overflow-hidden">
              <button 
                onClick={decrementQuantity}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="px-3">{quantity}</span>
              <button 
                onClick={incrementQuantity}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="btn-primary p-2 rounded-full"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaCard;