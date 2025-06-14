import { GameEvent, GameState } from '../types';

// 搞笑的得分评论
const scoreComments = {
  positive: [
    '太牛逼了！',
    '神投手！',
    '无解！',
    '这球进得漂亮！',
    '手感火热！',
    '势不可挡！',
    '完美出手！',
    '百发百中！'
  ],
  consecutive: [
    '连续得分，太牛逼了！',
    '停不下来了！',
    '这是要上天的节奏！',
    '火力全开！',
    '无人能挡！',
    '神挡杀神！',
    '这就是传说中的手感！',
    '对手已经绝望了！'
  ]
};

// 搞笑的失误评论
const turnoverComments = [
  '哎呀，手滑了！',
  '这球传给了空气！',
  '对手说谢谢！',
  '脑子进水了？',
  '这是在送温暖吗？',
  '教练要气炸了！',
  '观众都看不下去了！',
  '这操作很迷！'
];

// 搞笑的犯规评论
const foulComments = [
  '动作有点大啊！',
  '裁判眼神很好！',
  '这下要被教练骂了！',
  '太着急了！',
  '冷静一点！',
  '控制情绪！',
  '别太激动！',
  '稳住心态！'
];

// 搞笑的换人评论
const substitutionComments = {
  in: [
    '新鲜血液上场了！',
    '救兵来了！',
    '该你表演了！',
    '机会来了！',
    '证明自己的时候到了！'
  ],
  out: [
    '辛苦了，下去休息吧！',
    '表现不错，先歇会！',
    '给队友一些机会！',
    '保存体力！',
    '战术调整！'
  ]
};

// 获取球员信息
const getPlayerInfo = (playerId: string, teamId: string, gameState: GameState) => {
  const team = teamId === gameState.homeTeam.id ? gameState.homeTeam : gameState.awayTeam;
  const player = team.players.find(p => p.id === playerId);
  return {
    player,
    team,
    playerName: player ? `${player.name}` : '未知球员',
    playerNumber: player ? player.number : 0,
    teamName: team.name
  };
};

// 检查是否连续得分
const isConsecutiveScore = (events: GameEvent[], currentEvent: GameEvent): boolean => {
  if (currentEvent.type !== 'score' || !currentEvent.playerId) return false;
  
  // 查找最近的3个事件
  const recentEvents = events.slice(0, 3);
  const playerScoreEvents = recentEvents.filter(e => 
    e.type === 'score' && 
    e.playerId === currentEvent.playerId && 
    e.points && e.points > 0
  );
  
  return playerScoreEvents.length >= 2;
};

// 随机选择评论
const getRandomComment = (comments: string[]): string => {
  return comments[Math.floor(Math.random() * comments.length)];
};

// 生成有趣的事件描述
export const generateFunEventDescription = (event: GameEvent, gameState: GameState): string => {
  const { playerName, teamName } = getPlayerInfo(event.playerId || '', event.teamId, gameState);
  
  switch (event.type) {
    case 'score': {
      if (!event.points || !event.playerId) {
        return `${teamName}得分了！`;
      }
      
      const isConsecutive = isConsecutiveScore(gameState.events, event);
      const baseDescription = event.points === 1 
        ? `${playerName}罚球命中，为${teamName}拿下1分` 
        : event.points === 2
        ? `${playerName}中距离投篮得手，为${teamName}贡献2分`
        : `${playerName}三分线外开火命中，为${teamName}轰下3分`;
      
      const comment = isConsecutive 
        ? getRandomComment(scoreComments.consecutive)
        : getRandomComment(scoreComments.positive);
      
      return `${baseDescription}！${comment}`;
    }
    
    case 'foul': {
      const baseDescription = event.playerId 
        ? `${playerName}防守犯规，${teamName}被吹罚犯规`
        : `${teamName}被吹罚犯规`;
      
      const comment = getRandomComment(foulComments);
      return `${baseDescription}！${comment}`;
    }
    
    case 'timeout': {
      return `${teamName}请求暂停！教练要布置战术了，球员们快过来听讲！`;
    }
    
    case 'substitution': {
      if (!event.playerId) {
        return `${teamName}进行换人调整！`;
      }
      
      // 根据描述判断是上场还是下场
      const isSubIn = event.description.includes('上场');
      const comment = isSubIn 
        ? getRandomComment(substitutionComments.in)
        : getRandomComment(substitutionComments.out);
      
      const action = isSubIn ? '上场' : '下场';
      return `${playerName}${action}，${teamName}进行人员调整！${comment}`;
    }
    
    case 'other': {
      // 检查是否是失误相关
      if (event.description.includes('失误') || event.description.includes('turnover')) {
        const baseDescription = event.playerId 
          ? `${playerName}出现失误，${teamName}丢掉球权`
          : `${teamName}出现失误`;
        
        const comment = getRandomComment(turnoverComments);
        return `${baseDescription}！${comment}`;
      }
      
      return event.description;
    }
    
    default:
      return event.description;
  }
};

// 生成时间描述
export const generateTimeDescription = (quarter: number, time: string): string => {
  const timeDescriptions = [
    `第${quarter}节 ${time}`,
    `Q${quarter} ${time}`,
    `第${quarter}节还剩${time}`,
  ];
  
  return timeDescriptions[0]; // 使用标准格式
};

// 生成事件摘要
export const generateEventSummary = (events: GameEvent[]): string => {
  if (events.length === 0) return '比赛还未开始，让我们期待精彩的表现！';
  
  const scoreEvents = events.filter(e => e.type === 'score' && e.points && e.points > 0);
  const foulEvents = events.filter(e => e.type === 'foul');
  
  if (scoreEvents.length > foulEvents.length * 2) {
    return '这场比赛进攻火力十足，观众看得过瘾！';
  } else if (foulEvents.length > scoreEvents.length) {
    return '比赛有些激烈，双方火药味十足！';
  } else {
    return '比赛节奏紧凑，双方你来我往！';
  }
}; 