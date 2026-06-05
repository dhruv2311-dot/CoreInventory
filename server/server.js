import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import receiptRoutes from './routes/receipt.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import stockRoutes from './routes/stock.routes.js';
import warehouseRoutes from './routes/warehouse.routes.js';
import locationRoutes from './routes/location.routes.js';
import { verifySmtpConfiguration } from './services/mailer.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/receipts', receiptRoutes);
app.use('/deliveries', deliveryRoutes);
app.use('/stock', stockRoutes);
app.use('/warehouses', warehouseRoutes);
app.use('/locations', locationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
	console.log(`Server running on port ${PORT}`);

	try {
		await verifySmtpConfiguration();
		console.log('SMTP configuration verified');
	} catch (error) {
		console.error('SMTP configuration check failed:', error.message);
	}
});
