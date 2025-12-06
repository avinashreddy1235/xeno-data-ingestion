import { Request, Response } from 'express';
import prisma from '../services/db';

export const login = async (req: Request, res: Response) => {
    const { storeUrl, password } = req.body;

    if (!storeUrl || !password) {
        // @ts-ignore
        return res.status(400).json({ error: 'Store URL and Password are required' });
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { storeUrl }
        });

        if (!tenant) {
            // @ts-ignore
            return res.status(401).json({ error: 'Invalid store URL or password' });
        }

        // Simple password check (In real app, use bcrypt)
        if (tenant.password !== password) {
            // @ts-ignore
            return res.status(401).json({ error: 'Invalid store URL or password' });
        }

        // @ts-ignore
        res.json({
            tenantId: tenant.id,
            storeUrl: tenant.storeUrl,
            name: tenant.name
        });
    } catch (e) {
        console.error(e);
        // @ts-ignore
        res.status(500).json({ error: 'Login failed' });
    }
};
