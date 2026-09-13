import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import projectRoutes from './modules/projects/project.routes';
import { taskRouter, projectTaskRouter } from './modules/tasks/task.routes';
import activityRoutes from './modules/activity/activity.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import userRoutes from './modules/users/user.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();

const allowedOrigins = [
  env.CLIENT_URL?.replace(/\/$/, ''),
  'https://velozity-dashboard-pi.vercel.app',
  'http://localhost:5173',
  'http://localhost:5001',
].filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', projectTaskRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
