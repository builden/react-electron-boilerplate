const path = require('path');
const { injectBabelPlugin, getBabelLoader } = require('react-app-rewired');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const program = require('commander');
const version = require('./package.json').version;
const rewireLess = require('react-app-rewire-less');

const inDev = process.env.NODE_ENV === 'development';
const phaserModule = path.join(__dirname, './node_modules/phaser-ce/');
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
const pixi = path.join(phaserModule, 'build/custom/pixi.js');
const p2 = path.join(phaserModule, 'build/custom/p2.js');
const electron = path.join(__dirname, './src/__mocks__/electron.web.js');

program
  .version(version)
  .option('-i, --index <name>', 'change index js file')
  .option('-w, --web', 'show at web')
  .parse(process.argv);

function injectAntd(config, env) {
  config = injectBabelPlugin(
    ['import', { libraryName: 'antd', style: true }],
    config
  );
  config = rewireLess.withLoaderOptions({
    modifyVars: {
      '@font-size-base': '14px',
      '@icon-url': '"~antd-iconfont/iconfont"',
    },
  })(config, env);
}

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

module.exports = function override(config, env) {
  if (!program.web) {
    config.target = 'electron-renderer';
  } else {
    Object.assign(config.resolve.alias, { electron: electron });

    require('react-dev-utils/openBrowser');
    const openBrowserPath = require.resolve('react-dev-utils/openBrowser');
    require.cache[openBrowserPath].exports = url => {};
  }

  if (program.index)
    config.entry[config.entry.length - 1] = path.join(
      __dirname,
      `./src/TestIndex/${program.index}.js`
    );

  if (inDev) {
    const loader = getBabelLoader(config.module.rules);
    if (loader.options.presets)
      loader.options.presets[0] = 'babel-preset-react';
    config = injectBabelPlugin('syntax-dynamic-import', config);
    config = injectBabelPlugin('transform-object-rest-spread', config);
    config = injectBabelPlugin('transform-class-properties', config);
    config = injectBabelPlugin('transform-decorators-legacy', config);
  } else {
    config = injectBabelPlugin('transform-decorators-legacy', config);
    config.plugins.splice(3, 1); // remove UglifyJSPlugin, for 'lua-fmt'
  }

  config.resolve.modules.push(path.join(__dirname, 'src'));

  injectPhaser(config);
  injectAntd(config, env);

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        VERSION: JSON.stringify(version),
      },
    }),
    new CopyWebpackPlugin([
      {
        from: `node_modules/monaco-editor/${inDev ? 'dev' : 'min'}/vs`,
        to: 'vs',
      },
    ])
  );

  return config;
};
