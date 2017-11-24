const _ = require('lodash');
const luaparse = require('luaparse');
const Scope = require('./Scope');
const { getToLeftBoundaryCount, getToLeftSignatureBoundaryCount, getContainerNames } = require('./comm');
const getGlobalCompletionItems = require('./getGlobalCompletionItems');
const getTriggerCompletionItems = require('./getTriggerCompletionItems');
const getSignatureItems = require('./getSignatureItems');
const { parseAssign, parseFunc } = require('./tableItemHelper');

const triggerCharacters = ['.', ':'];

class Analyser {
  constructor(value, offset, isSignature) {
    this.globalScope = null;
    this.cursorScope = null;
    this.allIdentNodes = {};
    this.ast = null;
    this.offset = offset;
    this.isTriggerChar = false;
    this.isSignature = isSignature;

    if (offset) {
      const lastChar = value.charAt(offset - 1);
      this.isTriggerChar = triggerCharacters.includes(lastChar);
      if (lastChar === ')') this.isSignatureEnd = true;
    }

    this.docAnalyse(value, offset);
  }

  docAnalyse(value, offset) {
    this.globalScope = null;
    this.cursorScope = null;
    this.allIdentNodes = {};

    luaparse.parse({
      locations: true,
      scope: true,
      ranges: true,
      wait: true,
      onCreateNode: node => {
        if (node.type === 'Identifier') {
          if (_.has(this.cursorScope.identNodes, node.name)) {
            this.cursorScope.identNodes[node.name].nodes.push(node);
          } else {
            this.cursorScope.identNodes[node.name] = {
              nodes: [node],
              defIdx: -1,
            };
          }

          node.currScope = this.cursorScope;
          node.identIdx = this.cursorScope.identNodes[node.name].nodes.length - 1;

          if (_.has(this.allIdentNodes, node.name)) this.allIdentNodes[node.name].push(node);
          else this.allIdentNodes[node.name] = [node];
        } else if (node.type === 'LocalStatement') {
          parseAssign(this.cursorScope.tableCompItems, node);
          node.variables.forEach((oneVar, idx) => {
            const identNode = this.cursorScope.identNodes[oneVar.name];
            identNode.defIdx = identNode.nodes.indexOf(oneVar);
          });
          this.cursorScope.completionNodes.push(node);
        } else if (node.type === 'FunctionDeclaration') {
          const lastChildScope = this.cursorScope.childScopes[this.cursorScope.childScopes.length - 1];
          // 处理参数
          node.parameters.forEach(param => {
            const identNode = lastChildScope.identNodes[param.name];
            identNode.defIdx = identNode.nodes.indexOf(param);
            lastChildScope.completionNodes.push(param);
          });
          lastChildScope.range = node.range;
          lastChildScope.loc = node.loc;

          if (node.identifier) {
            if (node.identifier.type === 'Identifier') {
              const funcName = node.identifier.name;
              const identNode = this.cursorScope.identNodes[funcName];
              identNode.defIdx = identNode.nodes.indexOf(node.identifier);
              this.cursorScope.completionNodes.push(node);
            }
          }
          parseFunc(this.cursorScope.tableCompItems, node);
        } else if (node.type === 'CallExpression') {
          if (this.isTriggerChar && node.base.type === 'MemberExpression') {
            const name = node.base.identifier.name;
            if (name === '__completion_helper__') {
              this.containerNames = getContainerNames(node.base.base);
            }
          } else {
            this.cursorScope.callNodes.push(node);
          }
        } else if (node.type === 'AssignmentStatement') {
          parseAssign(this.cursorScope.tableCompItems, node);
        }
      },
      onCreateScope: () => {
        const newScope = new Scope();
        if (!this.globalScope) {
          this.globalScope = newScope;
        } else {
          this.cursorScope.childScopes.push(newScope);
          newScope.parentScope = this.cursorScope;
          newScope.childIdx = this.cursorScope.childScopes.length - 1;
        }
        this.cursorScope = newScope;
      },
      onDestroyScope: () => {
        // 退到上一级
        this.cursorScope = this.cursorScope.parentScope;
      },
    });

    if (offset) {
      if (this.isSignature) {
        const { offsetCount, isAfterComma } = getToLeftSignatureBoundaryCount(value, offset);

        const startOffset = offset - offsetCount;
        const endOffset = offset;
        this.offsetCount = offsetCount;
        this.isAfterComma = isAfterComma;

        luaparse.write(value.substring(0, startOffset));
        this.ast = luaparse.end(value.substring(endOffset));
      } else if (this.isTriggerChar) {
        this.isTriggerChar = true;
        luaparse.write(value.substring(0, offset));
        luaparse.write('__completion_helper__()');
        this.ast = luaparse.end(value.substring(offset));
      } else {
        const startOffset = offset - getToLeftBoundaryCount(value, offset);
        const endOffset = offset;

        luaparse.write(value.substring(0, startOffset));
        this.ast = luaparse.end(value.substring(endOffset));
      }
    } else {
      this.ast = luaparse.end(value);
    }
  }

  getCompletionItems() {
    if (this.isTriggerChar) {
      return getTriggerCompletionItems(this.globalScope, this.offset, this.containerNames);
    } else {
      return getGlobalCompletionItems(this.globalScope, this.offset);
    }
  }

  getSignature() {
    if (this.isSignatureEnd) return {};
    return getSignatureItems(this.globalScope, this.offset - this.offsetCount, this.allIdentNodes, this.isAfterComma);
  }
}

module.exports = Analyser;
