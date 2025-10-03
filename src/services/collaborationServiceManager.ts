import { CollaborativeService, ServiceType, ServiceConfig } from '../types';
import { firestoreService } from './firestoreService';
import { leancloudService } from './leancloudService';
import { tablestoreService } from './tablestoreService';

// 服务配置
export const SERVICE_CONFIGS: Record<ServiceType, ServiceConfig> = {
  firebase: {
    type: 'firebase',
    name: 'Firebase',
    description: '谷歌云端数据库，实时同步',
    icon: '🔥'
  },
  leancloud: {
    type: 'leancloud',
    name: 'LeanCloud',
    description: '国内云端服务，稳定可靠',
    icon: '☁️'
  },
  tablestore: {
    type: 'tablestore',
    name: '阿里云TableStore',
    description: '阿里云表格存储，高性能实时协同',
    icon: '⚡'
  }
};

// 协作服务管理器
export class CollaborationServiceManager {
  private services: Record<ServiceType, CollaborativeService> = {
    firebase: firestoreService,
    leancloud: leancloudService,
    tablestore: tablestoreService
  };

  private currentServiceType: ServiceType = 'tablestore';

  // 获取当前服务
  getCurrentService(): CollaborativeService {
    return this.services[this.currentServiceType];
  }

  // 获取当前服务类型
  getCurrentServiceType(): ServiceType {
    return this.currentServiceType;
  }

  // 切换服务
  switchService(serviceType: ServiceType): void {
    if (this.services[serviceType]) {
      this.currentServiceType = serviceType;
    } else {
      throw new Error(`服务类型 ${serviceType} 不存在`);
    }
  }

  // 获取服务配置
  getServiceConfig(serviceType: ServiceType): ServiceConfig {
    return SERVICE_CONFIGS[serviceType];
  }

  // 获取所有可用服务
  getAvailableServices(): ServiceConfig[] {
    return Object.values(SERVICE_CONFIGS);
  }

  // 检查服务是否可用
  isServiceAvailable(serviceType: ServiceType): boolean {
    return !!this.services[serviceType];
  }
}

// 导出单例实例
export const collaborationServiceManager = new CollaborationServiceManager(); 