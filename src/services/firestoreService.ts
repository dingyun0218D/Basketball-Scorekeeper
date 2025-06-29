import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { GameState, GameEvent } from '../types';

export class FirestoreService {
  private gameCollection = 'games';
  private eventsCollection = 'events';

  // 创建新游戏会话
  async createGameSession(gameState: GameState, sessionId: string): Promise<void> {
    const gameDoc = doc(db, this.gameCollection, sessionId);
    await setDoc(gameDoc, {
      ...gameState,
      sessionId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    });
  }

  // 更新游戏状态
  async updateGameState(sessionId: string, gameState: GameState): Promise<void> {
    const gameDoc = doc(db, this.gameCollection, sessionId);
    
    // 创建要更新的数据，移除可能存在的 Firestore 特定字段
    const { activeUsers, ...updateData } = gameState;
    
    await updateDoc(gameDoc, {
      ...updateData,
      // 保持用户活动状态的更新
      activeUsers: activeUsers || {},
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    });
  }

  // 监听游戏状态变化
  subscribeToGameState(sessionId: string, callback: (gameState: GameState | null) => void): () => void {
    const gameDoc = doc(db, this.gameCollection, sessionId);
    
    return onSnapshot(gameDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // 转换 Timestamp 类型
        const gameState: GameState = {
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        } as GameState;
        callback(gameState);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('监听游戏状态失败:', error);
      callback(null);
    });
  }

  // 添加游戏事件
  async addGameEvent(sessionId: string, event: GameEvent): Promise<void> {
    const eventsCollection = collection(db, this.gameCollection, sessionId, this.eventsCollection);
    const eventDoc = doc(eventsCollection);
    
    await setDoc(eventDoc, {
      ...event,
      id: eventDoc.id,
      timestamp: serverTimestamp(),
      sessionId
    });
  }

  // 监听游戏事件
  subscribeToGameEvents(sessionId: string, callback: (events: GameEvent[]) => void): () => void {
    const eventsCollection = collection(db, this.gameCollection, sessionId, this.eventsCollection);
    const eventsQuery = query(eventsCollection, orderBy('timestamp', 'desc'));
    
    return onSnapshot(eventsQuery, (snapshot) => {
      const events: GameEvent[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date()
        } as GameEvent);
      });
      callback(events);
    }, (error) => {
      console.error('监听游戏事件失败:', error);
      callback([]);
    });
  }

  // 检查会话是否存在
  async checkSessionExists(sessionId: string): Promise<boolean> {
    try {
      const snapshot = await getDocs(query(collection(db, this.gameCollection)));
      return snapshot.docs.some(doc => doc.id === sessionId);
    } catch (error) {
      console.error('检查会话失败:', error);
      return false;
    }
  }

  // 删除游戏会话
  async deleteGameSession(sessionId: string): Promise<void> {
    const gameDoc = doc(db, this.gameCollection, sessionId);
    await deleteDoc(gameDoc);
  }

  // 更新用户活动时间（用于检测在线状态）
  async updateUserActivity(sessionId: string, userId: string): Promise<void> {
    const gameDoc = doc(db, this.gameCollection, sessionId);
    await updateDoc(gameDoc, {
      [`activeUsers.${userId}`]: serverTimestamp()
    });
  }

  // 生成会话ID
  generateSessionId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // 检查服务是否可用
  isAvailable(): boolean {
    try {
      return db !== undefined && db !== null;
    } catch (error) {
      console.error('检查 Firebase 可用性失败:', error);
      return false;
    }
  }
}

export const firestoreService = new FirestoreService(); 