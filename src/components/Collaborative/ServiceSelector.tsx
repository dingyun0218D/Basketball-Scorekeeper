import React from 'react';
import { ServiceType, ServiceConfig } from '../../types';
import { collaborationServiceManager } from '../../services/collaborationServiceManager';

interface ServiceSelectorProps {
  currentService: ServiceType;
  onServiceChange: (serviceType: ServiceType) => void;
  disabled?: boolean;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  currentService,
  onServiceChange,
  disabled = false
}) => {
  const availableServices = collaborationServiceManager.getAvailableServices();
  const currentConfig = collaborationServiceManager.getServiceConfig(currentService);

  const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newServiceType = event.target.value as ServiceType;
    onServiceChange(newServiceType);
  };

  return (
    <div className="service-selector">
      <select
        value={currentService}
        onChange={handleServiceChange}
        disabled={disabled}
        className={`
          px-3 py-1 text-sm border border-gray-300 rounded-md 
          bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title="选择协作服务"
      >
        {availableServices.map((service: ServiceConfig) => (
          <option key={service.type} value={service.type}>
            {service.icon} {service.name}
          </option>
        ))}
      </select>
      
      {/* 服务描述提示 */}
      <div className="text-xs text-gray-500 mt-1 text-right">
        {currentConfig.description}
      </div>
    </div>
  );
};

export default ServiceSelector; 