import Phaser from 'phaser-ce';

class Boot extends Phaser.State {
  create() {
    this.stage.setBackgroundColor(0xff0000);
  }
}

export default Boot;
