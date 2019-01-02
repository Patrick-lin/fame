import React from 'react';
import { Grid } from 'semantic-ui-react';

import CenterSegment from './centerSegment';

export default ({ children }) => (
  <CenterSegment>
    <Grid textAlign="center" style={{ height: '100%'}}>
      <Grid.Row verticalAlign="middle">
        <Grid.Column>
        {children}

        </Grid.Column>
      </Grid.Row>
    </Grid>
  </CenterSegment>
)