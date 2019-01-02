import { PubSub } from 'apollo-server';

const pubsub = new PubSub();

export const REFRESH_GAME = 'REFRESH_GAME';
export const refreshGame = (room, gameId) => pubsub.publish(REFRESH_GAME, {
  room,
  gameId,
});
export const NOTIF = 'NOTIF';
export const sendNotif = ({ playerId, title, message, type }) => pubsub.publish(NOTIF, {
  playerId,
  notif: {
    title,
    message,
    type,
  },
});

export const REFRESH_QUEST = 'REFRESH_QUEST';
export const REFRESH_HEROES = 'REFRESH_HEROES';

export const ADD_AVAILABLE_QUESTS = 'ADD_AVAILABLE_QUESTS';
export const REMOVE_AVAILABLE_QUESTS = 'REMOVE_AVAILABLE_QUESTS';

export const ADD_ONGOING_QUESTS = 'ADD_ONGOING_QUESTS';
export const REMOVE_ONGOING_QUESTS = 'REMOVE_ONGOING_QUESTS';

export default pubsub;
