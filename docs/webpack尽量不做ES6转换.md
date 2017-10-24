# webpack尽量不做ES6转换
* 最新版本的chrome已经完全支持ES6的语法
* 最新版本的Electron除了不支持import，其它ES6的语法都支持

## 调试过程中不要对ES6代码做转换
* 转化后的代码虽然依然能通过map对应，但因为新增了一些代码，会在单步调试的时候产生困扰，特别是async await语法
* 正式环境不要做这个处理，因为`UglifyJS`插件暂时不支持ES6语法


## 设置方法，只用修改`config-overrides.js`
* 需要注意`transform-class-properties`, `transform-decorators-legacy`的顺序
```js
const { injectBabelPlugin, getBabelLoader } = require('react-app-rewired');
const webpack = require('webpack');

module.exports = function override(config, env) {
  // ...

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

  // ...

  return config;
};
```