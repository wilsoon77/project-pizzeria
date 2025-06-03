import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Interfaces para los datos de estadísticas
export interface RevenueData {
  name: string;
  value: number;
}

export interface OrdersPerDayData {
  name: string;
  value: number;
}

export interface CategorySalesData {
  name: string;
  value: number;
}

export interface RecentOrder {
  id: number;
  cliente: string;
  total: number;
  fecha: string;
  estado: string;
}

export interface StatsSummary {
  ingresos: { valor: number; porcentajeCambio: number; };
  pedidos: { valor: number; porcentajeCambio: number; };
  nuevosClientes: { valor: number; porcentajeCambio: number; };
  ticketPromedio: { valor: number; porcentajeCambio: number; };
}

// Funciones para obtener datos
export const fetchRevenue = async (): Promise<RevenueData[]> => {
  try {
    const response = await axios.get(`${API_URL}/stats/ingresos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

export const fetchOrdersPerDay = async (): Promise<OrdersPerDayData[]> => {
  try {
    const response = await axios.get(`${API_URL}/stats/pedidos-por-dia`);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders per day:', error);
    throw error;
  }
};

export const fetchCategorySales = async (): Promise<CategorySalesData[]> => {
  try {
    const response = await axios.get(`${API_URL}/stats/ventas-por-categoria`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category sales:', error);
    throw error;
  }
};

export const fetchRecentOrders = async (): Promise<RecentOrder[]> => {
  try {
    const response = await axios.get(`${API_URL}/stats/pedidos-recientes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

export const fetchStatsSummary = async (): Promise<StatsSummary> => {
  try {
    const response = await axios.get(`${API_URL}/stats/resumen`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    throw error;
  }
};