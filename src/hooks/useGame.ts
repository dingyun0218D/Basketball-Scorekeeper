import { useEventDrivenGameContext } from './useEventDrivenGameContext';

export const useGame = () => {
  const context = useEventDrivenGameContext();
  
  // 为了向后兼容，我们需要提供一个dispatch方法
  // 但在事件驱动架构中，我们使用具体的方法而不是dispatch
  const dispatch = async (action: unknown) => {
    console.warn('dispatch方法已弃用，请使用具体的事件方法');
    console.log('尝试的action:', action);
  };
  
  return {
    ...context,
    dispatch // 保持向后兼容
  };
}; 