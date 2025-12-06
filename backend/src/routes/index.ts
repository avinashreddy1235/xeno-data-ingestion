import { Router } from 'express';
import { ingestData } from '../controllers/ingestion';
import { getStats, getChartData, getTopCustomers, getRecentOrders } from '../controllers/dashboard';
import { login } from '../controllers/auth';

const router = Router();

router.post('/login', login);
router.post('/ingest', ingestData);
router.get('/dashboard/stats', getStats);
router.get('/dashboard/chart', getChartData);
router.get('/dashboard/top-customers', getTopCustomers);
router.get('/dashboard/recent-orders', getRecentOrders);

export default router;
