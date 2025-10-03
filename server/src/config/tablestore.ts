import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export interface TableStoreConfig {
  instanceName: string;
  endpoint: string;
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
}

export interface TunnelConfig {
  gameSessionsTunnelId: string;
  gameEventsTunnelId: string;
}

export interface TableConfig {
  gameSessions: string;
  gameEvents: string;
}

// TableStore配置
export const tablestoreConfig: TableStoreConfig = {
  instanceName: process.env.TABLESTORE_INSTANCE_NAME || '',
  endpoint: process.env.TABLESTORE_ENDPOINT || '',
  accessKeyId: process.env.TABLESTORE_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.TABLESTORE_ACCESS_KEY_SECRET || '',
  region: process.env.TABLESTORE_REGION || 'cn-hangzhou'
};

// Tunnel配置
export const tunnelConfig: TunnelConfig = {
  gameSessionsTunnelId: process.env.TUNNEL_GAME_SESSIONS_ID || '',
  gameEventsTunnelId: process.env.TUNNEL_GAME_EVENTS_ID || ''
};

// 表名配置
export const tableConfig: TableConfig = {
  gameSessions: process.env.TABLE_GAME_SESSIONS || 'GameSessions',
  gameEvents: process.env.TABLE_GAME_EVENTS || 'GameEvents'
};

// 服务器配置
export const serverConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
};

// 验证配置
export function validateConfig(): void {
  const requiredEnvVars = [
    'TABLESTORE_INSTANCE_NAME',
    'TABLESTORE_ENDPOINT',
    'TABLESTORE_ACCESS_KEY_ID',
    'TABLESTORE_ACCESS_KEY_SECRET',
    'TUNNEL_GAME_SESSIONS_ID',
    'TUNNEL_GAME_EVENTS_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please create a .env file based on .env.example'
    );
  }

  console.log('✅ Configuration validated successfully');
  console.log(`📦 Instance: ${tablestoreConfig.instanceName}`);
  console.log(`🌍 Region: ${tablestoreConfig.region}`);
  console.log(`🚀 Server will run on port ${serverConfig.port}`);
}

