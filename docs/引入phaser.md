# 引入Phaser

## 安装
```bash
$ yarn add phaser-ce -D
$ yarn add expose-loader -D
```

## 配置config-ovveriddes.js
```js
function injectPhaser(config) {
  Object.assign(config.resolve.alias, {
    phaser: phaser,
    'phaser-ce': phaser,
    'pixi.js': pixi,
    pixi: pixi,
    p2: p2,
  });

  config.module.rules[1].oneOf.splice(
    0,
    0,
    {
      test: /pixi\.js/,
      use: [{ loader: 'expose-loader?PIXI' }],
    },
    {
      test: /p2\.js/,
      use: [{ loader: 'expose-loader?p2' }],
    },
    {
      test: /phaser-split\.js/,
      use: [{ loader: 'expose-loader?Phaser' }],
    }
  );
}
```

## 使用
```js
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
```