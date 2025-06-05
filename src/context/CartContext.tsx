import React, { createContext, useContext, useState, useEffect } from 'react';

// Definición de tipos
export interface PizzaSize {
  id?: number;            // From some sources
  tamano_id?: number;     // From other sources
  nombre: string;         // Size name
  factor_precio: number;  // Price multiplier
}

export interface Pizza {
  id?: number;            // From database
  pizza_id?: number;      // Alternative ID field name
  nombre: string;         // Name of the pizza
  descripcion?: string;   // Description field
  precio_base: number;    // Base price
  imagen?: string;        // Image URL from demo data
  imagen_url?: string;    // Image URL from database
  categoria_id: number;   // Category ID
  //ingredientes?: string;  // Ingredients list
  disponible?: boolean;   // Availability flag
}

export interface CartItem {
  pizza: Pizza;
  size: PizzaSize;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (pizza: Pizza, size: PizzaSize, quantity: number) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('pizzaCart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart data:', e);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('pizzaCart', JSON.stringify(items));
  }, [items]);

  const addToCart = (pizza: Pizza, size: PizzaSize, quantity: number) => {
    // Verificar si ya existe la misma pizza con el mismo tamaño
    const existingItemIndex = items.findIndex(
      item => item.pizza.pizza_id === pizza.pizza_id && item.size.tamano_id === size.tamano_id
    );

    if (existingItemIndex !== -1) {
      // Actualizar cantidad si ya existe
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      setItems(updatedItems);
    } else {
      // Agregar nuevo item
      setItems([...items, { pizza, size, quantity }]);
    }
  };

  const removeFromCart = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    setItems(updatedItems);
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => 
      total + (item.pizza.precio_base * item.size.factor_precio * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};