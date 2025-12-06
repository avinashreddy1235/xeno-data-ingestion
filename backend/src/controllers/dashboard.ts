import { Request, Response } from 'express';
import prisma from '../services/db';

export const getStats = async (req: Request, res: Response) => {
    const { tenantId, startDate, endDate } = req.query;
    if (!tenantId) {
        // @ts-ignore
        return res.status(400).json({ error: 'Missing tenantId' });
    }

    const dateFilter: any = {};
    if (startDate && endDate) {
        dateFilter.createdAt = {
            gte: new Date(String(startDate)),
            lte: new Date(String(endDate))
        };
    }

    try {
        const totalOrders = await prisma.order.count({ where: { tenantId: String(tenantId), ...dateFilter } });
        const totalCustomers = await prisma.customer.count({ where: { tenantId: String(tenantId), ...dateFilter } });
        const sales = await prisma.order.aggregate({
            _sum: { totalPrice: true },
            where: { tenantId: String(tenantId), ...dateFilter }
        });

        // @ts-ignore
        res.json({
            totalOrders,
            totalCustomers,
            totalSales: sales._sum.totalPrice || 0
        });
    } catch (e) {
        console.error(e);
        // @ts-ignore
        res.status(500).json({ error: 'Error fetching stats' });
    }
};

export const getChartData = async (req: Request, res: Response) => {
    const { tenantId, startDate, endDate } = req.query;
    if (!tenantId) {
        // @ts-ignore
        return res.status(400).json({ error: 'Missing tenantId' });
    }

    const dateFilter: any = {};
    if (startDate && endDate) {
        dateFilter.createdAt = {
            gte: new Date(String(startDate)),
            lte: new Date(String(endDate))
        };
    }

    try {
        const orders = await prisma.order.findMany({
            where: { tenantId: String(tenantId), ...dateFilter },
            select: { createdAt: true, totalPrice: true },
            orderBy: { createdAt: 'asc' }
        });

        // Group by date YYYY-MM-DD
        const map = new Map<string, { count: number, revenue: number }>();
        orders.forEach((o: { createdAt: Date, totalPrice: any }) => {
            const d = o.createdAt.toISOString().split('T')[0];
            const current = map.get(d) || { count: 0, revenue: 0 };
            map.set(d, {
                count: current.count + 1,
                revenue: current.revenue + Number(o.totalPrice)
            });
        });

        const data = Array.from(map.entries()).map(([date, val]) => ({
            date,
            orders: val.count,
            revenue: val.revenue
        }));
        // @ts-ignore
        res.json(data);
    } catch (e) {
        console.error(e);
        // @ts-ignore
        res.status(500).json({ error: 'Error fetching chart data' });
    }
};

export const getTopCustomers = async (req: Request, res: Response) => {
    const { tenantId } = req.query;
    if (!tenantId) {
        // @ts-ignore
        return res.status(400).json({ error: 'Missing tenantId' });
    }

    try {
        const customers = await prisma.customer.findMany({
            where: { tenantId: String(tenantId) },
            orderBy: { totalSpent: 'desc' },
            take: 5
        });

        // @ts-ignore
        res.json(customers);
    } catch (e) {
        console.error(e);
        // @ts-ignore
        res.status(500).json({ error: 'Error fetching top customers' });
    }
}

export const getRecentOrders = async (req: Request, res: Response) => {
    const { tenantId } = req.query;
    if (!tenantId) {
        // @ts-ignore
        return res.status(400).json({ error: 'Missing tenantId' });
    }

    try {
        const orders = await prisma.order.findMany({
            where: { tenantId: String(tenantId) },
            include: { customer: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // @ts-ignore
        res.json(orders);
    } catch (e) {
        console.error(e);
        // @ts-ignore
        res.status(500).json({ error: 'Error fetching recent orders' });
    }
};
