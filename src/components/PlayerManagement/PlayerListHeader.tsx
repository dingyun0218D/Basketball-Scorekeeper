import React from 'react';

export const PlayerListHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
      <div className="col-span-2 text-center">号码</div>
      <div className="col-span-4">姓名</div>
      <div className="col-span-2 text-center">位置</div>
      <div className="col-span-2 text-center">状态</div>
      <div className="col-span-2 text-center">操作</div>
    </div>
  );
}; 