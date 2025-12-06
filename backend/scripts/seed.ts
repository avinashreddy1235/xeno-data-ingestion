import prisma from '../src/services/db';

async function main() {
    console.log('🌱 Seeding RICH mock data...');

    // 1. Get or Create Tenant
    const tenant = await prisma.tenant.upsert({
        where: { storeUrl: 'xeno-data-store.myshopify.com' },
        update: {},
        create: {
            name: 'Xeno Real Store',
            storeUrl: 'xeno-data-store.myshopify.com',
            password: 'xeno123',
            apiToken: 'mock_token'
        }
    });

    console.log(`✅ Tenant: ${tenant.name} (${tenant.id})`);

    // 2. Create/Get Customers
    const customers = [];
    for (let i = 1; i <= 10; i++) {
        const c = await prisma.customer.upsert({
            where: { shopifyId_tenantId: { shopifyId: `cust_${100 + i}`, tenantId: tenant.id } },
            update: {},
            create: {
                shopifyId: `cust_${100 + i}`,
                tenantId: tenant.id,
                firstName: ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan'][i % 5],
                lastName: ['Smith', 'Jones', 'Taylor', 'Brown', 'White'][i % 5],
                email: `user${i}@example.com`,
                totalSpent: 0
            }
        });
        customers.push(c);
    }

    // 3. Clear existing orders for this tenant to avoid graph overlap/mess
    await prisma.order.deleteMany({ where: { tenantId: tenant.id } });
    console.log('🧹 Cleared old orders for clean graph');

    // 4. Generate Orders over last 30 days
    const today = new Date();

    for (let i = 30; i >= 0; i--) {
        // Some days have 0 orders, some have many
        const orderCount = Math.floor(Math.random() * 5); // 0 to 4 orders per day

        const date = new Date(today);
        date.setDate(date.getDate() - i);

        for (let j = 0; j < orderCount; j++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const amount = 500 + Math.floor(Math.random() * 5000); // 500 to 5500 INR

            await prisma.order.create({
                data: {
                    shopifyId: `ord_${Date.now()}_${i}_${j}`,
                    tenantId: tenant.id,
                    totalPrice: amount,
                    currency: 'INR',
                    createdAt: date,
                    customerId: customer.id
                }
            });

            // Update customer spend
            await prisma.customer.update({
                where: { id: customer.id },
                data: { totalSpent: { increment: amount } }
            });
        }
    }

    console.log('✅ Generated ~60 orders over last 30 days');
    console.log('🎉 REFRESH YOUR DASHBOARD NOW!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
