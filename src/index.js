import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

async function start() {
  const startPage = process.env.START_PAGE || 'App';
  try {
    const StartComponent = (await import(`./${startPage}`)).default;
    ReactDOM.render(<StartComponent />, document.getElementById('root'));
  } catch (e) {
    const App = (await import('./App')).default;
    ReactDOM.render(<App />, document.getElementById('root'));
  }
}
start();

registerServiceWorker();
