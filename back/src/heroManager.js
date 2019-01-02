import { random } from 'lodash';
import faker from 'faker';

import { Heroes } from './db';

import { oneOf } from './util';
import { growthToRank, computeAddStat, getHeroPrice } from './formulars';

const startConfig = {
  Strong: {
    str: 6,
    agi: 3,
    int: 1,
  },
  Agile: {
    str: 1,
    agi: 6,
    int: 3,
  },
  Wise: {
    str: 3,
    agi: 1,
    int: 6,
  },
};

const stepConfig = (step) => {
  return {
    levelMin: 1,
    levelMax: 1,
    growthMin: 70,
    growthMax: 90,
  };
};

class HeroManager {
  computeHeroLevelUpState(hero, level) {
    if (hero.level === level) {
      return hero.stat;
    }

    const config = { type: hero.type, growth: hero.growth };
    return {
      str: hero.stat.str + computeAddStat('str', hero.level, level, config),
      agi: hero.stat.agi + computeAddStat('agi', hero.level, level, config),
      int: hero.stat.int + computeAddStat('int', hero.level, level, config),
    };
  }

  generateHero(gameId, playerId, config) {
    const type = oneOf(['Strong', 'Agile', 'Wise']);
    const level = random(config.levelMin, config.levelMax);
    const growth = random(config.growthMin, config.growthMax);
    const rank = growthToRank(growth);

    const stat = {
      str: startConfig[type].str + computeAddStat('str', 0, level, { type, growth }),
      agi: startConfig[type].agi + computeAddStat('agi', 0, level, { type, growth }),
      int: startConfig[type].int + computeAddStat('int', 0, level, { type, growth }),
    };

    const hero = {
      gameId,
      playerId,
      name: faker.name.findName(),
      type,
      rank,
      growth,
      exp: 0,
      level,
      hp: 100,
      stat,
      state: 'IDLE',
    };

    hero.price = Math.floor(getHeroPrice(hero));

    return Heroes.pinsert(hero);
  }

  generate(gameId, playerId, { step = 0 } = {}) {
    const config = stepConfig(step);
    return this.generateHero(gameId, playerId, config);
  }

  computeLevel(exp) {
    return 1 + Math.floor(exp / 100);
  }
  // level = 1 + floor(exp / 100);
  levelExpNeeded(level) {
    return (level - 1) * 100;
  }
  levelExpPercent(exp) {
    const level = this.computeLevel(exp);
    const min = this.levelExpNeeded(level);
    const max = this.levelExpNeeded(level + 1);
    return ((exp - min) / (max - min)) * 100;
  }
}

export default new HeroManager();