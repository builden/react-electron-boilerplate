const _ = require('lodash');
const { findMatchedScope } = require('./helper');
const { CompletionItemKind } = require('./comm');

function getValueInitType(orignType) {
  switch (orignType) {
    case 'NumericLiteral':
      return 'number';
    case 'StringLiteral':
      return 'string';
    case 'TableConstructorExpression':
      return 'table';
    default:
      return 'any';
  }
}

function getCompletionItemsAtScope(scope, containerNames) {
  if (!containerNames.length) return [];
  if (!_.has(scope.tableCompItems, containerNames[containerNames.length - 1]) && scope.parentScope) {
    return getCompletionItemsAtScope(scope.parentScope, containerNames);
  }
  const rst = [];
  let curCursor = { props: scope.tableCompItems };
  for (let i = containerNames.length - 1; i >= 0; i--) {
    const name = containerNames[i];
    if (_.has(curCursor.props, name)) {
      const prop = curCursor.props[name];
      if (i === 0) {
        Object.keys(prop.props).forEach(name => {
          rst.push({
            label: name,
            kind: CompletionItemKind.Property,
            detail: `(property) ${name}: ${getValueInitType(prop.props[name].valueType)}`,
          });
        });
      } else {
        curCursor = curCursor.props[name];
      }
    } else {
      break;
    }
  }
  return rst;
}

module.exports = function getTriggerCompletionItems(globalScope, offset, containerNames) {
  const matchedScope = findMatchedScope(globalScope, offset);
  return getCompletionItemsAtScope(matchedScope, containerNames);
};
