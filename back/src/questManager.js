import { random } from 'lodash';
import { Games, Quests, Heroes } from './db';
import { QUEST_REFRESH_INTERVAL } from './constants';

import HeroManager from './heroManager';
import { sendNotif, refreshGame } from './schema/pubsub';
import { rankFromDifficulty, questConfigFromVillagers, questCompletionReward } from './formulars';
import { oneOf } from './util';
import { randomQuestTitle } from './random/questTitle';

class QuestManager {
  // Quest generation
  generateQuest({ gameId, config }) {
    const difficulty = Math.floor(random(config.difficultyMin, config.difficultyMax, true));
    let counter = difficulty;
    const moneyReward = random(0, counter);
    counter -= moneyReward;
    const expReward = random(0, counter);
    counter -= expReward;
    const fameReward = counter;

    return Quests.pinsert({
      gameId,
      state: 'available',
      type: oneOf(['Strong', 'Wise', 'Agile']),
      title: randomQuestTitle(),
      rank: rankFromDifficulty(difficulty),
      difficulty,
      moneyReward,
      expReward,
      fameReward,
    });
  }
  generateQuests(nb, { gameId, config }) {
    for (let i = 0; i < nb; i++) {
      this.generateQuest({ gameId, config });
    }
  }

  generateGameQuest(game) {
    const config = questConfigFromVillagers(game.villagers);
    return this.generateQuests(config.nbQuest, { gameId: game._id, config });
  }

  // Quest proccessor
  process(questId, endAt) {
    setTimeout(async () => {
      const quest = await Quests.pfindOne({ _id: questId });
      await Quests.pupdate({ _id: questId }, { $set: { state: 'DONE' } });
      const hero = await Heroes.pfindOne({ questId });

      if (!hero || !quest) {
        return;
      }

      const reward = questCompletionReward(quest, hero);
      const exp = hero.exp + reward.exp;
      const level = HeroManager.computeLevel(exp);

      await Heroes.pupdate({ _id: hero._id }, {
        $set: {
          questId: null,
          state: 'IDLE',
          stateEndAt: null,
          stateDuration: null,

          level,
          stat: HeroManager.computeHeroLevelUpState(hero, level),
          exp,
        },
      });
      sendNotif({
        playerId: hero.playerId,
        title: reward.title,
        message: `+${reward.fame} Fame +${reward.money} Gold +${reward.exp} Exp`,
        type: reward.type,
      });

      const key = `players.${hero.playerId}`;
      await Games.pupdate({ _id: quest.gameId, [key]: { $exists: 1 } }, {
        $inc: {
          villagers: reward.villagers,
          [`${key}.money`]: reward.money,
          [`${key}.fame`]: reward.fame,
        },
      });
      const game = await Games.pfindOne({ _id: quest.gameId });
      if (game) {
        refreshGame(game.name, game._id);
      }
    }, endAt - Date.now());
  }
  async processOngoing() {
    (await Quests.pfind({ state: 'ongoing' })).forEach(quest => this.process(quest._id, quest.endAt));
  }

  // Quest refresher
  async gameQuestRefresher(gameId) {
    const game = await Games.pfindOne({ _id: gameId });
    if (!game) {
      return;
    }

    setTimeout(async () => {
      if (game) {
        await Promise.all([
          Quests.premove({ gameId, state: 'available' }, { multi: true }),
          Games.pupdate({ _id: gameId }, { $set: { nextQuestRefresh: Date.now() + QUEST_REFRESH_INTERVAL } }),
        ]);

        this.generateGameQuest(game);
        refreshGame(game.name, game._id);
        this.gameQuestRefresher(gameId);
      }
    }, game.nextQuestRefresh - Date.now());
  }

  async startAllGameQuestRefresher() {
    (await Games.pfind({}, { _id: 1 })).forEach(({ _id: gameId }) => {
      this.gameQuestRefresher(gameId);
    });
  }
}

export default new QuestManager();