import { map, get, find, filter } from 'lodash';

export const selectToken = state => get(state, 'user.token');
export const selectRoomName = state => get(state, 'game.doc.name')
export const selectUserName = state => get(state, 'user.doc.name');
export const selectUserId = state => get(state, 'user.doc._id');

export const selectAvailableQuests = state => get(state, 'quest.availableQuests');
export const selectGame = state => get(state, 'game.doc');
export const selectAdvertisor = state => get(selectGame(state), 'advertiser');
export const selectVillagers = state => get(selectGame(state), 'villagers');
export const selectGamePlayers = state => get(state, 'game.doc.players');
export const selectGamePlayer = state => {
  const userId = selectUserId(state);
  return find(get(state, 'game.doc.players'), { _id: userId });
}

export const selectHero = (state, heroId) => get(state, `heroes.${heroId}`); 

export const selectMyHeroes = state => map(
  get(selectGamePlayer(state), 'heroes'),
  heroId => selectHero(state, heroId),
);
export const selectMyAvailableHeroes = state => filter(
  selectMyHeroes(state),
  hero => hero.state === 'IDLE',
);

export const selectOngoingQuest = (state, questId) => find(get(state, `quest.ongoingQuests`, ({ _id }) => _id === questId));

export const selectBlacksmith = state => get(selectGame(state), 'blacksmith');
export const selectWeapons = state => get(selectGame(state), 'blacksmith.weapons');