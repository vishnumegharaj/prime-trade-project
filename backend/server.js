import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import config from './config/config.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`\n🚀 TaskFlow API running in ${config.nodeEnv} mode`);
    console.log(`📡 Server:    http://localhost:${config.port}`);
    console.log(`📋 API Docs:  http://localhost:${config.port}/api-docs`);
    console.log(`🩺 Health:    http://localhost:${config.port}/health\n`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

startServer();
