import uuid from 'uuid/v4';

import { Games, Players } from './db';

import HeroManager from './heroManager';
import QuestManager from './questManager';
import WeaponManager from './weaponManager';

import { QUEST_REFRESH_INTERVAL, WEAPON_REFRESH_INTERVAL, ACADEMY_REFRESH_INTERVAL } from './constants';
import { refreshGame } from './schema/pubsub';
import academyManager from './academyManager';

class GameManager {
  constructor() {
    this.games = {};
  }

  static async newPlayer(gameId, playerId) {
    return {
      playerId: playerId,
      fame: 100,
      money: 0,
      heartbeat: Date.now(),
      heroes: (await Promise.all([
        HeroManager.generate(gameId, playerId),
        HeroManager.generate(gameId, playerId),
        HeroManager.generate(gameId, playerId),
      ])).map(({ _id }) => _id),
    };
  }

  async joinGame(name, playerId) {
    const game = await Games.pfindOne({ name }); 

    if (!game) {
      const gameId = uuid();
      await Games.insert({
        _id: gameId,
        name,
        fame: 100,
        villagers: 2000,
        heartbeat: Date.now(),
        questRefreshDuration: QUEST_REFRESH_INTERVAL,
        nextQuestRefresh: Date.now() + QUEST_REFRESH_INTERVAL,
        nextWeaponRefresh: Date.now() + WEAPON_REFRESH_INTERVAL,
        nextAcademyRefresh: Date.now() + ACADEMY_REFRESH_INTERVAL,
        players: {
          [playerId]: await GameManager.newPlayer(gameId, playerId) 
        },
      });
      const game = await Games.pfindOne({ _id: gameId });
      await QuestManager.generateGameQuest(game);
      await QuestManager.gameQuestRefresher(gameId);
      await WeaponManager.generateGameWeapons(game);
      await WeaponManager.gameWeaponRefresh(gameId);
      await academyManager.refresh(game);
      await academyManager.academyRefresh(gameId);
    } else {
      if (!game.players[playerId]) {
        await Games.pupdate({ name }, { $set: {
          heartbeat: Date.now(),
          [`players.${playerId}`]: await GameManager.newPlayer(game._id, playerId)
        }});
        refreshGame(game.name, game._id);
      }
    }

    return this.find(name);
  }

  find(name) {
    return Games.pfindOne({ name });
  }

  heartbeat(player) {
    return Promise.all([
      Players.pupdate({ _id: player._id }, { $set: { heartbeat: Date.now() } }),
      Games.pupdate({ name: player.room }, { $set: { heartbeat: Date.now() } }),
    ]);
  }
}

export default new GameManager();