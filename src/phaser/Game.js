import 'pixi.js';
import 'p2';
import Phaser from 'phaser-ce';
import Boot from './Boot';

class Game extends Phaser.Game {
  constructor(width, height, parentElm) {
    super(width, height, Phaser.AUTO, parentElm);

    this.state.add('Boot', Boot);
    this.state.start('Boot');
  }
}

export default Game;
