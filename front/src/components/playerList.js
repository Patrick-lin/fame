import React from 'react';
import { compose } from 'recompose';
import { map } from 'lodash';
import { List } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { selectGamePlayers, selectUserId } from '../redux/selectors';

const PlayerList = ({ userId, players }) => (
  <div className="players">
    <div className="player-list">
    {map(players, ({ _id, money, fame, name }) => (
      <div className="player-card" key={_id}>
        <span className="player-name">{name}{_id === userId ? ' (You)' : ''}</span>
        <span>
          <span className="player-fame fame-text">{fame} Fame</span>
          <span className="player-money gold-text">{money} Gold</span>
        </span>
      </div>
    ))}
    </div>
    <List horizontal>
    </List>
  </div>
);

export default compose(
  connect(
    state => ({
      userId: selectUserId(state),
      players: selectGamePlayers(state),
    }),
  ),
)(PlayerList);