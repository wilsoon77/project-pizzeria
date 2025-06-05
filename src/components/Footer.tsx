import React from 'react';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Columna 1: Info de contacto */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone size={20} className="mr-2 text-[#D72323]" />
                <span>+(502) 7839-5678</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-[#D72323]" />
                <span>info@pizzadelicia.com</span>
              </li>
             <li className="flex items-start">
                <MapPin size={20} className="mr-2 mt-0.5 min-w-[20px] text-[#D72323]" />
                <span>3ra Calle 4-42 Zona 1, Chimaltenango, Guatemala</span>
              </li>
              <li className="flex items-center">
                <Clock size={18} className="mr-2 text-[#D72323]" />
                <span>Lun-Dom: 11:00 - 23:00</span>
              </li>
            </ul>
          </div>

          {/* Columna 2: Links útiles */}
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-[#D72323] transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-[#D72323] transition-colors">Menú</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#D72323] transition-colors">Carrito</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#D72323] transition-colors">Mi cuenta</Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Redes sociales */}
          <div>
            <h3 className="text-xl font-bold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="#" className="bg-white text-gray-900 hover:bg-[#D72323] hover:text-white p-2 rounded-full transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-white text-gray-900 hover:bg-[#D72323] hover:text-white p-2 rounded-full transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-white text-gray-900 hover:bg-[#D72323] hover:text-white p-2 rounded-full transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="bg-white text-gray-900 hover:bg-[#D72323] hover:text-white p-2 rounded-full transition-colors">
                <Youtube size={20} />
              </a>
            </div>
            <p className="mt-4">Mantente actualizado con nuestras últimas promociones y novedades.</p>
          </div>

          {/* Columna 4: Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4">Boletín de noticias</h3>
            <p className="mb-4">Suscríbete para recibir ofertas exclusivas.</p>
            <form className="flex flex-col space-y-2">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="px-4 py-2 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D72323]"
              />
              <button 
                type="submit" 
                className="bg-[#D72323] text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6">
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} Wilson - PizzaDelicia. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;