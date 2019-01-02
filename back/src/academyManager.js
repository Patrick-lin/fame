import { range } from 'lodash';

import { Games, Heroes } from './db';
import { ACADEMY_REFRESH_INTERVAL } from './constants';
import { refreshGame } from './schema/pubsub';
import heroManager from './heroManager';
import { getAcademyHeroConfig, academyThreshold } from './formulars';

class AcademyManager {
  async refresh(game) {
    return Promise.all(range(0, 10).map(() => heroManager.generateHero(game._id, null, getAcademyHeroConfig(game))));
  }

  async academyRefresh(gameId) {
    const game = await Games.pfindOne({ _id: gameId });

    if (game) {
      setTimeout(async () => {
        const game = await Games.pfindOne({ _id: gameId });
        if (game.villagers > academyThreshold) {
          await Promise.all([
            Heroes.premove({ gameId, playerId: null }, { multi: true }),
          ]);
  
          refreshGame(game.name, game._id);
        }


        await Games.update({ _id: gameId }, { $set: { nextAcademyRefresh: Date.now() + ACADEMY_REFRESH_INTERVAL } });
        await this.refresh(game);
        this.academyRefresh(gameId);
      }, game.nextAcademyRefresh - Date.now());
    }
  }

  async startAllAcademyRefresh() {
    (await Games.pfind({}, { _id: 1 })).forEach(({ _id: gameId }) => {
      this.academyRefresh(gameId);
    });
  }
}

export default new AcademyManager();