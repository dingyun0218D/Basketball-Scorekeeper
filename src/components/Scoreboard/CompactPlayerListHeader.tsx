import React from 'react';

export const CompactPlayerListHeader: React.FC = () => {
  return (
    <div className="flex items-center px-2 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
      {/* 左侧固定列区域 - 号码、姓名、位置 */}
      <div className="flex items-center flex-shrink-0">
        {/* 球员号码 */}
        <div className="w-10 text-center">
          号码
        </div>

        {/* 球员姓名 */}
        <div className="w-20 px-1">
          姓名
        </div>

        {/* 球员位置 */}
        <div className="w-12 text-center">
          位置
        </div>
      </div>

      {/* 中间空白区域 - 占用剩余空间 */}
      <div className="flex-1"></div>

      {/* 右侧固定列区域 - 从得分开始 */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        {/* 得分 */}
        <div className="w-8 text-center">
          得分
        </div>

        {/* 篮板 */}
        <div className="w-6 text-center">
          板
        </div>

        {/* 助攻 */}
        <div className="w-6 text-center">
          助
        </div>

        {/* 失误 */}
        <div className="w-6 text-center hidden sm:block">
          失
        </div>

        {/* 犯规 */}
        <div className="w-6 text-center">
          犯
        </div>

        {/* 投篮命中率 */}
        <div className="w-10 text-center hidden md:block">
          投篮%
        </div>

        {/* 真实命中率 */}
        <div className="w-10 text-center hidden lg:block">
          TS%
        </div>

        {/* 正负值 */}
        <div className="w-8 text-center hidden xl:block">
          +/-
        </div>

        {/* 效率值 */}
        <div className="w-8 text-center hidden xl:block">
          效率
        </div>

        {/* 移除按钮占位 */}
        <div className="w-4 ml-1 flex-shrink-0"></div>
      </div>
    </div>
  );
}; 