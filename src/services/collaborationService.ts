import { GameState, GameEvent } from '../types';
import { firestoreService } from './firestoreService';
import { cloudbaseService } from './cloudbaseService';

// 协作服务类型
export type CollaborationServiceType = 'firebase' | 'cloudbase';

// 协作服务接口
export interface ICollaborationService {
  createGameSession(gameState: GameState, sessionId: string): Promise<void>;
  updateGameState(sessionId: string, gameState: GameState): Promise<void>;
  subscribeToGameState(sessionId: string, callback: (gameState: GameState | null) => void): () => void;
  addGameEvent(sessionId: string, event: GameEvent): Promise<void>;
  subscribeToGameEvents(sessionId: string, callback: (events: GameEvent[]) => void): () => void;
  checkSessionExists(sessionId: string): Promise<boolean>;
  deleteGameSession(sessionId: string): Promise<void>;
  updateUserActivity(sessionId: string, userId: string): Promise<void>;
  generateSessionId(): string;
  isAvailable(): boolean;
}

// 协作服务管理器
export class CollaborationServiceManager {
  private currentService: ICollaborationService;
  private serviceType: CollaborationServiceType;

  constructor(initialServiceType: CollaborationServiceType = 'firebase') {
    this.serviceType = initialServiceType;
    this.currentService = this.getService(initialServiceType);
  }

  // 获取指定类型的服务实例
  private getService(serviceType: CollaborationServiceType): ICollaborationService {
    switch (serviceType) {
      case 'firebase':
        return firestoreService;
      case 'cloudbase':
        return cloudbaseService;
      default:
        return firestoreService;
    }
  }

  // 切换服务类型
  switchService(serviceType: CollaborationServiceType): void {
    if (this.serviceType !== serviceType) {
      this.serviceType = serviceType;
      this.currentService = this.getService(serviceType);
      console.log(`协作服务已切换到: ${serviceType}`);
    }
  }

  // 获取当前服务类型
  getCurrentServiceType(): CollaborationServiceType {
    return this.serviceType;
  }

  // 获取当前服务实例
  getCurrentService(): ICollaborationService {
    return this.currentService;
  }

  // 检查指定服务是否可用
  isServiceAvailable(serviceType: CollaborationServiceType): boolean {
    try {
      const service = this.getService(serviceType);
      const available = service.isAvailable();
      console.log(`服务可用性检查 - ${serviceType}:`, available);
      return available;
    } catch (error) {
      console.error(`检查服务可用性失败 - ${serviceType}:`, error);
      return false;
    }
  }

  // 获取所有可用的服务类型
  getAvailableServices(): CollaborationServiceType[] {
    const services: CollaborationServiceType[] = [];
    
    console.log('开始检查所有服务的可用性...');
    
    if (this.isServiceAvailable('firebase')) {
      services.push('firebase');
      console.log('Firebase 服务可用');
    } else {
      console.log('Firebase 服务不可用');
    }
    
    if (this.isServiceAvailable('cloudbase')) {
      services.push('cloudbase');
      console.log('CloudBase 服务可用');
    } else {
      console.log('CloudBase 服务不可用');
    }
    
    console.log('可用服务列表:', services);
    return services;
  }

  // 代理方法 - 创建游戏会话
  async createGameSession(gameState: GameState, sessionId: string): Promise<void> {
    console.log('协作服务管理器 - 创建游戏会话:', {
      sessionId,
      currentService: this.serviceType,
      serviceAvailable: this.currentService.isAvailable()
    });
    
    try {
      return await this.currentService.createGameSession(gameState, sessionId);
    } catch (error) {
      console.error('协作服务管理器 - 创建会话失败:', {
        error,
        sessionId,
        serviceType: this.serviceType,
        serviceName: SERVICE_NAMES[this.serviceType]
      });
      throw error;
    }
  }

  // 代理方法 - 更新游戏状态
  async updateGameState(sessionId: string, gameState: GameState): Promise<void> {
    return this.currentService.updateGameState(sessionId, gameState);
  }

  // 代理方法 - 订阅游戏状态变化
  subscribeToGameState(sessionId: string, callback: (gameState: GameState | null) => void): () => void {
    return this.currentService.subscribeToGameState(sessionId, callback);
  }

  // 代理方法 - 添加游戏事件
  async addGameEvent(sessionId: string, event: GameEvent): Promise<void> {
    return this.currentService.addGameEvent(sessionId, event);
  }

  // 代理方法 - 订阅游戏事件
  subscribeToGameEvents(sessionId: string, callback: (events: GameEvent[]) => void): () => void {
    return this.currentService.subscribeToGameEvents(sessionId, callback);
  }

  // 代理方法 - 检查会话是否存在
  async checkSessionExists(sessionId: string): Promise<boolean> {
    return this.currentService.checkSessionExists(sessionId);
  }

  // 代理方法 - 删除游戏会话
  async deleteGameSession(sessionId: string): Promise<void> {
    return this.currentService.deleteGameSession(sessionId);
  }

  // 代理方法 - 更新用户活动时间
  async updateUserActivity(sessionId: string, userId: string): Promise<void> {
    return this.currentService.updateUserActivity(sessionId, userId);
  }

  // 代理方法 - 生成会话ID
  generateSessionId(): string {
    return this.currentService.generateSessionId();
  }

  // 代理方法 - 检查服务是否可用
  isAvailable(): boolean {
    return this.currentService.isAvailable();
  }
}

// 服务名称映射
export const SERVICE_NAMES: Record<CollaborationServiceType, string> = {
  firebase: 'Firebase (海外)',
  cloudbase: '腾讯云 CloudBase (国内)'
};

// 创建全局服务管理器实例
export const collaborationServiceManager = new CollaborationServiceManager(); 