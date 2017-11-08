const _ = require('lodash');
const { isOffsetInRange } = require('./comm');

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
