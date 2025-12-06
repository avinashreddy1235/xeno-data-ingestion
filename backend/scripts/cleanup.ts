import prisma from '../src/services/db';

async function main() {
    console.log('🧹 Clearing data for Xeno Real Store...');

    const tenant = await prisma.tenant.findUnique({
        where: { storeUrl: 'xeno-data-store.myshopify.com' }
    });

    if (!tenant) {
        console.log('Tenant not found!');
        return;
    }

    // Delete orders first (foreign key)
    const deletedOrders = await prisma.order.deleteMany({
        where: { tenantId: tenant.id }
    });

    console.log(`✅ Deleted ${deletedOrders.count} orders.`);

    // We keep the customers that came from Shopify, but since we mixed mock ones, 
    // it is safer to delete all and re-ingest to be purely clean.
    const deletedCustomers = await prisma.customer.deleteMany({
        where: { tenantId: tenant.id }
    });

    console.log(`✅ Deleted ${deletedCustomers.count} customers.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
