import http from 'http';
import app from './app';
import { initializeSocket } from './socket';
import { startOverdueJob } from './jobs/overdue.job';
import { env } from './config/env';

const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start cron jobs
startOverdueJob();

server.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
});
