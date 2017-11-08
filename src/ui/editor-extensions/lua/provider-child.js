import { remote } from 'electron';

const forkChild = remote.require('./fork-child');

let child = null;

export function request(channel, body) {
  if (!child) child = forkChild('./src/ui/editor-extensions/lua/sub-child.js');
  return child.request(channel, body);
}
