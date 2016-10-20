import React from 'react';
import BeboReact from 'bebo-react';
import App from './js/components/main.jsx';
import './style.scss';
BeboReact.render(
  <App />,
  document.getElementById('root'),
  {
    disableKeyboardDoneStrip: true,
  }
);
