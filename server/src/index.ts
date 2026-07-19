import './loadEnv';

// Enforce strong JWT secrets in production
if (process.env.NODE_ENV === 'production') {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (
    !accessSecret || 
    accessSecret.includes('change_me') || 
    accessSecret === 'access_secret'
  ) {
    console.error('[CRITICAL] Insecure or missing JWT_ACCESS_SECRET set in production environment!');
    process.exit(1);
  }
  
  if (
    !refreshSecret || 
    refreshSecret.includes('change_me') || 
    refreshSecret === 'refresh_secret'
  ) {
    console.error('[CRITICAL] Insecure or missing JWT_REFRESH_SECRET set in production environment!');
    process.exit(1);
  }
}

import { v4 as uuidv4 } from 'uuid';

// Request ID middleware – adds a unique ID to each request for structured logging
export const requestIdMiddleware = (req: any, res: any, next: any) => {
  const requestId = uuidv4();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};
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
app.use('/api/v1/workspaces', workspaceRoutes);

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
