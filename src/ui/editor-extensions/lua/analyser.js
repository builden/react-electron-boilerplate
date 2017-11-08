const _ = require('lodash');
const luaparse = require('luaparse');
const Scope = require('./Scope');
const { getToLeftBoundaryCount } = require('./comm');

class Analyser {
  constructor(value, offset) {
    this.globalScope = null;
    this.cursorScope = null;
    this.allIdentNodes = {};
    this.ast = null;

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
        // console.log('onCreateNode', node);
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
          node.variables.forEach(oneVar => {
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
            const funcName = node.identifier.name;
            const identNode = this.cursorScope.identNodes[funcName];
            identNode.defIdx = identNode.nodes.indexOf(node.identifier);
            this.cursorScope.completionNodes.push(node);
          }
        }
      },
      onCreateScope: () => {
        // console.log('onCreateScope');
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
        // console.log('onDestroyScope');
        // 退到上一级
        this.cursorScope = this.cursorScope.parentScope;
      },
    });

    if (offset) {
      const startOffset = offset - getToLeftBoundaryCount(value, offset);
      const endOffset = offset;

      luaparse.write(value.substring(0, startOffset));
      this.ast = luaparse.end(value.substring(endOffset));
    } else {
      this.ast = luaparse.end(value);
    }
  }
}

module.exports = Analyser;
