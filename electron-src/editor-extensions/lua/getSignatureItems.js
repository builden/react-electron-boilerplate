const _ = require('lodash');
const { isOffsetInRange, getContainerNames } = require('./comm');
const { findMatchedScope } = require('./helper');
const { getXlua } = require('./xlua');

function findMatchedNode(scope, offset) {
  for (const node of scope.callNodes) {
    if (isOffsetInRange(offset, node.range)) return node;
  }
  return null;
}

function getSignatureItemsAtScope(scope, containerNames) {
  if (!containerNames.length) return [];
  if (!_.has(scope.tableCompItems, containerNames[containerNames.length - 1]) && scope.parentScope) {
    return getSignatureItemsAtScope(scope.parentScope, containerNames);
  }
  const rst = [];
  let curCursor = { props: scope.tableCompItems };
  for (let i = containerNames.length - 1; i >= 0; i--) {
    const name = containerNames[i];
    if (_.has(curCursor.props, name)) {
      const prop = curCursor.props[name];
      if (i === 0) {
        const item = {
          label: `${name}(${prop.params.join(', ')})`,
          parameters: prop.params.map(param => ({ label: param })),
        };
        rst.push(item);
      } else {
        curCursor = prop;
      }
    } else {
      break;
    }
  }
  return rst;
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
  const argLen = matchedNode.arguments.length;
  if (argLen > 0) {
    activeParameter = argLen - 1;
    if (isAfterComma) activeParameter++;
  }
  return {
    signatures: signatures,
    activeSignature: 0,
    activeParameter,
  };
};
