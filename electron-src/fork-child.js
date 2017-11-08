const { fork } = require('child_process');

const childMap = {};

class ForkChild {
  constructor(modulePath, args, options) {
    this.child = fork(modulePath);
    this.seqId = 0;
    this.requests = {};

    this.child.on('message', m => {
      if (m && m.id) {
        if (m.code === 0) {
          this.requests[m.id].resolve(m.body);
        } else {
          this.requests[m.id].reject(m.code, m.msg);
        }
      }
    });
  }

  request(channel, body) {
    return new Promise((resolve, reject) => {
      const reqBody = {
        id: ++this.seqId,
        channel,
        body,
      };
      this.requests[reqBody.id] = { resolve, reject };
      this.child.send(reqBody);
    });
  }
}

function forkChild(modulePath, args, options) {
  if (childMap[modulePath]) return childMap[modulePath];

  const child = new ForkChild(modulePath, args, options);
  childMap[modulePath] = child;
  return child;
}

module.exports = forkChild;
