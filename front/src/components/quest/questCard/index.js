import React from 'react';
import { connect } from 'react-redux';
import { Select } from 'semantic-ui-react';
import { compose, withProps, withHandlers, fromRenderProps } from 'recompose';
import { map, size } from 'lodash';
import { Mutation } from 'react-apollo';

import Type from '../../type';
import QuestReward from '../../questReward';
import { selectMyAvailableHeroes } from '../../../redux/selectors';
import { TAKE_QUEST } from '../../../apollo/query';

import './questCard.css';
import Rank from '../../rank';

const QuestCard = ({ quest, heroes, onSelect }) => (
  <div className="quest-card">
    <div className="quest-card-header">
      <Rank rank={quest.rank} /> <Type type={quest.type}><strong>{quest.type}</strong></Type>
      <span className="quest-card-title">{quest.title}</span>
      <QuestReward quest={quest} />
    </div>
    <Select
      selectOnBlur={false}
      style={{ width: '100%' }}
      disabled={!size(heroes)}
      placeholder={size(heroes) ? 'Give quest to a hero' : 'No hero available'}
      value={null}
      onChange={onSelect}
      options={heroes}
    />
  </div>
);

export default compose(
  connect(
    state => ({
      heroes: selectMyAvailableHeroes(state),
    }),
  ),
  withProps(({ heroes }) => ({
    heroes: map(heroes, hero => ({ key: hero._id, text: <span>{hero.name} <strong>Lv {hero.level}.</strong> <Type type={hero.type}>{hero.type}</Type></span>, value: hero._id })),
  })),
  fromRenderProps(
    ({ children }) => <Mutation mutation={TAKE_QUEST} children={children} />,
    takeQuest => ({ takeQuest }),
  ),
  withHandlers({
    onSelect: ({ quest, heroes, takeQuest }) => async (event, data) => {
      await takeQuest({ variables: { input: { questId: quest._id, heroId: data.value } } });
    }
  })
)(QuestCard);