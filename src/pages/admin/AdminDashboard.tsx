import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, Users, ShoppingBag, PieChart, TrendingUp, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartPieChart, Pie, Cell } from 'recharts';
import { 
  fetchRevenue, 
  fetchOrdersPerDay, 
  fetchCategorySales, 
  fetchRecentOrders, 
  fetchStatsSummary,
  RevenueData,
  OrdersPerDayData,
  CategorySalesData,
  RecentOrder,
  StatsSummary
} from '../../api/statsApi';

const COLORS = ['#D72323', '#39B54A', '#FFC107', '#4A90E2'];

interface StatCardProps {
  title: string;
  value: string;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, percentage, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`flex items-center ${percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {percentage >= 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {Math.abs(percentage)}%
        </span>
        <span className="text-gray-500 text-sm ml-2">vs mes anterior</span>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los datos del dashboard
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [ordersData, setOrdersData] = useState<OrdersPerDayData[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategorySalesData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [statsResumen, setStatsResumen] = useState<StatsSummary>({
    ingresos: { valor: 0, porcentajeCambio: 0 },
    pedidos: { valor: 0, porcentajeCambio: 0 },
    nuevosClientes: { valor: 0, porcentajeCambio: 0 },
    ticketPromedio: { valor: 0, porcentajeCambio: 0 }
  });

  // Función para formatear moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2
    }).format(value);
  };

  useEffect(() => {
    // Función para cargar los datos del dashboard
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar todos los datos en paralelo para mayor eficiencia
        const [
          ingresos,
          pedidosPorDia,
          ventasPorCategoria,
          resumen,
          pedidosRecientes
        ] = await Promise.all([
          fetchRevenue(),
          fetchOrdersPerDay(),
          fetchCategorySales(),
          fetchStatsSummary(),
          fetchRecentOrders()
        ]);
        
        // Actualizar todos los estados con los datos recibidos
        setRevenueData(ingresos);
        setOrdersData(pedidosPorDia);
        setCategoriesData(ventasPorCategoria);
        setStatsResumen(resumen);
        setRecentOrders(pedidosRecientes);
        
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('Error al cargar los datos. Verifica tu conexión y permisos.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D72323]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al panel de administración de PizzaDelicia.</p>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Ingresos mensuales" 
          value={formatCurrency(statsResumen.ingresos.valor)} 
          percentage={statsResumen.ingresos.porcentajeCambio} 
          icon={<TrendingUp className="h-6 w-6 text-white" />} 
          color="bg-[#D72323]"
        />
        
        <StatCard 
          title="Total de pedidos" 
          value={statsResumen.pedidos.valor.toString()} 
          percentage={statsResumen.pedidos.porcentajeCambio} 
          icon={<ShoppingBag className="h-6 w-6 text-white" />} 
          color="bg-[#39B54A]"
        />
        
        <StatCard 
          title="Nuevos clientes" 
          value={statsResumen.nuevosClientes.valor.toString()} 
          percentage={statsResumen.nuevosClientes.porcentajeCambio} 
          icon={<Users className="h-6 w-6 text-white" />} 
          color="bg-[#4A90E2]"
        />
        
        <StatCard 
          title="Ticket promedio" 
          value={formatCurrency(statsResumen.ticketPromedio.valor)} 
          percentage={statsResumen.ticketPromedio.porcentajeCambio} 
          icon={<CreditCard className="h-6 w-6 text-white" />} 
          color="bg-[#FFC107]"
        />
      </div>

      {/* Gráfico de ingresos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Ingresos por mes</h2>
            <select className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D72323]">
              <option>Este año</option>
              <option>Último año</option>
              <option>Últimos 6 meses</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tickFormatter={(value) => `Q${value}`} tick={{fontSize: 12}} />
                <Tooltip formatter={(value) => [`Q${value}`, 'Ingresos']} />
                <Line type="monotone" dataKey="value" stroke="#D72323" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Ventas por categoría</h2>
          <div className="h-80 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <RechartPieChart>
                <Pie
                  data={categoriesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
              </RechartPieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              {categoriesData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pedidos por día y pedidos recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Pedidos por día</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip formatter={(value) => [`${value} pedidos`, 'Cantidad']} />
                <Bar dataKey="value" fill="#39B54A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Pedidos recientes</h2>
            <Link to="/admin/ordenes" className="text-[#D72323] hover:underline text-sm">
              Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left">
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 font-semibold">ID</th>
                  <th className="py-3 font-semibold">Cliente</th>
                  <th className="py-3 font-semibold">Total</th>
                  <th className="py-3 font-semibold">Fecha</th>
                  <th className="py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3">#{order.id}</td>
                    <td className="py-3">{order.cliente}</td>
                    <td className="py-3">Q{Number(order.total).toFixed(2)}</td>
                    <td className="py-3">{new Date(order.fecha).toLocaleDateString('es-ES')}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.estado === 'entregado' 
                          ? 'bg-green-100 text-green-800' 
                          : order.estado === 'en camino' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.estado === 'en preparacion' ? 'En preparación' : order.estado}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      No hay pedidos recientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/pizzas" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-[#D72323] p-3 rounded-full">
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Gestionar Pizzas</h3>
              <p className="text-gray-600 text-sm">Administra el menú de pizzas</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/clientes" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-[#39B54A] p-3 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Gestionar Clientes</h3>
              <p className="text-gray-600 text-sm">Ver y administrar clientes</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/ordenes" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-[#4A90E2] p-3 rounded-full">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Gestionar Ordenes</h3>
              <p className="text-gray-600 text-sm">Ver y gestionar los pedidos</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
