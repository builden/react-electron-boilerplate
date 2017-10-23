import React, { Component } from 'react';
import { remote } from 'electron';
import { observer } from 'mobx-react';
import logo from './logo.svg';
import './App.css';
import store from './store';

const { Menu, getCurrentWindow } = remote;

@observer
class App extends Component {
  showMenu = () => {
    const template = [{ label: 'Menu1', click: () => alert('click menu') }];
    const menu = Menu.buildFromTemplate(template);
    menu.popup(getCurrentWindow());
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" onContextMenu={this.showMenu} />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <p>version: {process.env.VERSION}</p>
        <p>store count: {store.count}</p>
        <button onClick={() => store.inc()}>inc</button>
        <button onClick={() => store.dec()}>dec</button>
      </div>
    );
  }
}

export default App;
