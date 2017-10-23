const { injectBabelPlugin } = require('react-app-rewired');
const webpack = require('webpack');

module.exports = function override(config, env) {
  config.target = 'electron-renderer';

  config = injectBabelPlugin('transform-decorators-legacy', config);

  const version = require('./package.json').version;
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': { VERSION: JSON.stringify(version) },
    })
  );

  return config;
};
