const { isOffsetInRange, getContainerNames } = require('./comm');
const { findMatchedScope } = require('./helper');
const { getXlua } = require('./xlua');
const { getSignatureItemsAtScope } = require('./tableItemHelper');

function findMatchedNode(scope, offset) {
  for (const node of scope.callNodes) {
    if (isOffsetInRange(offset, node.range)) return node;
  }
  return null;
}

function getActiveSignture(activeParameter, signatures) {
  let i = 0;
  for (; i < signatures.length; ++i) {
    if (activeParameter < signatures[i].parameters.length) break;
  }
  return i;
}

module.exports = function getSignatureItems(globalScope, offset, allIdentNodes, isAfterComma) {
  const matchedScope = findMatchedScope(globalScope, offset);

  const matchedNode = findMatchedNode(matchedScope, offset);
  const containerNames = getContainerNames(matchedNode.base);

  let signatures = null;
  if (containerNames[containerNames.length - 1] === 'CS') {
    const xlua = getXlua();
    signatures = getSignatureItemsAtScope(xlua.globalScope, containerNames);
  } else {
    signatures = getSignatureItemsAtScope(matchedScope, containerNames);
  }

  let activeParameter = 0;
  let activeSignature = 0;
  const argLen = matchedNode.arguments.length;
  if (argLen > 0) {
    activeParameter = argLen - 1;
    if (isAfterComma) activeParameter++;
    activeSignature = getActiveSignture(activeParameter, signatures);
  }
  return {
    signatures: signatures,
    activeSignature,
    activeParameter,
  };
};
