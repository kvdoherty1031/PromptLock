import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { createLogger, format, transports } from 'winston';

import { authRouter } from './routes/auth';
import { connectionsRouter } from './routes/connections';
import { toolsRouter } from './routes/tools';
import { contextRouter } from './routes/context';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/authenticate';

// Load environment variables
dotenv.config();

// Create logger
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

// Create Express app
const app = express();

// Basic security middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// API routes
app.use('/auth', authRouter);
app.use('/connections', authenticate, connectionsRouter);
app.use('/tools', authenticate, toolsRouter);
app.use('/context', authenticate, contextRouter);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export { app, logger }; 