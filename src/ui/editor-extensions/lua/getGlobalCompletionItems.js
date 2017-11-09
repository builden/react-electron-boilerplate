const _ = require('lodash');
const { isOffsetInRange, CompletionItemKind } = require('./comm');

function getMatchedScope(currScope, offset) {
  let rst = currScope;
  for (const childScope of currScope.childScopes) {
    if (isOffsetInRange(offset, childScope.range)) {
      rst = getMatchedScope(childScope, offset);
      break;
    }
  }
  return rst;
}

function findMatchedScope(globalScope, offset) {
  return getMatchedScope(globalScope, offset);
}

function getCompletionItemsAtScope(scope) {
  const rst = [];
  for (const node of scope.completionNodes) {
    if (node.type === 'FunctionDeclaration') {
      const params = node.parameters.map(param => `${param.name}: any`);
      rst.push({
        label: node.identifier.name,
        kind: CompletionItemKind.Function,
        detail: `function ${node.identifier.name}(${params.join(', ')}): any`,
        // documentation: `above at detail info`,
      });
    } else if (node.type === 'LocalStatement') {
      for (let i = 0; i < node.variables.length; ++i) {
        const { type } = node.init[i];
        const { name } = node.variables[i];
        const [isFunc, isTable] = [type === 'FunctionDeclaration', type === 'TableConstructorExpression'];
        const item = { label: name };

        if (isFunc) {
          item.kind = CompletionItemKind.Function;
          const params = node.init[i].parameters.map(param => `${param.name}: any`);
          item.detail = `function ${name}(${params.join(', ')}): any`;
        } else if (isTable) {
          item.kind = CompletionItemKind.Module;
          item.detail = `local ${name}: table`;
        } else {
          item.detail = `local ${name}`;
        }

        rst.push(item);
      }
    } else if (node.type === 'Identifier') {
      rst.push({
        label: node.name,
        kind: CompletionItemKind.Property,
        detail: `(parameter) ${node.name}: any`,
      });
    }
  }

  if (scope.parentScope) {
    let parentCompletionItems = getCompletionItemsAtScope(scope.parentScope);
    parentCompletionItems = parentCompletionItems.filter(
      parentItem => !_.find(rst, existItem => existItem.label === parentItem.label)
    );
    rst.push(...parentCompletionItems);
  }
  return rst;
}

module.exports = function getGlobalCompletionItems(globalScope, offset) {
  const matchedScope = findMatchedScope(globalScope, offset);
  return getCompletionItemsAtScope(matchedScope);
};