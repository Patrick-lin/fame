import React from 'react';
import { compose } from 'recompose';
import { Header } from 'semantic-ui-react';
import { map } from 'lodash';
import { connect } from 'react-redux';
import { HeroCard } from './hero';
import { selectMyHeroes } from '../redux/selectors';

const HeroList = ({ heroes }) => (
  <div>
    <Header textAlign="center">Heroes</Header>
    <div className="dv-list">
      {map(heroes, hero => (
          <HeroCard key={hero._id} hero={hero}/>
      ))}
    </div>
  </div>
);

export default compose(
  connect(
    state => ({
      heroes: selectMyHeroes(state),
    }),
  ),
)(HeroList);