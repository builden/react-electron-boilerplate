import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

async function start() {
  const startPage = process.env.START_PAGE || 'App';
  console.log('startPage', startPage);
  try {
    const StartComponent = (await import(`./${startPage}`)).default;
    ReactDOM.render(<StartComponent />, document.getElementById('root'));
  } catch (e) {
    console.error('start import error', e);
    const App = (await import('./App')).default;
    ReactDOM.render(<App />, document.getElementById('root'));
  }
}
start();

if (window.location.protocol !== 'file:') registerServiceWorker();
