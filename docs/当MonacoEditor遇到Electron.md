# 当MonacoEditor遇到Electron

## 配置方法
* 由于`react-monaco-editor`目前还不支持在Electron中运行，因此在它的基础上封装了`ui\MonacoEditor`
* 在`config-overrides.js`中配置
```js
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function override(config, env) {
  config.target = 'electron-renderer';

  config.plugins.push(
    new CopyWebpackPlugin([
      {
        from: 'node_modules/monaco-editor/min/vs',  // 如果想调试monaco-editor，可把min改成dev
        to: 'vs',
      },
    ])
  );

  return config;
};
```

## 测试方法
```bash
# 在chome中测试
yarn start:web

# 在Eletron中测试
yarn start -s EditorTest
yarn electron:dev

# 打包测试
yarn build -s EditorTest
yarn dist:win64
```

## 参考
* [monaco-editor](https://github.com/Microsoft/monaco-editor)
* [react-monaco-editor](https://github.com/superRaytin/react-monaco-editor)