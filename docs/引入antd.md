# 引入antd

## 安装
```bash
$ yarn add antd -D
$ yarn add antd-iconfont -D
$ yarn add react-app-rewire-less -D
```

## 配置config-overrides.js
```js
const rewireLess = require('react-app-rewire-less');

config = injectBabelPlugin(['import', { libraryName: 'antd', style: true }], config);
config = rewireLess.withLoaderOptions({
  modifyVars: {
    '@primary-color': 'red',
    '@font-size-base': '14px',
    '@icon-url': '"~antd-iconfont/iconfont"',
  },
})(config, env);
```

## 参考
* [在 create-react-app 中使用antd](https://ant.design/docs/react/use-with-create-react-app-cn)
* [antd默认样式变量](https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less)