import { remote } from 'electron';
import path from 'path';

const forkChild = remote.require('./fork-child');

let child = null;

export function request(channel, body) {
  const subChildPath = path.join(remote.app.getAppPath(), './electron-src/editor-extensions/lua/sub-child.js');
  console.log('subChildPath', subChildPath);
  if (!child) child = forkChild(subChildPath);
  return child.request(channel, body);
}
