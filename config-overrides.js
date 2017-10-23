const { injectBabelPlugin } = require('react-app-rewired');

module.exports = function override(config, env) {
  config.target = 'electron-renderer';

  config = injectBabelPlugin('transform-decorators-legacy', config);

  return config;
};
