import { forEach } from 'lodash';

import GameManager from '../../gameManager';
import pubsub, { REFRESH_GAME, NOTIF, refreshGame } from '../pubsub';

export const typeDefs = `
  type Player {
    _id: String
    name: String
    room: String
  }

  extend type Mutation {
    joinGame(input: Join): JoinResult
    quitGame: Boolean
  }
  input Join {
    name: String
    room: String
  }
  type JoinResult {
    success: Boolean
    message: BaseResultMessage
    player: Player
  }
`;

export const resolvers = {
  Mutation: {
    async joinGame(root, { input: { room, name } }, { Players }) {
      const player = (await Players.pfindOne({ name, room })) || (await Players.pinsert({ name, room }));
      const game = await GameManager.joinGame(room, player._id);
      forEach(game.players, (p, playerId) => {
        pubsub.publish(NOTIF, {
          playerId,
          notif: {
            title: 'New hero agency',
            message: `${player.name} has been just been founded`,
            type: 'warning',
          }
        });
      });

      return {
        success: true,
        message: 'SUCCESS',
        player: player,
      };
    },
    async quitGame(root, args, { player, Players, Games }) {
      if (player) {
        const game = Games.pfindOne({ name: player.room });
        await Promise.all([
          Players.premove({ _id: player._id }),
          Games.pupdate({ name: player.room }, { $unset: { [`players.${player._id}`]: true } }),
        ]);
        refreshGame(game.name, game._id);
      }
      return true;
    },
  },
};
