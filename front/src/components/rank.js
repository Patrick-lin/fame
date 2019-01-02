import React from 'react';

const rankColor = {
  C: '#fad390',
  'C+': '#f6b93b',
  'C++': '#fa983a',
  'C+++': '#e58e26',
  'B': '#6a89cc',
  'B+': '#4a69bd',
  'B++': '#1e3799',
  'B+++': '#0c2461',
}

export default ({ rank }) => (<span className="rank-insignia" style={{ color: rankColor[rank] }}>{rank}</span>)