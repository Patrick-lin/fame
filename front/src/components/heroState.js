import React from 'react';
import { compose } from 'recompose';
import { Popup } from 'semantic-ui-react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import CountDown from '../util/countDown';
import QuestReward from './questReward';
import { selectOngoingQuest } from '../redux/selectors';

const heroQuest = ({ quest, stateDuration, stateEndAt }) => (
  <div>
    <Popup
      trigger={<span>Doing a quest</span>}
      content={
        <div>
          <div>{get(quest, 'title')}</div>
          <QuestReward quest={quest} />
        </div>
      }
    />
    &nbsp;<CountDown duration={stateDuration} date={stateEndAt} />
  </div>
);

const HeroQuest = compose(
  connect(
    (state, { questId }) => ({
      quest: selectOngoingQuest(state, questId),
    })
  ),
)(heroQuest);

const HeroState = ({ state, ...props }) => {
  switch (state) {
    case 'QUEST': return <HeroQuest {...props} />;
    case 'IDLE': return <span>Is waiting for your order</span>;
    default:
  }
  return <span>{state}</span>
};

export default HeroState;