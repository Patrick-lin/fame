import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import 'react-notifications/lib/notifications.css';

import { Provider } from 'react-redux';
import { ApolloProvider } from "react-apollo";
import { NotificationContainer } from 'react-notifications';

import store from './redux';
import apolloClient from './apollo';
import { LoginGate } from './loginGate';

export default () => (
  <Provider store={store}>
    <ApolloProvider client={apolloClient}>
      <div>
        <LoginGate />
        <NotificationContainer />
      </div>
    </ApolloProvider>
  </Provider>
);