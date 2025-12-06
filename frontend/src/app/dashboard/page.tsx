'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShoppingBag, DollarSign, Calendar, LogOut } from 'lucide-react';

export default function Dashboard() {
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [topCustomers, setTopCustomers] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [dateRange, setDateRange] = useState('all'); // all, 7d, 30d

    useEffect(() => {
        const id = localStorage.getItem('tenantId');
        if (!id) {
            router.push('/');
        } else {
            setTenantId(id);
        }
    }, [router]);

    useEffect(() => {
        if (!tenantId) return;
        fetchData();
    }, [tenantId, dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let startDate = undefined;
            let endDate = new Date().toISOString();

            if (dateRange === '7d') {
                const d = new Date();
                d.setDate(d.getDate() - 7);
                startDate = d.toISOString();
            } else if (dateRange === '30d') {
                const d = new Date();
                d.setDate(d.getDate() - 30);
                startDate = d.toISOString();
            }

            const [statsRes, chartRes, customersRes, ordersRes] = await Promise.all([
                api.getStats(tenantId!, startDate, endDate),
                api.getChartData(tenantId!, startDate, endDate),
                api.getTopCustomers(tenantId!),
                api.getRecentOrders(tenantId!)
            ]);

            setStats(statsRes.data);
            setChartData(chartRes.data);
            setTopCustomers(customersRes.data);
            setRecentOrders(ordersRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('tenantId');
        router.push('/');
    };

    if (loading && !stats) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-900">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* Navbar */}
            <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">X</div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">Xeno<span className="text-indigo-600">Insights</span></h1>
                    </div>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                        <p className="text-gray-500 text-sm">Welcome back! Here's what's happening efficiently.</p>
                    </div>

                    {/* Date Filters */}
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                        {['all', '30d', '7d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${dateRange === range
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {range === 'all' ? 'All Time' : range === '30d' ? 'Last 30 Days' : 'Last 7 Days'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(stats?.totalSales || 0)}
                        icon={<DollarSign className="text-emerald-500" />}
                        trend="+12.5%"
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats?.totalOrders}
                        icon={<ShoppingBag className="text-blue-500" />}
                        trend="+5%"
                    />
                    <StatCard
                        title="Total Customers"
                        value={stats?.totalCustomers}
                        icon={<Users className="text-purple-500" />}
                        trend="+2 New"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Revenue Trend</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#111827' }}
                                    />
                                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Orders Chart */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Orders Volume</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#111827' }}
                                    />
                                    <Line type="monotone" dataKey="orders" stroke="#e879f9" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Recent Orders */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                            <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">View All</span>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Order ID</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                        <th className="px-6 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentOrders.map((order) => (
                                        <tr key={order.shopifyId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">#{order.shopifyId}</td>
                                            <td className="px-6 py-4">{order.customer?.firstName || 'Unknown'}</td>
                                            <td className="px-6 py-4 text-right text-emerald-600 font-medium">₹{order.totalPrice}</td>
                                            <td className="px-6 py-4 text-right">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {recentOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No recent orders found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Customers */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Top Spenders</h3>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Orders</th>
                                        <th className="px-6 py-3 text-right">Total Spent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {topCustomers.map((c) => (
                                        <tr key={c.shopifyId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                    {c.firstName?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{c.firstName} {c.lastName}</div>
                                                    <div className="text-xs text-gray-400">{c.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">-</td>
                                            <td className="px-6 py-4 text-right text-gray-900 font-medium">₹{c.totalSpent}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, trend }: { title: string, value: any, icon: any, trend?: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
                {trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend} vs last month</span>}
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );
}
