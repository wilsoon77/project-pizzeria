import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Home, PizzaIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <PizzaIcon className="h-8 w-8 text-[#D72323]" />
            <span className="text-2xl font-bold text-[#D72323]">PizzaDelicia</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="nav-link font-medium">Inicio</Link>
            <Link to="/menu" className="nav-link font-medium">Menú</Link>
            {isAdmin() && (
              <Link to="/admin" className="nav-link font-medium">Administración</Link>
            )}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.nombre}</span>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-[#D72323] transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 text-gray-700 hover:text-[#D72323] transition-colors">
                <User size={20} />
                <span>Iniciar sesión</span>
              </Link>
            )}

            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-[#D72323] transition-colors" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D72323] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Link to="/" className="nav-link py-2 flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
              <Home size={20} />
              <span>Inicio</span>
            </Link>
            <Link to="/menu" className="nav-link py-2 flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
              <PizzaIcon size={20} />
              <span>Menú</span>
            </Link>
            <Link to="/cart" className="nav-link py-2 flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
              <ShoppingCart size={20} />
              <span>Carrito ({getTotalItems()})</span>
            </Link>
            
            {isAdmin() && (
              <Link to="/admin" className="nav-link py-2 flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                <User size={20} />
                <span>Administración</span>
              </Link>
            )}

            {user ? (
              <>
                <div className="py-2 text-gray-700">
                  <span>Hola, {user.nombre}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="nav-link py-2 flex items-center space-x-2"
                >
                  <LogOut size={20} />
                  <span>Cerrar sesión</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-link py-2 flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                <User size={20} />
                <span>Iniciar sesión</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;