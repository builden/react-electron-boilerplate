/*
// old
interface ParamItem {
  name: string;
  paramType: string;
}

interface PropItem {
  propName: 'string';
  propType: 'number' | 'boolean' | 'string' | 'Array' | 'Object' | 'Function' | 'any'
  children?: PropItem[]; // when valueType is 'Object'
  params?: ParamItem[]; // when valueType is 'Function'
}
*/

class Scope {
  constructor() {
    this.identNodes = {}; // { nodes: [node], defIdx: -1 }; node: { ...Node, currScope, identIdx: 0 }
    this.childScopes = [];
    this.completionNodes = []; // LocalStatement, FunctionDeclaration
    this.childIdx = -1; // 在父scope中的索引顺序
    this.range = null;
    this.parentScope = null;
    this.tableCompItems = []; // PropItem[]
    this.callNodes = []; // CallExpression
  }
}

module.exports = Scope;
