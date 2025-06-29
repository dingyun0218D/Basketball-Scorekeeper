import React from 'react';
import { CollaborationServiceType, SERVICE_NAMES } from '../../services/collaborationService';

interface ServiceSelectorProps {
  currentService: CollaborationServiceType;
  availableServices: CollaborationServiceType[];
  onServiceChange: (service: CollaborationServiceType) => void;
  disabled?: boolean;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  currentService,
  availableServices,
  onServiceChange,
  disabled = false
}) => {
  return (
    <div className="service-selector">
      <label htmlFor="service-select" className="block text-xs font-medium text-gray-600 mb-1">
        协作服务
      </label>
      <select
        id="service-select"
        value={currentService}
        onChange={(e) => onServiceChange(e.target.value as CollaborationServiceType)}
        disabled={disabled || availableServices.length <= 1}
        className="w-full text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {availableServices.map((service) => (
          <option key={service} value={service}>
            {SERVICE_NAMES[service]}
          </option>
        ))}
      </select>
      
      {availableServices.length <= 1 && (
        <div className="text-xs text-gray-500 mt-1">
          {availableServices.length === 0 
            ? '⚠️ 没有可用的协作服务' 
            : '只有一个服务可用'
          }
        </div>
      )}
      
      {availableServices.length > 1 && (
        <div className="text-xs text-gray-500 mt-1">
          💡 可切换不同的后端服务
        </div>
      )}
    </div>
  );
}; 