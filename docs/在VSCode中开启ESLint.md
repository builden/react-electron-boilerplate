# VSCode中开启ESLint

## 关闭VSCode本身的js检测
* 在工程设置`.vscode/settings.json`中设置
```json
{
  "javascript.validate.enable": false
}
```

## 增加eslint配置
1. 方法1: 在根目录下增加`.eslintrc`文件
2. 方法2：在`package.json` -> `eslintConfig` 字段中增加 (推荐，可以让根目录少个文件)
```json
{
  "extends": "react-app",
  "rules": {
    "prefer-const": "warn",
    "new-cap": "warn",
    "no-var": "warn",
    "camelcase": [
      "warn",
      {
        "properties": "never"
      }
    ]
  }
}
```