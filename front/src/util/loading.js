import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

import CenterSegment from './centerSegment';

export default ({ text = "Loading" }) => (
  <CenterSegment>
    <Dimmer active inverted>
      <Loader inverted>{text}</Loader>
    </Dimmer>
  </CenterSegment>
);