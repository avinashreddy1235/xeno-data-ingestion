import { Request, Response } from 'express';
import prisma from '../services/db';
import * as shopifyService from '../services/shopify';

export const ingestData = async (req: Request, res: Response) => {
    const { shopUrl, accessToken, name } = req.body;

    if (!shopUrl || !accessToken) {
        // @ts-ignore
        return res.status(400).json({ error: 'Missing shopUrl or accessToken' });
    }

    try {
        console.log(`Starting ingestion for ${shopUrl}`);

        // 1. Create/Update Tenant
        const tenant = await prisma.tenant.upsert({
            where: { storeUrl: shopUrl },
            update: { apiToken: accessToken },
            create: { storeUrl: shopUrl, apiToken: accessToken, name: name || shopUrl },
        });

        // 2. Fetch Data
        const customers = await shopifyService.fetchCustomers(shopUrl, accessToken);
        const products = await shopifyService.fetchProducts(shopUrl, accessToken);
        const orders = await shopifyService.fetchOrders(shopUrl, accessToken);

        console.log(`Fetched ${customers.length} customers, ${products.length} products, ${orders.length} orders`);

        // 3. Store Customers
        for (const cust of customers) {
            await prisma.customer.upsert({
                where: { shopifyId_tenantId: { shopifyId: String(cust.id), tenantId: tenant.id } },
                update: {
                    firstName: cust.first_name,
                    lastName: cust.last_name,
                    email: cust.email,
                    totalSpent: cust.total_spent || 0,
                },
                create: {
                    shopifyId: String(cust.id),
                    tenantId: tenant.id,
                    firstName: cust.first_name,
                    lastName: cust.last_name,
                    email: cust.email,
                    totalSpent: cust.total_spent || 0,
                },
            });
        }

        // 4. Store Products
        for (const prod of products) {
            await prisma.product.upsert({
                where: { shopifyId_tenantId: { shopifyId: String(prod.id), tenantId: tenant.id } },
                update: {
                    title: prod.title,
                    price: prod.variants[0]?.price || 0,
                },
                create: {
                    shopifyId: String(prod.id),
                    tenantId: tenant.id,
                    title: prod.title,
                    price: prod.variants[0]?.price || 0,
                }
            })
        }

        // 5. Store Orders
        for (const ord of orders) {
            let customerId = null;
            if (ord.customer) {
                const c = await prisma.customer.findUnique({
                    where: { shopifyId_tenantId: { shopifyId: String(ord.customer.id), tenantId: tenant.id } }
                });
                customerId = c?.id;
            }

            await prisma.order.upsert({
                where: { shopifyId_tenantId: { shopifyId: String(ord.id), tenantId: tenant.id } },
                update: {
                    totalPrice: ord.total_price,
                    customerId: customerId
                },
                create: {
                    shopifyId: String(ord.id),
                    tenantId: tenant.id,
                    totalPrice: ord.total_price,
                    customerId: customerId,
                    createdAt: new Date(ord.created_at)
                }
            });
        }

        // @ts-ignore
        res.json({ message: 'Ingestion successful', tenantId: tenant.id, stats: { customers: customers.length, orders: orders.length } });

    } catch (error: any) {
        console.error(error);
        // @ts-ignore
        res.status(500).json({ error: 'Ingestion failed', details: error.message });
    }
};
