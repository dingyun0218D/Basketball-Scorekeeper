import React, { useState, useRef, useEffect } from 'react';
import { ServiceType, ServiceConfig } from '../../types';
import { collaborationServiceManager } from '../../services/collaborationServiceManager';

interface ServiceSelectorProps {
  currentService: ServiceType;
  onServiceChange: (serviceType: ServiceType) => void;
  disabled?: boolean;
  showDescription?: boolean;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  currentService,
  onServiceChange,
  disabled = false,
  showDescription = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const availableServices = collaborationServiceManager.getAvailableServices();
  const currentConfig = collaborationServiceManager.getServiceConfig(currentService);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleServiceSelect = (serviceType: ServiceType) => {
    setIsOpen(false);
    onServiceChange(serviceType);
  };

  return (
    <div className="service-selector" ref={dropdownRef}>
      <div className="relative">
        {/* 选择器按钮 */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-40 px-3 py-2 text-sm font-medium border border-gray-300 rounded-md 
            bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200 text-left flex items-center justify-between
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:border-gray-400 cursor-pointer'}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="flex items-center">
            <span className="mr-2">{currentConfig.icon}</span>
            <span>{currentConfig.name}</span>
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 下拉选项 */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="py-1">
              {availableServices.map((service: ServiceConfig) => (
                <button
                  key={service.type}
                  type="button"
                  onClick={() => handleServiceSelect(service.type)}
                  className={`
                    w-full px-4 py-3 text-left text-sm transition-colors duration-150
                    flex items-center justify-between hover:bg-gray-50
                    ${service.type === currentService ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                  `}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{service.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {service.description}
                      </span>
                    </div>
                  </div>
                  {service.type === currentService && (
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 服务描述提示 */}
      {showDescription && (
        <div className="text-xs text-gray-500 mt-1 text-right leading-tight">
          {currentConfig.description}
        </div>
      )}
    </div>
  );
};

export default ServiceSelector; 