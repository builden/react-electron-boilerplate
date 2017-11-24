const _ = require('lodash');
const { findMatchedScope } = require('./helper');
const { getXlua } = require('./xlua');
const { getCompletionItemsAtScope } = require('./tableItemHelper');

module.exports = function getTriggerCompletionItems(globalScope, offset, containerNames) {
  if (containerNames[containerNames.length - 1] === 'CS') {
    const xlua = getXlua();
    return getCompletionItemsAtScope(xlua.globalScope, containerNames);
  }
  const matchedScope = findMatchedScope(globalScope, offset);
  return getCompletionItemsAtScope(matchedScope, containerNames);
};
