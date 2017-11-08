const _ = require('lodash');
const { isOffsetInRange, CompletionItemKind } = require('./comm');

function getDefNodeFromParent(parentScope, nodeName) {
  if (!parentScope) return null;
  if (_.has(parentScope.identNodes, nodeName) && parentScope.identNodes[nodeName].defIdx >= 0) {
    const currIdentNode = parentScope.identNodes[nodeName];
    return currIdentNode.nodes[currIdentNode.defIdx];
  }
  return getDefNodeFromParent(parentScope.parentScope, nodeName);
}

function getDefNode(node) {
  const currScoreNodes = node.currScope.identNodes[node.name];
  if (currScoreNodes.defIdx >= 0 && node.identIdx >= currScoreNodes.defIdx) {
    return currScoreNodes.nodes[currScoreNodes.defIdx];
  }
  return getDefNodeFromParent(node.currScope.parentScope, node.name);
}

function getChildRefNodes(currScope, name) {
  const rst = [];
  const identNode = currScope.identNodes[name];
  if (identNode) {
    if (identNode.defIdx === -1) {
      rst.push(...identNode.nodes);
      currScope.childScopes.forEach(childScope => rst.push(...getChildRefNodes(childScope, name)));
    } else {
      rst.push(...identNode.nodes.slice(0, identNode.defIdx));
    }
  }
  return rst;
}

function getRefNodesByDefNode(defNode) {
  const currScope = defNode ? defNode.currScope : this.globalScope;
  const identNode = currScope.identNodes[defNode.name];
  const rst = identNode.nodes.slice(identNode.defIdx);
  currScope.childScopes.forEach(childScope => rst.push(...getChildRefNodes(childScope, defNode.name)));
  return rst;
}

/**
 * 查找定义标识符节点
 * @param {string} name node名称
 * @param {number} offset 鼠标所在文件的偏移位置
 */
exports.findDefNode = function findDefNode(allIdentNodes, name, offset) {
  if (_.has(allIdentNodes, name)) {
    for (const identNode of allIdentNodes[name]) {
      if (isOffsetInRange(offset, identNode.range)) return getDefNode(identNode);
    }
  }
  return null;
};

/**
 * 查找所有引用的标识符节点
 * @param {string} name 
 * @param {number} offset 
 */
exports.findReferenceNodes = function findReferenceNodes(allIdentNodes, name, offset) {
  if (_.has(allIdentNodes, name)) {
    for (const identNode of allIdentNodes[name]) {
      if (isOffsetInRange(offset, identNode.range)) return getRefNodesByDefNode(getDefNode(identNode));
    }
  }
  return null;
};

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

exports.getCompletionItems = function getCompletionItems(globalScope, offset) {
  const matchedScope = findMatchedScope(globalScope, offset);
  return getCompletionItemsAtScope(matchedScope);
};
