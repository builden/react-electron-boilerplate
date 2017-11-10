const fs = require('fs');

let xlua = null;
exports.getXlua = function getXlua() {
  return xlua;
};

exports.initXlua = function initXlua(xlua_) {
  const Analyser = require('./analyser');
  const ctx = fs.readFileSync('./electron-src/editor-extensions/lua/apis/xluaApi.lua', 'utf8');
  xlua = new Analyser(ctx);
};
