import { range, random } from 'lodash';

import { Games, Weapons } from './db';
import { WEAPON_REFRESH_INTERVAL } from './constants';
import { refreshGame } from './schema/pubsub';
import { blackSmithConfigFromGame, generateWeaponStatFromCoef, weaponRankFromCoef, blackSmithThreshold } from './formulars';
import { randomWeaponName } from './random/weaponName';

class WeaponManager {

  async generateWeapons(gameId, config) {
    const coef = random(config.min, config.max);
    return Weapons.pinsert({
      gameId,
      name: randomWeaponName(),
      owner: null,
      equipedBy: null,
      coef,
      price: Math.floor(coef * 50),
      rank: weaponRankFromCoef(coef),
      stat: generateWeaponStatFromCoef(coef),
    });
  }

  async generateGameWeapons(game) {
    const config = blackSmithConfigFromGame(game);
    await Promise.all(
      range(0, config.nbWeapon).map(() => this.generateWeapons(game._id, config)),
    );
  }

  async gameWeaponRefresh(gameId) {
    const game = await Games.pfindOne({ _id: gameId });
    if (!game) {
      return;
    }

    setTimeout(async () => {
      await Promise.all([
        Weapons.premove({ gameId, owner: null }, { multi: true }),
        Games.pupdate({ _id: gameId }, { $set: { nextWeaponRefresh: Date.now() + WEAPON_REFRESH_INTERVAL } }),
      ]);
      await this.generateGameWeapons(await Games.pfindOne({ _id: gameId }));
      refreshGame(game.name, game._id);

      this.gameWeaponRefresh(gameId);
    }, game.nextWeaponRefresh - Date.now());
  }

  async startAllGameWeaponRefresh() {
    (await Games.pfind({ villagers: { $gt: blackSmithThreshold } })).forEach(game => this.gameWeaponRefresh(game._id));
  }
}

export default new WeaponManager();