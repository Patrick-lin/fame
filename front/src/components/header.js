import React from 'react';
import { compose, fromRenderProps, withHandlers } from 'recompose';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { Button } from 'semantic-ui-react';
import { logout, selectUserName, selectRoomName, selectVillagers, selectGame } from '../redux';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

const GameHeader = ({ game, name, villagers, room, onQuit }) => (
  <div className="game-header">
    <div className="left">
      <span className="game-header-title">Fame - <strong>{get(game, 'rank')}</strong> « {room} »</span>
      <div className="game-header-villagers">
        {villagers} Villagers
      </div>
    </div>
    <div className="right">
      <span className="game-header-user">{name}</span>&nbsp;&nbsp;
      <Button color="red" onClick={onQuit}>Disband guild</Button>
    </div>
  <span className="clear"/>
  </div>
);

const QUIT = gql`
  mutation {
    quitGame
  }
`;

export default compose(
  fromRenderProps(
    ({ children }) => <Mutation mutation={QUIT} children={children} />,
    quit => ({ quit }),
  ),
  connect(state => ({
    game: selectGame(state),
    name: selectUserName(state),
    room: selectRoomName(state),
    villagers: selectVillagers(state),
  }), { logout }),
  withHandlers({
    onQuit: ({ quit, logout }) => async () => {
      await quit();
      logout();
    },
  }),
)(GameHeader);