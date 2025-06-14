import { GameEvent, Team } from '../types';
import { generateId } from './gameUtils';

// 创建犯规事件
export const createFoulEvent = (
  teamId: string,
  playerId: string | undefined,
  team: Team,
  quarter: number,
  time: string
): GameEvent => {
  return {
    id: generateId(),
    timestamp: Date.now(),
    quarter,
    time,
    type: 'foul',
    teamId,
    playerId,
    description: `${team.name} 犯规`,
  };
};

// 更新队伍犯规数
export const updateTeamFouls = (team: Team): Team => {
  return { ...team, fouls: team.fouls + 1 };
};

// 更新球员犯规数
export const updatePlayerFouls = (team: Team, playerId: string): Team => {
  return {
    ...team,
    players: team.players.map(player =>
      player.id === playerId
        ? { ...player, fouls: player.fouls + 1 }
        : player
    ),
  };
}; 