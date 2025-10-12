// 加载环境变量
require('dotenv').config();

module.exports = {
  apps: [{
    name: 'basketball-scorekeeper',
    script: './dist/server.js',
    cwd: '/opt/basketball-scorekeeper', // 明确指定工作目录
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      // 从当前进程环境中读取（已由上面的dotenv.config()加载）
      TABLESTORE_INSTANCE_NAME: process.env.TABLESTORE_INSTANCE_NAME,
      TABLESTORE_ENDPOINT: process.env.TABLESTORE_ENDPOINT,
      TABLESTORE_ACCESS_KEY_ID: process.env.TABLESTORE_ACCESS_KEY_ID,
      TABLESTORE_ACCESS_KEY_SECRET: process.env.TABLESTORE_ACCESS_KEY_SECRET,
      TABLESTORE_REGION: process.env.TABLESTORE_REGION,
      TUNNEL_GAME_SESSIONS_ID: process.env.TUNNEL_GAME_SESSIONS_ID,
      TUNNEL_GAME_EVENTS_ID: process.env.TUNNEL_GAME_EVENTS_ID,
      TABLE_GAME_SESSIONS: process.env.TABLE_GAME_SESSIONS,
      TABLE_GAME_EVENTS: process.env.TABLE_GAME_EVENTS,
      PORT: process.env.PORT,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // 在启动失败后的重试策略
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};

