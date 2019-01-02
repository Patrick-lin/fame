import React from 'react';
import { map } from 'lodash';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Header, Button } from 'semantic-ui-react';
import { selectWeapons, selectBlacksmith } from '../redux/selectors';
import Rank from './rank';
import Type from './type';
import CountDown from '../util/countDown';

const WeaponList = ({ blacksmith, weapons }) => (
  <div style={{ marginTop: '20px' }}>
    <Header>
      Available weapons
    </Header>
    <CountDown duration={blacksmith.refreshDuration} date={blacksmith.nextRefreshAt} />
    <div className="wpn-list">
    {map(weapons, ({ _id, name, rank, stat, price }) => (
      <div className="wpn-card" key={_id}>
        <Rank rank={rank} /> &nbsp;
        <span className="wpn-name">{name}</span>&nbsp;
        <div>
          <Type type={'Strong'}>+{stat.str} Str</Type>&nbsp;
          <Type type={'Agile'}>+{stat.agi} Agi</Type>&nbsp;
          <Type type={'Wise'}>+{stat.int} Int</Type>&nbsp;
        </div>
        <div>
          Cost <span className="gold-text">{price} Gold</span>
        </div>
        <Button color="red" style={{ width: '100%', marginTop: '5px' }}>BUY</Button>
      </div>
    ))}
    </div>
  </div>
);

export default compose(
  connect(
    state => ({
      blacksmith: selectBlacksmith(state),
      weapons: selectWeapons(state),
    }),
  ),
)(WeaponList);