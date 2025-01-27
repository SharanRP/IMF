import express from 'express';
import cors from 'cors';
import { config as dotenvConfig } from 'dotenv';
import { authRoutes } from './routes/auth.routes';
import { gadgetRoutes } from './routes/gadget.routes';
import { authenticateToken } from './middleware/auth';
import swaggerUi from 'swagger-ui-express';
import { specs as swaggerSpec } from './swagger';
import config from './config';

dotenvConfig({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({
    message: 'IMF Gadget API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    baseUrl: config.baseUrl,
  });
});

app.use('/auth', authRoutes);
app.use('/gadgets', authenticateToken, gadgetRoutes);

if (require.main === module) {
  const port = process.env.PORT || config.port || 3000;
  app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`API Documentation available at ${config.baseUrl}/api-docs`);
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
