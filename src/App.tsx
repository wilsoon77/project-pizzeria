import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Páginas
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderStatus from './pages/OrderStatus';

// Páginas de Administración - fix folder casing to match your actual folder structure
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPizzas from './pages/admin/AdminPizzas';
import AdminClientes from './pages/admin/AdminClientes';
import AdminOrdenes from './pages/admin/AdminOrdenes';

// Componentes
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import OrdenConfirmacion from './pages/OrdenConfirmacion'; // Ajusta según el nombre que hayas elegido


// Contexto
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Toaster position="top-center" />
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/orden/:id" element={<OrderStatus />} />

                <Route path="/orden-confirmacion" element={<OrdenConfirmacion />} />

                {/* Rutas de Administración */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/pizzas" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPizzas />
                  </ProtectedRoute>
                } />
                <Route path="/admin/clientes" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminClientes />
                  </ProtectedRoute>
                } />
                <Route path="/admin/ordenes" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminOrdenes />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;