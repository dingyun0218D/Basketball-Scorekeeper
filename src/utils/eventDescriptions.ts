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

// 搞笑的篮板评论
const reboundComments = [
  '抢篮板就是要这样霸道！',
  '篮下统治者！',
  '这球是我的！',
  '篮板机器！',
  '卡位很到位！',
  '跳得比别人高！',
  '占住有利位置！',
  '二次进攻机会来了！'
];

// 搞笑的助攻评论
const assistComments = [
  '神级传球！',
  '眼观六路！',
  '这传球太精妙了！',
  '队友接得很舒服！',
  '团队篮球的魅力！',
  '传球大师！',
  '视野开阔！',
  '配合太默契了！'
];

// 搞笑的抢断评论
const stealComments = [
  '眼疾手快！',
  '防守如鬼魅！',
  '料到了你的想法！',
  '这就是预判！',
  '偷鸡成功！',
  '防守反击的机会！',
  '手长优势！',
  '对手懵了！'
];

// 搞笑的盖帽评论
const blockComments = [
  '不进！',
  '盖帽大帽！',
  '这是禁飞区！',
  '别想在我头上得分！',
  '回去练练再来！',
  '封盖王者！',
  '篮筐守护神！',
  '这球不给进！'
];

// 搞笑的撤销评论
const undoComments = [
  '刚才那球不算数！',
  '重新来过！',
  '误操作，撤回！',
  '让我重新考虑一下！',
  '这个不对，改了！',
  '操作失误，修正中！',
  '数据有误，已纠正！',
  '技术调整！'
];

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
    
    case 'rebound': {
      const baseDescription = `${playerName}抢下篮板球，${teamName}获得球权`;
      const comment = getRandomComment(reboundComments);
      return `${baseDescription}！${comment}`;
    }

    case 'assist': {
      const baseDescription = `${playerName}送出精彩助攻，${teamName}配合默契`;
      const comment = getRandomComment(assistComments);
      return `${baseDescription}！${comment}`;
    }

    case 'steal': {
      const baseDescription = `${playerName}完成抢断，${teamName}断球成功`;
      const comment = getRandomComment(stealComments);
      return `${baseDescription}！${comment}`;
    }

    case 'block': {
      const baseDescription = `${playerName}送出大帽，${teamName}防守强硬`;
      const comment = getRandomComment(blockComments);
      return `${baseDescription}！${comment}`;
    }

    case 'turnover': {
      const baseDescription = `${playerName}出现失误，${teamName}丢掉球权`;
      const comment = getRandomComment(turnoverComments);
      return `${baseDescription}！${comment}`;
    }

    case 'undo': {
      const baseDescription = event.stat === 'score' 
        ? `${playerName}撤销${Math.abs(event.points || 0)}分得分，${teamName}分数调整`
        : `${playerName}撤销${event.stat}记录，${teamName}数据修正`;
      const comment = getRandomComment(undoComments);
      return `${baseDescription}！${comment}`;
    }
    
    case 'other': {
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