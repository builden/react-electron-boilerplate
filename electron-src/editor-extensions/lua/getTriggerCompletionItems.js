const _ = require('lodash');
const { findMatchedScope } = require('./helper');
const { CompletionItemKind } = require('./comm');
const { getXlua } = require('./xlua');

function getValueInitType(orignType) {
  switch (orignType) {
    case 'NumericLiteral':
      return {
        kind: CompletionItemKind.Property,
        name: 'number',
      };
    case 'StringLiteral':
      return {
        kind: CompletionItemKind.Property,
        name: 'string',
      };
    case 'TableConstructorExpression':
      return {
        kind: CompletionItemKind.Module,
        name: 'table',
      };
    case 'FunctionDeclaration':
      return {
        kind: CompletionItemKind.Function,
        name: 'function',
      };
    default:
      return {
        kind: CompletionItemKind.Property,
        name: 'any',
      };
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
          const { valueType } = prop.props[name];
          const typeInfo = getValueInitType(valueType);
          const isFunc = valueType === 'FunctionDeclaration';
          const item = {
            label: name,
            kind: typeInfo.kind,
            detail: `(property) ${name}: ${typeInfo.name}`,
          };
          if (isFunc) item.detail = `function ${name}(${prop.props[name].params.join(', ')})`;
          rst.push(item);
        });
      } else {
        curCursor = prop;
      }
    } else {
      break;
    }
  }
  return rst;
}

module.exports = function getTriggerCompletionItems(globalScope, offset, containerNames) {
  if (containerNames[containerNames.length - 1] === 'CS') {
    const xlua = getXlua();
    return getCompletionItemsAtScope(xlua.globalScope, containerNames);
  }
  const matchedScope = findMatchedScope(globalScope, offset);
  return getCompletionItemsAtScope(matchedScope, containerNames);
};
