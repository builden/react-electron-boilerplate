const _ = require('lodash');
const luaparse = require('luaparse');
const Scope = require('./Scope');
const { getToLeftBoundaryCount } = require('./comm');
const getGlobalCompletionItems = require('./getGlobalCompletionItems');
const getTriggerCompletionItems = require('./getTriggerCompletionItems');

const triggerCharacters = ['.', ':'];

class Analyser {
  constructor(value, offset) {
    this.globalScope = null;
    this.cursorScope = null;
    this.allIdentNodes = {};
    this.ast = null;
    this.offset = offset;
    this.isTriggerChar = false;
    this.tableCompItems = {}; // {name: { props: [{ valueType, name }] }}

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
        const name = field.key.name;
        target.props[name] = { valueType: field.value.type };
        if (field.value.type === 'TableConstructorExpression') {
          target.props[name].props = {};
          this.parseTableCtor(target.props[name], field.value);
        }
      }
    });
  }

  parseTableFunc(node) {
    const containerNames = this.getContainerNames(node.identifier);
    const params = node.parameters.map(param => param.name);
    let curCursor = this.cursorScope.tableCompItems;

    for (let i = containerNames.length - 1; i >= 0; i--) {
      const name = containerNames[i];
      if (i === 0) {
        if (!_.has(curCursor, name)) curCursor[name] = {};
        curCursor[name].valueType = 'FunctionDeclaration';
        curCursor[name].params = params;
      } else {
        if (!_.has(curCursor, name)) curCursor[name] = { props: {} };
        else if (!_.has(curCursor[name], 'props')) curCursor[name].props = {};
        curCursor = curCursor[name].props;
      }
    }
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
              this.cursorScope.tableCompItems[oneVar.name] = { props: {} };
              this.parseTableCtor(this.cursorScope.tableCompItems[oneVar.name], node.init[idx]);
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
            if (node.identifier.type === 'Identifier') {
              const funcName = node.identifier.name;
              const identNode = this.cursorScope.identNodes[funcName];
              identNode.defIdx = identNode.nodes.indexOf(node.identifier);
              this.cursorScope.completionNodes.push(node);
            } else if (node.identifier.type === 'MemberExpression') {
              this.parseTableFunc(node);
            }
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
      return getTriggerCompletionItems(this.globalScope, this.offset, this.containerNames);
    } else {
      return getGlobalCompletionItems(this.globalScope, this.offset);
    }
  }
}

module.exports = Analyser;
