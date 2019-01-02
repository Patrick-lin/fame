import React from 'react';
import { get } from 'lodash';

export default ({ quest }) => (
  <div>
    <span className="gold-text">{get(quest, 'moneyReward')} gold</span>
    &nbsp;• <span className="exp-text">{get(quest, 'expReward')} exp</span>
    &nbsp;• <span className="fame-text">{get(quest, 'fameReward')} fame</span>
  </div>
);