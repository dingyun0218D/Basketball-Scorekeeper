import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string[];
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  details,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmButtonClass: 'btn btn-danger btn-md',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: '⚠️',
          confirmButtonClass: 'btn btn-warning btn-md',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          confirmButtonClass: 'btn btn-primary btn-md',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          icon: '⚠️',
          confirmButtonClass: 'btn btn-warning btn-md',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
    }
  };

  const { icon, confirmButtonClass, iconBg, iconColor } = getIconAndColors();

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        {/* 图标和标题 */}
        <div className="flex items-start space-x-4 mb-4">
          <div className={`${iconBg} ${iconColor} p-2 rounded-full text-xl`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 mb-3">
              {message}
            </p>
          </div>
        </div>

        {/* 详细信息 */}
        {details && details.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-700 space-y-1">
              {details.map((detail, index) => (
                <div key={index} className="flex justify-between">
                  <span>{detail.split('：')[0]}：</span>
                  <span className="font-medium">{detail.split('：')[1]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 警告信息 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-800 font-medium">
            ⚠️ 此操作无法撤销，请谨慎操作！
          </p>
        </div>

        {/* 按钮 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary btn-md"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={confirmButtonClass}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}; 