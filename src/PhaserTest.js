import React, { Component } from 'react';
import Game from './phaser/Game';

class PhaserTest extends Component {
  componentDidMount() {
    new Game(100, 100, this.container);
  }
  render() {
    return (
      <div>
        <div>Phaser Test</div>
        <div ref={elm => (this.container = elm)} style={{ height: '200px' }} />
      </div>
    );
  }
}

export default PhaserTest;
