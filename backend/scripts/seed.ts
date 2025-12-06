import prisma from '../src/services/db';

async function main() {
    console.log('🌱 Checking Tenant Setup...');

    // 1. Get or Create Tenant
    // We rely on the schema default for 'password' ("xeno123") if creating new.
    // If verifying existing, we don't need to pass it.
    const tenant = await prisma.tenant.upsert({
        where: { storeUrl: 'xeno-data-store.myshopify.com' },
        update: {},
        create: {
            name: 'Xeno Real Store',
            storeUrl: 'xeno-data-store.myshopify.com',
            // password: 'xeno123', // Dictionary default used
            apiToken: 'mock_token'
        }
    });

    console.log(`✅ Tenant Configured: ${tenant.name}`);
    console.log(`   ID: ${tenant.id}`);
    console.log(`   URL: ${tenant.storeUrl}`);

    console.log('\nReady for real data ingestion.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
