import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '~/modules/auth/auth.routes';
import clientsRoutes from '~/modules/clients/clients.routes';
import productsRoutes from '~/modules/products/products.routes';
import { errorHandler } from '~/middlewares/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientsRoutes);
app.use('/api/v1/products', productsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Ledgerly Backend API is running smoothly'
  });
});

// Centralized error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server]: Ledgerly Server is running at http://localhost:${PORT}`);
});
