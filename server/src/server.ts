import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'http';
import { validateConfig, serverConfig } from './config/tablestore';
import { websocketService } from './services/websocketService';
import { tunnelWorker } from './services/tunnelWorker';
import apiRoutes from './routes/api';

/**
 * 主服务器入口
 */
async function startServer() {
  try {
    // 验证配置
    console.log('🔍 Validating configuration...');
    validateConfig();

    // 创建Express应用
    const app = express();

    // 中间件
    app.use(compression()); // 启用gzip压缩
    app.use(cors({
      origin: serverConfig.allowedOrigins,
      credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 请求日志
    app.use((req, res, next) => {
      console.log(`📨 ${req.method} ${req.path}`);
      next();
    });

    // API路由
    app.use('/api', apiRoutes);

    // 根路径
    app.get('/', (req, res) => {
      res.json({
        service: 'Basketball Scorekeeper Server',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          api: '/api',
          health: '/api/health',
          websocket: 'ws://[host]:[port]'
        }
      });
    });

    // 错误处理中间件
    app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('❌ Server error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message
      });
    });

    // 创建HTTP服务器
    const server = createServer(app);

    // 初始化WebSocket服务
    console.log('🔌 Initializing WebSocket service...');
    websocketService.initialize(server);

    // 启动Tunnel Worker
    console.log('🚇 Starting Tunnel Worker...');
    await tunnelWorker.start();

    // 启动服务器
    server.listen(serverConfig.port, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🎉 Basketball Scorekeeper Server Started!');
      console.log('='.repeat(60));
      console.log(`🌍 Environment: ${serverConfig.nodeEnv}`);
      console.log(`🚀 HTTP Server: http://localhost:${serverConfig.port}`);
      console.log(`🔌 WebSocket: ws://localhost:${serverConfig.port}`);
      console.log(`📡 API Endpoint: http://localhost:${serverConfig.port}/api`);
      console.log(`✅ Health Check: http://localhost:${serverConfig.port}/api/health`);
      console.log('='.repeat(60) + '\n');
    });

    // 优雅关闭
    const shutdown = async () => {
      console.log('\n🛑 Shutting down server...');
      
      // 停止接收新连接
      server.close(() => {
        console.log('✅ HTTP server closed');
      });

      // 关闭WebSocket服务
      websocketService.shutdown();

      // 停止Tunnel Worker
      await tunnelWorker.stop();

      console.log('✅ Server shutdown complete');
      process.exit(0);
    };

    // 监听关闭信号
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // 监听未捕获的异常
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown();
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown();
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();

