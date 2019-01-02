import React from 'react';
import { Segment, Popup, Progress } from 'semantic-ui-react';
import HeroState from '../heroState';
import Rank from '../rank';
import Type from '../type';

const HeroStat = ({ stat }) => (
  <span>
    <Popup flowing trigger={
        <span><Type type="Strong">{stat.str.toFixed(2)}</Type></span>
      } content="Strength">
    </Popup>
    &nbsp;•&nbsp;
    <Popup trigger={
      <span><Type type="Agile">{stat.agi.toFixed(2)}</Type></span>
    } content="Agility">
    </Popup>
    &nbsp;•&nbsp;
    <Popup trigger={
      <span><Type type="Wise">{stat.int.toFixed(2)}</Type></span>
    } content="Intelligence">
    </Popup>
  </span>
);

const HeroCard = ({ hero, showState, showPrice, children }) => (
  <div className="hero-card">
    <Segment className="hero-card-segment">
      <Popup
        trigger={<span><Rank rank={hero.rank} /></span>}
        content={`Growth rate ${hero.growth}`}
      />&nbsp;
      {hero.name} <Type type={hero.type}><strong>{hero.type}</strong></Type> 
      <Progress attached="top" color="red" percent={hero.nextLevelPercent.toFixed(1)} size="tiny" />
      <div>
        <strong>Lv {hero.level}.</strong> <Popup trigger={<span style={{ fontSize: 9 }}>{hero.nextLevelPercent.toFixed(1)} %</span>} content={`Experience (${hero.exp} / ${hero.nextLevelExp})`}/>
        &nbsp;<HeroStat stat={hero.stat} />
      </div>
      <div>
        {showState && 
          <HeroState
            state={hero.state}
            stateDuration={hero.stateDuration}
            stateEndAt={hero.stateEndAt}
            questId={hero.questId}
          />
        }
        {showPrice && 
          <div>Cost <span className="gold-text">{hero.price} Gold</span></div>
        }
        {children}
      </div>
    </Segment>
  </div>
);
HeroCard.defaultProps = {
  showState: true,
  showPrice: false,
}

export default HeroCard;