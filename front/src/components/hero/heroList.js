import React from 'react';
import posed, { PoseGroup } from 'react-pose';
import { Header } from 'semantic-ui-react';
import { map } from 'lodash';
import { HeroCard } from '.';
import CountDown from '../../util/countDown';

const ItemTransition = posed.div({
  enter: { y: 0, opacity: 1 },
  exit: { y: 30, opacity: 0 }
});

const HeroList = ({ title, heroes, showState, showPrice, duration, date, heroChildRender = () => null }) => (
  <div className="quests">
    <Header>
      {title}
      {duration && <CountDown duration={duration} date={date}/>}
    </Header>
    <div className="quest-list">
      <PoseGroup>
        {map(heroes, hero => (
          <ItemTransition key={hero._id}>
            <HeroCard hero={hero} showState={showState} showPrice={showPrice}>
              {heroChildRender(hero)}
            </HeroCard>
          </ItemTransition>
        ))}
      </PoseGroup>
    </div>
  </div>
);

export default HeroList;