const fs = require('fs');
const path = require('path');

let xlua = null;
exports.getXlua = function getXlua() {
  return xlua;
};

exports.initXlua = function initXlua(xlua_) {
  const Analyser = require('./analyser');
  const ctx = fs.readFileSync(path.join(__dirname, 'apis/xluaApi.lua'), 'utf8');
  xlua = new Analyser(ctx);
};
