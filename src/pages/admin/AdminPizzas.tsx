import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Definimos nuestra propia interfaz Pizza específica para el admin
interface Pizza {
  id: number;         // Cambiado de pizza_id a id
  nombre: string;
  descripcion: string;
  precio_base: number;
  categoria_id: number;
  imagen_url?: string;
}

interface PizzaFormData extends Omit<Pizza, 'id'> {
  id?: number;
}

interface Categoria {
  categoria_id: number;
  nombre: string;
}

const AdminPizzas: React.FC = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentPizza, setCurrentPizza] = useState<PizzaFormData>({
    nombre: '',
    descripcion: '',
    precio_base: 0,
    categoria_id: 1,
    imagen_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Función auxiliar para manejar URLs de imágenes
  const getImageUrl = (pizza: Pizza): string => {
    if (pizza.imagen_url) return pizza.imagen_url;
    return "https://via.placeholder.com/150?text=No-Image";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Realizar peticiones paralelas para mejorar rendimiento
        const [categoriasResponse, pizzasResponse] = await Promise.all([
          axios.get(`${API_URL}/categorias`),
          axios.get(`${API_URL}/pizzas`)
        ]);

        // Mapear las categorías para que categoria_id sea igual a id
        const mappedCategorias = categoriasResponse.data.map((categoria: any) => ({
          categoria_id: categoria.id,  // Aquí es donde hacemos la transformación
          id: categoria.id,            // Mantenemos el id original también por si acaso
          nombre: categoria.nombre
        }));

        setCategorias(mappedCategorias);

        // Mapear los datos si es necesario para asegurar compatibilidad
        const mappedPizzas = pizzasResponse.data;


        setPizzas(mappedPizzas);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        toast.error('No se pudieron cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPizzas = pizzas.filter(pizza =>
    pizza.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pizza.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'precio_base') {
      setCurrentPizza({
        ...currentPizza,
        [name]: parseFloat(value) || 0
      });
    } else if (name === 'categoria_id') {
      setCurrentPizza({
        ...currentPizza,
        [name]: parseInt(value, 10)
      });
    } else if (name === 'imagen') {
      // Si se está actualizando la imagen, actualizar también imagen_url
      setCurrentPizza({
        ...currentPizza,
        imagen_url: value
      });
    } else {
      setCurrentPizza({
        ...currentPizza,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPizza.nombre || !currentPizza.descripcion || currentPizza.precio_base <= 0) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);

      // Preparar datos para enviar - asegurarse que imagen_url esté establecido
      const pizzaToSave = {
        ...currentPizza,
        imagen_url: currentPizza.imagen_url
      };

      if (isEditing && currentPizza.id) {
        // Actualizar pizza existente
        await axios.put(`${API_URL}/pizzas/${currentPizza.id}`, currentPizza);

        // Actualizar la pizza en el estado local
        setPizzas(pizzas.map(pizza =>
          pizza.id === currentPizza.id ? { ...currentPizza as Pizza } : pizza
        ));

        toast.success('Pizza actualizada correctamente');
      } else {
        // Crear nueva pizza
        const response = await axios.post(`${API_URL}/pizzas`, pizzaToSave);
        const newPizza = response.data;

        setPizzas([...pizzas, newPizza]);
        toast.success('Pizza creada correctamente');
      }

      resetForm();
    } catch (error) {
      console.error('Error al guardar la pizza:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pizza: Pizza) => {
    // Ya no necesitamos remapear los campos
    setCurrentPizza(pizza);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
  // Verificar que el ID no sea undefined
  if (!id) {
    toast.error('ID de pizza no válido');
    return;
  }

  if (window.confirm('¿Estás seguro de que deseas eliminar esta pizza?')) {
    try {
      console.log("Intentando eliminar pizza con ID:", id);
      await axios.delete(`${API_URL}/pizzas/${id}`);
      
      // Eliminar la pizza del estado local
      setPizzas(pizzas.filter(pizza => pizza.id !== id));
      toast.success('Pizza eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar la pizza:', error);
      toast.error('Error al eliminar la pizza');
    }
  }
};

  const resetForm = () => {
    setCurrentPizza({
      nombre: '',
      descripcion: '',
      precio_base: 0,
      categoria_id: 1,
      imagen_url: ''
    });
    setIsEditing(false);
    setShowForm(false);
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
        <h1 className="text-3xl font-bold mb-2">Gestión de Pizzas</h1>
        <p className="text-gray-600">Administra el menú de pizzas disponibles.</p>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex items-center">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus size={20} className="mr-2" /> Añadir Pizza
          </button>
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

      {/* Formulario de Pizza */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{isEditing ? 'Editar Pizza' : 'Añadir Nueva Pizza'}</h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={currentPizza.nombre}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  id="categoria_id"
                  name="categoria_id"
                  value={currentPizza.categoria_id}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  {categorias.map(categoria => (
                    <option key={categoria.categoria_id} value={categoria.categoria_id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="precio_base" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Base (Q) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="precio_base"
                  name="precio_base"
                  value={currentPizza.precio_base}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Imagen
                </label>
                <input
                  type="text"
                  id="imagen"
                  name="imagen"
                  value={currentPizza.imagen_url || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={currentPizza.descripcion}
                  onChange={handleInputChange}
                  className="input-field min-h-[100px]"
                  required
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="btn-outline"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={submitting}
              >
                <Save size={20} className="mr-2" />
                {submitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Pizzas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Base</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPizzas.length > 0 ? (
                filteredPizzas.map((pizza) => (
                  <tr key={pizza.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={getImageUrl(pizza)}
                        alt={pizza.nombre}
                        className="h-12 w-12 rounded object-cover"
                        onError={(e) => {
                          console.log(`Error cargando imagen: ${getImageUrl(pizza)}`);
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Pizza";
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{pizza.nombre}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{pizza.descripcion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {categorias.find(c => c.categoria_id === pizza.categoria_id)?.nombre || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Q{pizza.precio_base.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(pizza)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(pizza.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron pizzas con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPizzas;