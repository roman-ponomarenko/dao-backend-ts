import express from 'express';
import cors from 'cors';
import proposalRoutes from './routes/proposals';
import { errorHandler, requestLogHandler } from './middlewares/handlers';

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogHandler);

// Routes
app.use('/api/proposals', proposalRoutes);
// Global error handler (should be after routes)
app.use(errorHandler);

export default app;