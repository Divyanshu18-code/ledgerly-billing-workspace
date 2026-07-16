import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import clientsRoutes from './modules/clients/clients.routes';
import productsRoutes from './modules/products/products.routes';
import workspaceRoutes from './modules/workspace/workspace.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Outgoing Credentials for Secure CORS Session Cookies Handshakes
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id'],
  })
);

app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientsRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1', workspaceRoutes);

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
