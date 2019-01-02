import { ApolloServer } from 'apollo-server';

import { SERVER_PORT, GAME_TIMEOUT } from './constants';
import { typeDefs, resolvers } from './schema';

import { Games, Heroes, Players, Quests } from './db';

import QuestManager from './questManager';
import weaponManager from './weaponManager';
import academyManager from './academyManager';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => connection && connection.context || ({
    player: req.header('authorization') && await Players.pfindOne({ _id: req.header('authorization') }),
    Games,
    Heroes,
    Players,
    Quests,
  }),

  subscriptions: {
    async onConnect({ token }) {
      const player = await Players.pfindOne({ _id: token });
      return {
        player,
        Games,
        Heroes,
        Players,
        Quests,
      };
    },
    keepAlive: 15 * 60 * 1000,
  },

  playground: true,
  debug: true,
  introspection: true,
});

const startup = () => {
  // intervally remove unused game (no heartbeat within 20s)
  async function checkConnectedGameHeartbeat() {
    const gameToRemove = [];
    const timeout = Date.now() - GAME_TIMEOUT;
    (await Games.pfind({ heartbeat: { $lte: timeout } })).forEach(({ _id }) => {
      gameToRemove.push(_id);
    });
    await Promise.all([
      Games.premove({ _id: { $in: gameToRemove } }),
      Heroes.premove({ gameId: { $in: gameToRemove } }),
      Quests.premove({ gameId: { $in: gameToRemove } }),
    ]);

    setTimeout(checkConnectedGameHeartbeat, GAME_TIMEOUT);
  }
  checkConnectedGameHeartbeat();

  // start all quest completion processing
  QuestManager.processOngoing();

  // start all game quest refresher
  QuestManager.startAllGameQuestRefresher();

  //
  weaponManager.startAllGameWeaponRefresh();

  academyManager.startAllAcademyRefresh();
};
setTimeout(startup, 300);


server.listen({ port: SERVER_PORT }).then(({ url, subscriptionsUrl }) => {
  console.log(`🚀  Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});
