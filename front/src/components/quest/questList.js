import React from 'react';
import { compose } from 'recompose';
import { Header } from 'semantic-ui-react';
import { get, map } from 'lodash';
import { connect } from 'react-redux';
import { selectAvailableQuests, selectGame } from '../../redux/selectors';
import CountDown from '../../util/countDown';
import QuestCard from './questCard';

import posed, { PoseGroup } from 'react-pose';

const ItemTransition = posed.div({
  enter: { x: 0, opacity: 1 },
  exit: { x: 30, opacity: 0 }
});

const QuestList = ({ quests, game }) => (
  <div className="quests">
    <Header>
      Available quests
      <CountDown duration={get(game, 'questRefreshDuration')} date={get(game, 'nextQuestRefresh')}/>
    </Header>
    <div className="quest-list">
      <PoseGroup>
        {map(quests, quest => (
          <ItemTransition key={quest._id}>
            <QuestCard quest={quest}/>
          </ItemTransition>
        ))}
      </PoseGroup>
    </div>
  </div>
);

export default compose(
  connect(
    state => ({
      game: selectGame(state),
      quests: selectAvailableQuests(state),
    }),
  )
)(QuestList)