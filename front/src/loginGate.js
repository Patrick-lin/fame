import React from 'react';
import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';

import Loading from './util/loading';
import { testUser } from './redux';
import Login from './components/login';
import Game from './components/game';

const loginGate = ({ isLoaded, isLogged }) => {
  if (!isLoaded) {
    return <Loading text="Loading"/>;
  }
  
  if (isLogged) {
    return <Game />
  }

  return <Login />;
}

export const LoginGate = compose(
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
