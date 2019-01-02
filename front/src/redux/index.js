import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
import { get, keyBy } from 'lodash';

import user, { LOGOUT_SUCCESS } from './user';
export * from './selectors';
export * from './user';

const GAME_LOADED = 'GAME_LOADED';
const GAME_LOAD_ERROR = 'GAME_LOAD_ERROR';
const GAME_UPDATE = 'GAME_UPDATE';

export const gameUpdate = (game) => ({
  type: GAME_UPDATE,
  payload: { game },
});
export const gameLoadError = (err) => ({
  type: GAME_LOAD_ERROR,
  payload: { err },
});
export const gameLoadded = game => ({
  type: GAME_LOADED,
  payload: { game },
});

const defaultGameState = {
  isLoaded: false,
}
const game = (state = defaultGameState, action) => {
  switch (action.type) {
    case LOGOUT_SUCCESS: return defaultGameState;
    case GAME_LOAD_ERROR: return { ...state, isLoadded: true, loadError: 'Game closed' };
    case GAME_LOADED: return { ...state, isLoadded: true, loadError: '', doc: action.payload.game };
    case GAME_UPDATE: return { ...state, doc: action.payload.game };
    default:
  }
  return state;
}

export const UPDATE_AVAILABLE_QUESTS = 'UPDATE_AVAILABLE_QUESTS';
export const updateAvailableQuests = (quests) => ({
  type: UPDATE_AVAILABLE_QUESTS,
  payload: { quests }
})
export const REMOVE_AVAILABLE_QUESTS = 'REMOVE_AVAILABLE_QUESTS';
export const removeAvailableQuests = (quests) => ({
  type: REMOVE_AVAILABLE_QUESTS,
  payload: { quests }
})

const defaultQuest = { availableQuests: [], ongoingQuests: [] };
const quest = (state = defaultQuest, action) => {
  switch(action.type) {
    case GAME_UPDATE:
    case GAME_LOADED: return {
      ...state,
      availableQuests: get(action, 'payload.game.availableQuests'),
      ongoingQuests: get(action, 'payload.game.ongoingQuests'),
    };
    case UPDATE_AVAILABLE_QUESTS: return {
      ...state,
      availableQuests: action.payload.quests,
    };
    default:
  }
  return state;
}

const UPDATE_HEROES = 'UPDATE_HEROES';
export const updateHeroes = (heroes) => ({
  type: UPDATE_HEROES,
  payload: { heroes },
})
const heroes = (state = {}, action) => {
  switch (action.type) {
    case GAME_UPDATE:
    case GAME_LOADED: return keyBy(get(action, 'payload.game.heroes'), '_id');
    case UPDATE_HEROES: console.log({ ...state, ...keyBy(action.payload.heroes, '_id') }); return { ...state, ...keyBy(action.payload.heroes, '_id') };
    default:
      break;
  }
  return state;
}

const rootReducer = combineReducers({
  user,
  game,
  quest,
  heroes,
});

const store = createStore(
  rootReducer,
  applyMiddleware(thunk),
);

export default store;