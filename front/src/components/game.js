import React from 'react';
import { compose, lifecycle, fromRenderProps, withPropsOnChange, withState } from 'recompose';
import { connect } from 'react-redux';
import { Button, Menu } from 'semantic-ui-react';
import { Mutation, Subscription } from 'react-apollo';
import { NotificationManager } from 'react-notifications';
import { get } from 'lodash';
import { gameLoadded, gameLoadError, logout, gameUpdate } from '../redux';
import { LOAD_GAME, GAME_HEARTBEAT, SUB_GAME, SUB_NOTIF, RECRUIT } from '../apollo/query';
import GameHeader from './header';
import Loading from '../util/loading';
import CenterSegmentText from '../util/centerSegmentText';

import HeroList from './heroList';
import HeroList2 from './hero/heroList';
import PlayerList from './playerList';
import { QuestList } from './quest';
import Advertisor from './advertisor';
import WeaponList from './weaponList';

const Game = ({ recruit, game, isLoadded, loadError, logout, activeItem, setActive }) => {
  if (!isLoadded) {
    return (
      <Loading text="Loading Game..."/>
    );
  }
  if (loadError) {
    return (
      <CenterSegmentText>
        <h3>Could not load the game (${loadError})</h3>
        <Button onClick={logout}>Quit</Button>
      </CenterSegmentText>
    );
  }

  const academy = get(game, 'academy') || {};

  return (
    <div>
      <div className="game-header-placeholder"/>
      <div className="game-body">
        <div className="game-menu">
          <Menu className="game-menu" pointing secondary vertical>
            <Menu.Item name="Quests board" active={activeItem === 'quest'} onClick={() => setActive('quest')}/>
            {get(game, 'academy.isUnlocked') && <Menu.Item name="Hero academy" active={activeItem === 'academy'} onClick={() => setActive('academy')}/>}
            {get(game, 'advertiser.isUnlocked') && <Menu.Item name="Advertising agency" active={activeItem === 'ads'} onClick={() => setActive('ads')}/>}
            {get(game, 'blacksmith.isUnlocked') && <Menu.Item name="Blacksmith forge" active={activeItem === 'forge'} onClick={() => setActive('forge')}/>}
          </Menu>
        </div>
        <div className="game-content">
          <HeroList />
          {activeItem === 'quest' && <QuestList />}
          {activeItem === 'ads' && <Advertisor />}
          {activeItem === 'forge' && <WeaponList />}
          {activeItem === 'academy' && (
            <HeroList2
              title="Available heroes"
              heroes={academy.heroes}
              showState={false}
              showPrice={true}
              duration={academy.refreshDuration}
              date={academy.nextRefreshAt}
              heroChildRender={hero => <Button color="red" onClick={() => recruit({ variables: { input: { heroId: hero._id } } })} style={{ width: '100%', marginTop: '5px' }}>Recruit</Button>}
            />
          )}
        </div>
        <PlayerList />
      </div>
      <GameHeader />
    </div>
  );
}

export default compose(
  connect(state => ({
    roomName: state.user.room,
    isLoadded: state.game.isLoadded,
    loadError: state.game.loadError,
    game: state.game.doc,
  }), {
    loadSuccess: gameLoadded,
    loadFailed: gameLoadError,
    logout,
    gameUpdate,
  }),
  fromRenderProps(
    ({ children }) => <Mutation mutation={LOAD_GAME} children={children} />,
    (loadGame) => ({ loadGame }),
  ),
  fromRenderProps(
    ({ children }) => <Mutation mutation={GAME_HEARTBEAT} children={children} />,
    gameHeartbeat => ({ gameHeartbeat }),
  ),
  fromRenderProps(
    ({ children }) => <Mutation mutation={RECRUIT} children={children} />,
    recruit => ({ recruit }),
  ),
  fromRenderProps(
    ({ children }) => <Subscription subscription={SUB_GAME} children={children} />,
    gameSub => ({
      gameSub: get(gameSub, 'data.game'),
    }),
  ),
  withPropsOnChange(['gameSub'], ({ gameUpdate, gameSub }) => {
    if (gameSub) {
      gameUpdate(gameSub);
    }
  }),
  fromRenderProps(
    ({ children }) => <Subscription subscription={SUB_NOTIF} children={children} />,
    notif => ({
      notif: get(notif, 'data.notif'),
    }),
  ),
  withPropsOnChange(['notif'], ({ notif }) => {
    if (notif) {
      try {
        NotificationManager[notif.type || 'info'](notif.title, notif.message);
      } catch(err) {
      }
    }
  }),
  lifecycle({
    async componentDidMount() {
      const { loadGame, loadSuccess, loadFailed } = this.props;
      const res = await loadGame();
      const { data: { game } } = res;
      if (game) {
        document.title = `Fame «${game.name}»`;
        NotificationManager.success('Game loaded');
        loadSuccess(game);        
        this.interval = setInterval(() => {
          this.props.gameHeartbeat();
        }, 15 * 1000);
      } else {
        loadFailed();
      }
    },
    componentWillUnmount() {
      clearInterval(this.interval);
    }
  }),
  withState('activeItem', 'setActive', 'quest'),
)(Game);