const inElectron = window && window.process && window.process.type === 'renderer';

let innerRequest = () => {};
let child = null;

if (inElectron) {
  const { remote } = require('electron');
  const path = require('path');
  const forkChild = remote.require('./fork-child');
  innerRequest = (channel, body) => {
    const subChildPath = path.join(remote.app.getAppPath(), './electron-src/editor-extensions/lua/sub-child.js');
    if (!child) child = forkChild(subChildPath);
    return child.request(channel, body);
  };
}

export function request(channel, body) {
  return innerRequest(channel, body);
}
