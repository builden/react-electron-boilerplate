const { injectBabelPlugin, getBabelLoader } = require('react-app-rewired');
const webpack = require('webpack');
const program = require('commander');
const version = require('./package.json').version;

program
  .version(version)
  .option('-s, --start <name>', 'start page')
  .option('-w, --web', 'show at web')
  .parse(process.argv);

module.exports = function override(config, env) {
  if (!program.web) config.target = 'electron-renderer';

  if (process.env.NODE_ENV === 'development') {
    const loader = getBabelLoader(config.module.rules);
    if (loader.options.presets) loader.options.presets[0] = 'babel-preset-react';
    config = injectBabelPlugin('syntax-dynamic-import', config);
    config = injectBabelPlugin('transform-object-rest-spread', config);
    config = injectBabelPlugin('transform-class-properties', config);
    config = injectBabelPlugin('transform-decorators-legacy', config);
  } else {
    config = injectBabelPlugin('transform-decorators-legacy', config);
  }

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        VERSION: JSON.stringify(version),
        START_PAGE: JSON.stringify(program.start),
      },
    })
  );

  return config;
};
