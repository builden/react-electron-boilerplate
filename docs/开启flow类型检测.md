# 开启 flow 类型检测

## 在 create-react-app 中开启 flow

```bash
$ yarn add flow-bin -D
$ yarn flow init
```

## 安装 vscode 插件

* Flow Language Support

## 使用

在要检测的文件首行加上`// @flow`

## 常用 flow 属性

```ini
[options]
# 支持 ES7 的 Decorator 语法
esproposal.decorators=ignore

# 支持getter, setter函数
unsafe.enable_getters_and_setters=true
```

## 参考

* [flow](https://flow.org/)
