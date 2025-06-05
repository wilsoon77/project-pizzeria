import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import PizzaCard from '../components/PizzaCard';
import { Pizza, PizzaSize } from '../context/CartContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Interface definitions
interface Categoria {
  id: number;  // Changed from categoria_id to match your database
  nombre: string;
}

const Menu: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [sizes, setSizes] = useState<PizzaSize[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from API...');

        // Get real data from the API
        const categoriasResponse = await axios.get(`${API_URL}/categorias`);
        const pizzasResponse = await axios.get(`${API_URL}/pizzas`);
        const sizesResponse = await axios.get(`${API_URL}/tamanos`); // Note: changed from 'tamaños' to 'tamanos'

        console.log('Categories:', categoriasResponse.data);
        console.log('Pizzas:', pizzasResponse.data);
        console.log('Sizes:', sizesResponse.data);

        // Add "All" category and set the categories
        setCategorias([{ id: 0, nombre: 'Todas' }, ...categoriasResponse.data]);

        // Inside your useEffect function, replace this:
        // Set pizzas from API response
        setPizzas(pizzasResponse.data);

        // With this mapping code:
        // Map pizza data to ensure it matches our interface
        const mappedPizzas = pizzasResponse.data.map((pizza: any) => ({
          id: pizza.id,
          pizza_id: pizza.id, // Add both ID formats for compatibility
          nombre: pizza.nombre,
          descripcion: pizza.descripcion,
          precio_base: pizza.precio_base,
          imagen: pizza.imagen_url, // Map imagen_url to imagen
          imagen_url: pizza.imagen_url, // Keep original field too
          categoria_id: pizza.categoria_id,
          //ingredientes: pizza.ingredientes,
          disponible: pizza.disponible
        }));

        // Set mapped pizzas
        setPizzas(mappedPizzas);

        // Set sizes from API response
        setSizes(sizesResponse.data.map((size: any) => ({
          tamano_id: size.id,
          nombre: size.nombre,
          factor_precio: size.factor_precio
        })));

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error al cargar los datos. Por favor, intente de nuevo más tarde.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar pizzas por categoría y término de búsqueda
  const filteredPizzas = pizzas.filter(pizza => {
    const matchesCategory = selectedCategoria === 0 || pizza.categoria_id === selectedCategoria;
    const matchesSearch =
      pizza.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pizza.descripcion && pizza.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D72323]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500 text-center">
          <p className="text-xl">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#D72323] text-white rounded-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Nuestro Menú de Pizzas</h1>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div className="flex flex-wrap gap-2">
          {categorias.map(categoria => (
            <button
              key={categoria.id}
              onClick={() => setSelectedCategoria(categoria.id)}
              className={`px-4 py-2 rounded-full transition-colors ${selectedCategoria === categoria.id
                  ? 'bg-[#D72323] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar pizzas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#D72323]"
          />
        </div>
      </div>

      {/* Grid de pizzas */}
      {filteredPizzas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPizzas.map(pizza => (
            <PizzaCard key={pizza.pizza_id || pizza.id} pizza={pizza} sizes={sizes} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No se encontraron pizzas con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
};

export default Menu;