import { get } from 'lodash';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const loginSuccess = (player) => ({ type: LOGIN_SUCCESS, payload: { player } });

export const LOGIN_FAIL = 'LOGIN_FAIL';
export const loginFail = () => ({ type: LOGIN_FAIL });

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const logoutSuccess = () => ({ type: LOGOUT_SUCCESS });
export const logout = () => (dispatch) => {
  document.title = `Fame`;
  dispatch(logoutSuccess());
}
export const testUser = () => (dispatch) => {
  return dispatch(loginFail());
}

const defaultUserState = {
  isLoaded: false,
  isLogged: false,
};

export default (state = defaultUserState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS: return {
      ...state,
      token: get(action, 'payload.player._id'),
      doc: action.payload.player,
      isLoaded: true,
      isLogged: true,
    };
    case LOGIN_FAIL: return {
        ...state,
        isLoaded: true,
        isLogged: false,
      }
    case LOGOUT_SUCCESS: return { ...state, isLogged: false };
    default:
  }
  return state;
}
