import axios from 'axios';

export const createShopifyClient = (domain: string, accessToken: string) => {
    return axios.create({
        baseURL: `https://${domain}/admin/api/2024-01`,
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
        },
    });
};

export const fetchCustomers = async (domain: string, accessToken: string) => {
    const client = createShopifyClient(domain, accessToken);
    const response = await client.get('/customers.json?limit=250');
    return response.data.customers;
};

export const fetchProducts = async (domain: string, accessToken: string) => {
    const client = createShopifyClient(domain, accessToken);
    const response = await client.get('/products.json?limit=250');
    return response.data.products;
};

export const fetchOrders = async (domain: string, accessToken: string) => {
    const client = createShopifyClient(domain, accessToken);
    const response = await client.get('/orders.json?status=any&limit=250');
    return response.data.orders;
};
