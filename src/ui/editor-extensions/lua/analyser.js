/* global monaco */
import _ from 'lodash';
import luaparse from 'luaparse';
import Scope from './Scope';
import { isOffsetInRange, getToLeftBoundaryCount, locToRange } from './comm';

let globalScope = null;
let cursorScope = null;
let allIdentNodes = {};
let ast = null;

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
  const currScope = defNode ? defNode.currScope : globalScope;
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
export function findDefNode(name, offset) {
  if (_.has(allIdentNodes, name)) {
    for (const identNode of allIdentNodes[name]) {
      if (isOffsetInRange(offset, identNode.range)) return getDefNode(identNode);
    }
  }
  return null;
}

/**
 * 查找所有引用的标识符节点
 * @param {string} name 
 * @param {number} offset 
 */
export function findReferenceNodes(name, offset) {
  if (_.has(allIdentNodes, name)) {
    for (const identNode of allIdentNodes[name]) {
      if (isOffsetInRange(offset, identNode.range)) return getRefNodesByDefNode(getDefNode(identNode));
    }
  }
  return null;
}

function genSymbols(symbols, ast, containerName) {
  const { SymbolKind } = monaco.languages;
  ast.body.forEach(node => {
    if (node.type === 'LocalStatement') {
      node.init.forEach((varValue, idx) => {
        if (varValue.type === 'FunctionDeclaration') {
          symbols.push({
            name: node.variables[idx].name,
            kind: SymbolKind.Variable,
            containerName: containerName,
            location: {
              range: locToRange(varValue.loc),
            },
          });
          genSymbols(symbols, node.init[idx], node.variables[idx].name);
        } else {
          symbols.push({
            name: node.variables[idx].name,
            kind: SymbolKind.Variable,
            containerName: containerName,
            location: {
              range: locToRange(node.variables[idx].loc),
            },
          });
        }
      });
    } else if (node.type === 'FunctionDeclaration') {
      const name = node.identifier.name;
      symbols.push({
        name,
        kind: SymbolKind.Function,
        containerName: containerName,
        location: {
          range: locToRange(node.loc),
        },
      });
      genSymbols(symbols, node, name);
    }
  });
  return symbols;
}

export function findSymbols() {
  const symbols = [];
  genSymbols(symbols, ast);
  return symbols;
}

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

function findMatchedScope(offset) {
  return getMatchedScope(globalScope, offset);
}

function getCompletionItemsAtScope(scope) {
  const { CompletionItemKind } = monaco.languages;
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

export function getCompletionItems(offset) {
  const matchedScope = findMatchedScope(offset);
  return getCompletionItemsAtScope(matchedScope);
}

export function docAnalyse(value, offset) {
  globalScope = null;
  cursorScope = null;
  allIdentNodes = {};

  luaparse.parse({
    locations: true,
    scope: true,
    ranges: true,
    wait: true,
    onCreateNode: node => {
      // console.log('onCreateNode', node);
      if (node.type === 'Identifier') {
        if (_.has(cursorScope.identNodes, node.name)) {
          cursorScope.identNodes[node.name].nodes.push(node);
        } else {
          cursorScope.identNodes[node.name] = {
            nodes: [node],
            defIdx: -1,
          };
        }

        node.currScope = cursorScope;
        node.identIdx = cursorScope.identNodes[node.name].nodes.length - 1;

        if (_.has(allIdentNodes, node.name)) allIdentNodes[node.name].push(node);
        else allIdentNodes[node.name] = [node];
      } else if (node.type === 'LocalStatement') {
        node.variables.forEach(oneVar => {
          const identNode = cursorScope.identNodes[oneVar.name];
          identNode.defIdx = identNode.nodes.indexOf(oneVar);
        });
        cursorScope.completionNodes.push(node);
      } else if (node.type === 'FunctionDeclaration') {
        const lastChildScope = cursorScope.childScopes[cursorScope.childScopes.length - 1];
        // 处理参数
        node.parameters.forEach(param => {
          const identNode = lastChildScope.identNodes[param.name];
          identNode.defIdx = identNode.nodes.indexOf(param);
          lastChildScope.completionNodes.push(param);
        });
        lastChildScope.range = node.range;
        lastChildScope.loc = node.loc;

        if (node.identifier) {
          const funcName = node.identifier.name;
          const identNode = cursorScope.identNodes[funcName];
          identNode.defIdx = identNode.nodes.indexOf(node.identifier);
          cursorScope.completionNodes.push(node);
        }
      }
    },
    onCreateScope: () => {
      // console.log('onCreateScope');
      const newScope = new Scope();
      if (!globalScope) {
        globalScope = newScope;
        window.globalScope = globalScope;
      } else {
        cursorScope.childScopes.push(newScope);
        newScope.parentScope = cursorScope;
        newScope.childIdx = cursorScope.childScopes.length - 1;
      }
      cursorScope = newScope;
    },
    onDestroyScope: () => {
      // console.log('onDestroyScope');
      // cursorScope = cursorScope.parentScope;
      // 退到上一级
      cursorScope = cursorScope.parentScope;
    },
  });

  const startOffset = offset - getToLeftBoundaryCount(value, offset);
  const endOffset = offset;

  luaparse.write(value.substring(0, startOffset));
  ast = luaparse.end(value.substring(endOffset));
}
