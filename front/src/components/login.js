import React from 'react';
import { compose, withHandlers, withState, fromRenderProps } from 'recompose';
import { connect } from 'react-redux';
import { Button, Grid, Form } from 'semantic-ui-react'
import { Mutation } from 'react-apollo';
import { get } from 'lodash';
import { JOIN } from '../apollo/query';

import { loginSuccess } from '../redux';
import { NotificationManager } from 'react-notifications';

const Login = ({ onLogin, name, setName, room, setRoom }) => (
  <Grid>
    <Grid.Row style={{ height: '200px'}}></Grid.Row>
    <Grid.Row centered>
      <Form style={{ width: '500px' }} onSubmit={onLogin}>
        <Form.Field>
          <label>Guild name</label>
          <input placeholder='Guild name' value={name} onChange={e => setName(e.target.value)} />
        </Form.Field>
        <Form.Field>
          <label>City</label>
          <input placeholder='City' value={room} onChange={e => setRoom(e.target.value)} />
        </Form.Field>
        <Button type='submit' color="red">Join</Button>
      </Form>
    </Grid.Row>
  </Grid>
);

export default compose(
  connect(state => ({}), { loginSuccess }),
  withState('name', 'setName', ''),
  withState('room', 'setRoom', ''),
  fromRenderProps(
    ({ children }) => <Mutation mutation={JOIN} children={children}/>,
    (joinGame) => ({ joinGame })
  ),
  withHandlers({
    onLogin: ({ client, name, room, loginSuccess, joinGame }) => async () => {
      const res = await joinGame({ variables: { input: { name, room } } });
      const { success, player } = get(res, 'data.joinGame');

      if (success) {
        NotificationManager.success('City joined');
        loginSuccess(player);
      } else {
        NotificationManager.error('Could not join');
      }
    }
  }),
)(Login);