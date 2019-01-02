import { last, find, isNil, iteratee, random } from 'lodash';

const findElem = (array, value, key) => {
  const call = iteratee(key);
  return find(array, elem => {
    const e = call(elem);
    return value < e || isNil(e);
  }) || last(array);
};

/**
 * 
 * HERO
 * 
 */
export const getHeroPrice = hero => {
  return Math.pow(hero.growth, 2.45);
};

/**
 * 
 * QUEST
 * 
 */
// difficulty to rank
export const difficultyQuestRank = [
  { upto: 350, rank: 'C'  },
  { upto: 450, rank: 'C+'  },
  { upto: 600, rank: 'C++'  },
  { upto: 1000, rank: 'B' },
  { upto: 1600, rank: 'B+' },
  { upto: 2500, rank: 'B++' },
];
export const rankFromDifficulty = (diff) => findElem(difficultyQuestRank, diff, 'upto').rank;

// villager to available quest
export const villagersQuestConfig = [
  { upto: 2300, config: {
    nbQuest: 10,
    difficultyMin: 300,
    difficultyMax: 400,
  } },
  {
    upto: 2500, config: {
      nbQuest: 14,
      difficultyMin: 300,
      difficultyMax: 650,
    }
  },
  {
    upto: 3000, config: {
      nbQuest: 18,
      difficultyMin: 300,
      difficultyMax: 1100,
    }
  }
];
export const questConfigFromVillagers = villagers => findElem(villagersQuestConfig, villagers, 'upto').config;

export const villagerIncreaseFromQuest = quest => Math.floor(quest.fameReward / 2);

/**
 * 
 * QUEST COMPLETION
 * 
 */
const questTypeStatCoef = {
  Strong: {
    str: 1.6,
    agi: 1,
    int: 0.6,
  },
  Wise: {
    str: 1,
    agi: 0.6,
    int: 1.6,
  },
  Agile: {
    str: 0.6,
    agi: 1.6,
    int: 1,
  },
};
const applyQuestTypeStatCoef = (type, stat) => {
  const coef = questTypeStatCoef[type];
  return {
    str: stat.str * coef.str,
    agi: stat.agi * coef.agi,
    int: stat.int * coef.int,
  };
};
const baseQuestCompletionChance = [
  { title: 'successfully completed his quest', type: 'info', rate: 1 - 0.5, money: 1, fame: 1, exp: 1, villagers: 1 },
  { title: 'perfectly completed his quest', type: 'success', rate: 0.3, money: 1.4, fame: 1.4, exp: 1.4, villagers: 1.2 },
  { title: 'failed his quest', rate: 0.15, type: 'warning', money: 0.1, fame: -0.7, exp: 0.5, villagers: -0.2 },
  { title: 'critically failed his quest', type: 'error', rate: 0.05, money: 0, fame: -2, exp: 0, villagers: -2 },
];
export const questCompletionReward = (quest, hero) => {
  const rd = Math.random();

  const stat = applyQuestTypeStatCoef(quest.type, hero.stat);
  const coef = Math.sqrt(
    ((stat.str + stat.agi + stat.int) / (quest.difficulty / 150))
  );
  const elem = findElem(baseQuestCompletionChance, rd, ({ rate }) => 1 - (rate / Math.pow(coef, 1/6)));
  return {
    title: `${hero.name} ${elem.title}`,
    type: elem.type,
    money: Math.floor(quest.moneyReward * elem.money),
    fame: Math.floor(quest.fameReward * elem.fame),
    exp: Math.floor(quest.expReward * elem.exp),
    villagers: Math.floor(villagerIncreaseFromQuest(quest) * elem.villagers),
  };
};

/**
 * 
 * HERO
 * 
 */

const growthRank = [
  { upto: 70, rank: 'C' },
  { upto: 80, rank: 'C+' },
  { upto: 90, rank: 'C++' },
  { upto: 100, rank: 'B' },
];

export const growthToRank = (growth) => findElem(growthRank, growth, 'upto').rank;

const heroTypeConfig = {
  Strong: {
    str: 1.2,
    agi: 0.8,
    int: 0.6,
  },
  Agile: {
    str: 0.6,
    agi: 1.2,
    int: 0.8,
  },
  Wise: {
    str: 0.8,
    agi: 0.6,
    int: 1.2,
  },
};
export const computeAddStat = (stat, level, additionalLevel, { type, growth }) => {
  if (additionalLevel <= 0) {
    return 0;
  }
  const typeCoef = heroTypeConfig[type][stat];
  // const rankCoef = rankConfig[rank].coef;
  const additionalStat = Math.log(level + 2) * typeCoef * (growth / 100);
  return additionalStat + computeAddStat(stat, level + 1, additionalLevel - 1, { type, growth });
};

/**
 * 
 * CITY
 * 
 */
const cityVillagerRank = [
  { upto: 1000, rank: 'Ruin' },
  { upto: 1500, rank: 'Desolate hamlet' },
  { upto: 2100, rank: 'Hamlet' },
  { upto: 2300, rank: 'Village' },
  { upto: 2500, rank: 'Town' },
  { upto: 3000, rank: 'Large town' },
  { upto: 4000, rank: 'City' },
  { upto: 8000, rank: 'Large city' },
];
export const villagerToRank = villagers => findElem(cityVillagerRank, villagers, 'upto').rank;
export const isAdvertiserUnlocked = game => game.villagers > 2500;

// Advertisor
export const ads = [
  { _id: '1', minVillagers: 2500, title: 'Distribute fliers in the street', price: 1500, fame: 700 },
  { _id: '2', minVillagers: 2700, title: 'Big affiche', price: 7000, fame: 4000 },
  { _id: '3', minVillagers: 3000, title: 'Tv ad', price: 7000, fame: 4000 },
];
export const getAvailableAds = game => ads.filter(({ minVillagers }) => game.villagers > minVillagers);
export const getAd = adId => ads.find(({ _id }) => adId === _id);

// Blacksmith
export const blackSmithThreshold = 2500;
export const blackSmithConfigFromGame = game => {
  const coef = Math.pow(game.villagers / 50, 1.2);
  return {
    nbWeapon: Math.sqrt(game.villagers / 20),
    min: coef * 0.8,
    max: coef * 1.4,
  };
};

export const generateWeaponStatFromCoef = (coef) => {
  let stats = Math.floor(Math.pow(coef, 1.2));
  const str = random(0, stats);
  stats -= str;
  const agi = random(0, stats);
  stats -= agi;
  const int = stats;

  return {
    str,
    agi,
    int,
  };
};

const weaponRank = [
  { upto: 90, rank: 'C' },
  { upto: 110, rank: 'C+' },
  { upto: 130, rank: 'C++' },
  { upto: 150, rank: 'B' },
  { upto: 170, rank: 'B+' },
  { upto: 200, rank: 'B++' },
  { upto: 250, rank: 'A' },
];
export const weaponRankFromCoef = coef => findElem(weaponRank, coef, 'upto').rank;

// Academy
export const academyThreshold = 2500;

const academyHeroVillagers = [
  { upto: 2500, config: { levelMin: 1, levelMax: 1, growthMin: 70, growthMax: 90 } },
  { upto: 3000, config: { levelMin: 1, levelMax: 5, growthMin: 70, growthMax: 110 } },
  { upto: 3500, config: { levelMin: 1, levelMax: 10, growthMin: 70, growthMax: 130 } },
  { upto: 4000, config: { levelMin: 1, levelMax: 20, growthMin: 70, growthMax: 150 } },
];
export const getAcademyHeroConfig = game => findElem(academyHeroVillagers, game.villagers, 'upto').config;