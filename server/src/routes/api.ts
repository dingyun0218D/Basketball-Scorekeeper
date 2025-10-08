import { Router, Request, Response } from 'express';
import { tablestoreClient } from '../services/tablestoreClient';
import { websocketService } from '../services/websocketService';

const router = Router();

/**
 * 健康检查
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    service: 'Basketball Scorekeeper API'
  });
});

/**
 * 创建新游戏会话
 * POST /api/sessions
 */
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { gameState, sessionId } = req.body;

    if (!gameState || !sessionId) {
      return res.status(400).json({
        error: 'Missing required fields: gameState and sessionId'
      });
    }

    await tablestoreClient.createGameSession(gameState, sessionId);

    res.status(201).json({
      success: true,
      sessionId,
      message: 'Game session created successfully'
    });
  } catch (error) {
    console.error('Error creating game session:', error);
    res.status(500).json({
      error: 'Failed to create game session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取游戏会话
 * GET /api/sessions/:sessionId
 */
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const gameState = await tablestoreClient.getGameState(sessionId);

    if (!gameState) {
      return res.status(404).json({
        error: 'Game session not found'
      });
    }

    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    console.error('Error getting game session:', error);
    res.status(500).json({
      error: 'Failed to get game session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 更新游戏状态
 * PUT /api/sessions/:sessionId
 */
router.put('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { gameState } = req.body;

    if (!gameState) {
      return res.status(400).json({
        error: 'Missing required field: gameState'
      });
    }

    await tablestoreClient.updateGameState(sessionId, gameState);

    res.json({
      success: true,
      message: 'Game state updated successfully'
    });
  } catch (error) {
    console.error('Error updating game state:', error);
    res.status(500).json({
      error: 'Failed to update game state',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 删除游戏会话
 * DELETE /api/sessions/:sessionId
 */
router.delete('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    await tablestoreClient.deleteGameSession(sessionId);

    res.json({
      success: true,
      message: 'Game session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting game session:', error);
    res.status(500).json({
      error: 'Failed to delete game session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 检查会话是否存在
 * GET /api/sessions/:sessionId/exists
 */
router.get('/sessions/:sessionId/exists', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const exists = await tablestoreClient.checkSessionExists(sessionId);

    res.json({
      success: true,
      exists
    });
  } catch (error) {
    console.error('Error checking session:', error);
    res.status(500).json({
      error: 'Failed to check session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 添加游戏事件
 * POST /api/sessions/:sessionId/events
 */
router.post('/sessions/:sessionId/events', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { event } = req.body;

    if (!event) {
      return res.status(400).json({
        error: 'Missing required field: event'
      });
    }

    await tablestoreClient.addGameEvent(sessionId, event);

    res.status(201).json({
      success: true,
      message: 'Game event added successfully'
    });
  } catch (error) {
    console.error('Error adding game event:', error);
    res.status(500).json({
      error: 'Failed to add game event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取游戏事件列表
 * GET /api/sessions/:sessionId/events
 */
router.get('/sessions/:sessionId/events', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;

    const events = await tablestoreClient.getGameEvents(sessionId, limit);

    res.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error) {
    console.error('Error getting game events:', error);
    res.status(500).json({
      error: 'Failed to get game events',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 更新用户活动时间
 * POST /api/sessions/:sessionId/activity
 */
router.post('/sessions/:sessionId/activity', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
      });
    }

    await tablestoreClient.updateUserActivity(sessionId, userId);

    res.json({
      success: true,
      message: 'User activity updated successfully'
    });
  } catch (error) {
    console.error('Error updating user activity:', error);
    res.status(500).json({
      error: 'Failed to update user activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 生成会话ID
 * GET /api/generate-session-id
 */
router.get('/generate-session-id', (req: Request, res: Response) => {
  const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
  res.json({
    success: true,
    sessionId
  });
});

/**
 * Tunnel回调接口（由Java服务调用）
 * POST /api/tunnel/callback
 */
router.post('/tunnel/callback', async (req: Request, res: Response) => {
  try {
    const { type, sessionId, data, timestamp } = req.body;

    if (!type || !sessionId || !data) {
      return res.status(400).json({
        error: 'Missing required fields: type, sessionId, data'
      });
    }

    // 根据类型分发通知
    if (type === 'gameState') {
      // 解析gameState JSON
      const gameState = typeof data === 'string' ? JSON.parse(data) : data;
      websocketService.broadcastGameStateUpdate(sessionId, gameState);
      console.log(`📤 Broadcasted gameState update for session: ${sessionId}`);
    } else if (type === 'gameEvent') {
      // 解析gameEvent JSON
      const event = typeof data === 'string' ? JSON.parse(data) : data;
      websocketService.broadcastGameEventUpdate(sessionId, event);
      console.log(`📤 Broadcasted gameEvent update for session: ${sessionId}`);
    } else {
      return res.status(400).json({
        error: `Unknown callback type: ${type}`
      });
    }

    res.json({
      success: true,
      message: 'Callback processed successfully',
      timestamp
    });
  } catch (error) {
    console.error('Error processing tunnel callback:', error);
    res.status(500).json({
      error: 'Failed to process callback',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

