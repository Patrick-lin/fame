import React from 'react';
import { Segment } from 'semantic-ui-react';

import Center from './center';

export default ({ children }) => (
  <Center>
    <Segment style={{ width: '70%', height: '30vh' }}>
      {children}
    </Segment>
  </Center>
);