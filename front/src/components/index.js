import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Provider } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';

import Loading from '../util/loading';
import store, { testUser } from '../redux';
import Login from './login';
import Game from './game';

const loginGate = ({ testUser, isLoaded, isLogged }) => {
  if (!isLoaded) {
    return <Loading text="Loading"/>;
  }
  
  if (isLogged) {
    return <Game />
  }

  return <Login />;
}

const LoginGate = compose(
  connect(state => ({
    isLoaded: state.user.isLoaded,
    isLogged: state.user.isLogged,
  }), {
    testUser,
  }),
  lifecycle({
    componentDidMount() {
      const { testUser } = this.props;
      testUser();
    },
  }),
)(loginGate);

export default () => (
  <Provider store={store}>
    <LoginGate />
  </Provider>
);
