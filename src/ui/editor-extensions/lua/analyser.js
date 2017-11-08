const _ = require('lodash');
const luaparse = require('luaparse');
const Scope = require('./Scope');
const { getToLeftBoundaryCount } = require('./comm');
const getGlobalCompletionItems = require('./getGlobalCompletionItems');
const { CompletionItemKind } = require('./comm');

const triggerCharacters = ['.', ':'];

class Analyser {
  constructor(value, offset) {
    this.globalScope = null;
    this.cursorScope = null;
    this.allIdentNodes = {};
    this.ast = null;
    this.offset = offset;
    this.isTriggerChar = false;
    this.tableNodes = {};
    this.tableComp = {};

    if (offset) {
      const lastChar = value.charAt(offset - 1);
      this.isTriggerChar = triggerCharacters.includes(lastChar);
    }

    this.docAnalyse(value, offset);
  }

  getContainerNames(node) {
    const rst = [];
    if (node) {
      if (node.type === 'Identifier') {
        rst.push(node.name);
      } else if (node.type === 'MemberExpression' && node.identifier) {
        rst.push(node.identifier.name);
        rst.push(...this.getContainerNames(node.base));
      }
    }
    return rst;
  }

  parseTableCtor(target, table) {
    table.fields.forEach(field => {
      if (field.type === 'TableKeyString') {
        target.props.push({ valueType: field.value.type, name: field.key.name });
      }
    });
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
          node.variables.forEach((oneVar, idx) => {
            const identNode = this.cursorScope.identNodes[oneVar.name];
            identNode.defIdx = identNode.nodes.indexOf(oneVar);

            if (node.init[idx].type === 'TableConstructorExpression') {
              this.tableNodes[oneVar.name] = node.init[idx];
              this.parseTableCtor(node.init[idx]);
            }
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
        } else if (this.isTriggerChar && node.type === 'CallExpression' && node.base.type === 'MemberExpression') {
          const name = node.base.identifier.name;
          if (name === '__completion_helper__') {
            this.containerNames = this.getContainerNames(node.base.base);
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
      if (this.isTriggerChar) {
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
      const rst = [];
      for (let i = this.containerNames.length - 1; i >= 0; i--) {
        const name = this.containerNames[i];
        if (_.has(this.tableNodes, this.containerNames[i])) {
          this.tableNodes[name].fields.forEach(field => {
            if (field.type === 'TableKeyString') {
              rst.push({
                label: field.key.name,
                kind: CompletionItemKind.Property,
                detail: `(property) ${field.key.name}: any`,
              });
            }
          });
        }
      }
      return rst;
    } else {
      return getGlobalCompletionItems(this.globalScope, this.offset);
    }
  }
}

module.exports = Analyser;
