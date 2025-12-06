import axios from 'axios';
const API_URL = 'http://localhost:4000/api';

export const api = {
    login: (storeUrl: string, password: string) => axios.post(`${API_URL}/login`, { storeUrl, password }),
    ingest: (data: any) => axios.post(`${API_URL}/ingest`, data),
    getStats: (tenantId: string, startDate?: string, endDate?: string) =>
        axios.get(`${API_URL}/dashboard/stats`, { params: { tenantId, startDate, endDate } }),
    getChartData: (tenantId: string, startDate?: string, endDate?: string) =>
        axios.get(`${API_URL}/dashboard/chart`, { params: { tenantId, startDate, endDate } }),
    getTopCustomers: (tenantId: string) => axios.get(`${API_URL}/dashboard/top-customers`, { params: { tenantId } }),
    getRecentOrders: (tenantId: string) => axios.get(`${API_URL}/dashboard/recent-orders`, { params: { tenantId } }),
};
