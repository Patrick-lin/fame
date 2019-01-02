import { ApolloClient } from 'apollo-client';

import { WebSocketLink } from 'apollo-link-ws';
import { split, ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';

import { InMemoryCache } from 'apollo-cache-inmemory';

import { URI, WS_URI } from '../constants';

import store, { selectToken, gameLoadded } from '../redux';
import { LOAD_GAME, GAME_HEARTBEAT } from './query';

const getToken = () => selectToken(store.getState());

const link = ApolloLink.from([
  setContext(() => {
    const token = getToken();
    return {
      headers: {
        authorization: token ? `${token}` : null,
      },
    };
  }),
  split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    new WebSocketLink({
      uri: WS_URI,
      options: {
        lazy: true,
        timeout: 30000,
        reconnect: true,
        connectionParams: () => ({
          token: getToken(),
        }),
        connectionCallback: async () => {
          try {
            client.mutate({ mutation: GAME_HEARTBEAT });
            const game = await client.mutate({ mutation: LOAD_GAME });
            if (game && game.data && game.data.game) {
              store.dispatch(gameLoadded(game.data.game));
            }
          } catch (err) {}
        },
      }
    }),
    createHttpLink({
      uri: URI,
    }),
  ),
]);

var client = new ApolloClient({
  link,
  cache: new InMemoryCache({
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

export default client;