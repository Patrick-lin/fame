import React from 'react';
import { Grid } from 'semantic-ui-react';

export default ({ children }) => (
  <Grid>
    <Grid.Row style={{ height: '200px'}}></Grid.Row>
    <Grid.Row centered>{children}</Grid.Row>
  </Grid>
);