import { createContext } from 'react';
import { EventDrivenGameContextType } from '../hooks/useEventDrivenGameContext';

// 创建上下文
export const EventDrivenGameContext = createContext<EventDrivenGameContextType | null>(null); 