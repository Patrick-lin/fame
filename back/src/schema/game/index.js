import { map, sortBy } from 'lodash';
import { withFilter } from 'apollo-server';

import gameManager from '../../gameManager';
import questManager from '../../questManager';
import pubsub, { REFRESH_QUEST, REFRESH_HEROES, REFRESH_GAME, NOTIF, refreshGame, sendNotif } from '../pubsub';
import heroManager from '../../heroManager';
import { QUEST_REFRESH_INTERVAL, WEAPON_REFRESH_INTERVAL, ACADEMY_REFRESH_INTERVAL } from '../../constants';
import { villagerToRank, isAdvertiserUnlocked, getAvailableAds, getAd, blackSmithThreshold, academyThreshold } from '../../formulars';
import { Weapons } from '../../db';

export const typeDefs = `
  type Game {
    name: String
    rank: String

    players: [PlayerState]
    availableQuests: [Quest]
    ongoingQuests: [Quest]
    heroes: [Hero]

    villagers: Float

    questRefreshDuration: Float
    nextQuestRefresh: Float

    advertiser: Advertiser
    blacksmith: Blacksmith
    academy: Academy
  }

  type Advertiser {
    isUnlocked: Boolean
    ads: [Ad]
  }
  type Ad {
    _id: String
    title: String
    price: Float
    fame: Float
  }

  type Academy {
    isUnlocked: Boolean
    heroes: [Hero]
    refreshDuration: Float
    nextRefreshAt: Float
  }

  type Blacksmith {
    isUnlocked: Boolean
    weapons: [Weapon]
    refreshDuration: Float
    nextRefreshAt: Float
  }

  type Weapon {
    _id: ID
    name: String
    rank: String
    stat: HeroStat
    price: Float
  }

  type Quest {
    _id: String
    title: String
    type: String
    rank: String
    moneyReward: Float
    fameReward: Float
    expReward: Float
  }

  type Hero {
    _id: String
    type: String
    name: String
    state: String

    price: Float

    rank: String
    growth: Float

    level: Float
    exp: Float
    nextLevelExp: Float
    nextLevelPercent: Float

    stat: HeroStat
    stateEndAt: Float
    stateDuration: Float
    questId: ID
  }
  type HeroStat {
    str: Float
    agi: Float
    int: Float
  }

  type PlayerState {
    _id: String
    name: String
    money: Float
    fame: Float
    heroes: [ID]
  }

  extend type Mutation {
    game: Game
    gameHeartbeat: Boolean
    takeQuest(input: TakeQuest!): Boolean
    payAd(input: PayAd!): Boolean
    recruit(input: Recruit!): Boolean
  }
  input Recruit {
    heroId: ID!
  }

  input PayAd {
    adId: ID!
  }

  input TakeQuest {
    questId: ID
    heroId: ID
  }

  type Notif {
    title: String
    message: String
    type: String
  }

  extend type Subscription {
    game: Game
    availableQuests: [Quest]
    heroes: [Hero]

    notif: Notif

    addAvailableQuests: [Quest]
    removeAvailableQuests: [Quest]

    removeOngoingQuests: [Quest]
    addOngoingQuests: [Quest]
  }
`;

export const resolvers = {
  Mutation: {
    game: async (root, args, { player, Games }) => {
      if (!player) {
        return null;
      }
      return Games.pfindOne({ name: player.room });
    },
    gameHeartbeat: async (root, args, { player }) => {
      if (!player) {
        return false;
      }
      await gameManager.heartbeat(player);
      return true;
    },
    takeQuest: async (root, { input: { questId, heroId } }, { player, Heroes, Quests }) => {
      if (!player) {
        return false;
      }
      const hero = await Heroes.pfindOne({ _id: heroId });

      if (hero.state !== 'IDLE') {
        return false;
      }

      const duration = 5 * 1000;
      const endAt = Date.now() + duration;
      await Quests.pupdate({ _id: questId, state: 'available' }, {
        $set: {
          state: 'ongoing',
          heroId,
          endAt,
        },
      });
      await Heroes.pupdate({ _id: heroId }, { $set: { state: 'QUEST', questId, stateDuration: duration, stateEndAt: endAt } });
      questManager.process(questId, endAt);

      refreshGame(player.room, hero.gameId);

      return true;
    },
    recruit: async (root, { input: { heroId } }, { player, Games, Heroes }) => {
      if (!player) {
        return false;
      }
      
      const hero = await Heroes.pfindOne({ _id: heroId, playerId: null });
      if (!hero) {
        return false;
      }
      const game = await Games.findOne({ name: player.room });
      if (game.players[player._id].money < hero.price) {
        return false;
      }
      await Promise.all([
        Games.pupdate({ _id: hero.gameId }, { $push: { [`players.${player._id}.heroes`]: heroId } }),
        Heroes.pupdate({ _id: hero._id }, { $set: { playerId: player._id } }),
      ]);

      refreshGame(player.room, hero.gameId);
      return true;
    },
    payAd: async (root, { input: { adId } }, { player, Games }) => {
      if (!player) {
        return false;
      }
      const game = await Games.pfindOne({ name: player.room });
      const p = game.players[player._id];
      const ad = getAd(adId);
      if (p.money < ad.price) {
        return false;
      }
      await Games.pupdate({ _id: game._id }, {
        $inc: {
          [`players.${player._id}.fame`]: ad.fame,
          [`players.${player._id}.money`]: -ad.price,
        },
      });
      refreshGame(player.room, game._id);
      sendNotif({
        playerId: player._id,
        title: ad.title,
        message: `+ ${ad.fame} Fame`,
        type: 'success',
      });
      return true;
    },
  },
  Game: {
    rank: game => villagerToRank(game.villagers),
    players: (game, args, { Players }) => Promise.all(map(game.players, async (player, _id) => {
      const p = await Players.pfindOne({ _id });
      player._id = _id;
      player.name = p.name;
      return player;
    })),
    advertiser: game => game,
    blacksmith: game => game,
    academy: game => game,
    questRefreshDuration: () => QUEST_REFRESH_INTERVAL,

    availableQuests: async (game, args, { Quests }) => {
      const quests = await Quests.pfind({ gameId: game._id, state: 'available' });
      return sortBy(quests, 'difficulty');
    },
    ongoingQuests: (game, args, { Quests }) => Quests.pfind({ gameId: game._id, state: 'ongoing' }),
    heroes: (game, args, { Heroes }) => Heroes.pfind({ gameId: game._id }),
  },
  Advertiser: {
    isUnlocked: game => isAdvertiserUnlocked(game),
    ads: game => getAvailableAds(game),
  },
  Blacksmith: {
    isUnlocked: game => game.villagers >= blackSmithThreshold,
    weapons: game => Weapons.pfind({ gameId: game._id }),
    refreshDuration: () => WEAPON_REFRESH_INTERVAL,
    nextRefreshAt: game => game.nextWeaponRefresh,
  },
  Academy: {
    isUnlocked: game => game.villagers >= academyThreshold,
    refreshDuration: () => ACADEMY_REFRESH_INTERVAL,
    nextRefreshAt: game => game.nextAcademyRefresh,
    heroes: (game, args, { Heroes }) => Heroes.pfind({ gameId: game._id, playerId: null }),
  },
  Hero: {
    nextLevelExp: hero => heroManager.levelExpNeeded(hero.level + 1),
    nextLevelPercent: hero => heroManager.levelExpPercent(hero.exp),
  },
  PlayerState: {
  },
  Subscription: {
    notif: {
      resolve: ({ notif }) => notif, 
      subscribe: withFilter(
        () => pubsub.asyncIterator(NOTIF),
        (payload, args, { player }) => player && player._id === payload.playerId,
      ),
    },
    game: {
      resolve: ({ gameId }, args, { Games }) => Games.pfindOne({ _id: gameId }), 
      subscribe: withFilter(
        () => pubsub.asyncIterator(REFRESH_GAME),
        (payload, args, { player }) => player && player.room === payload.room,
      ),
    },
    availableQuests: {
      resolve: ({ gameId }, args, { Quests }) => Quests.pfind({ gameId, state: 'available' }), 
      subscribe: withFilter(
        () => pubsub.asyncIterator(REFRESH_QUEST),
        (payload, args, { player }) => player && player.room === payload.room,
      ),
    },
    heroes: {
      resolve: ({ gameId }, args, { Heroes }) => Heroes.pfind({ gameId }), 
      subscribe: withFilter(
        () => pubsub.asyncIterator(REFRESH_HEROES),
        (payload, args, { player }) => player && player.room === payload.room,
      ),
    }
  },
};