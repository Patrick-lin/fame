import React from 'react';

const color = {
  Strong: '#d8431a',
  Agile: '#26af0e',
  Wise: '#1a5cd8',
}

export default ({ type, children }) => <span style={{ color: color[type] }}>{children}</span>