import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { gadgetRoutes } from './routes/gadget.routes';
import { authRoutes } from './routes/auth.routes';
import { authenticateToken } from './middleware/auth';
import { specs } from './swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/auth', authRoutes);

app.use('/gadgets', authenticateToken, gadgetRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 IMF Gadget API running on port ${port}`);
    console.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
  });
}

export default app;
