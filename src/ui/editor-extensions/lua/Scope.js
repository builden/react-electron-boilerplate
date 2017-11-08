class Scope {
  constructor() {
    this.identNodes = {}; // { nodes: [node], defIdx: -1 }; node: { ...Node, currScope, identIdx: 0 }
    this.childScopes = [];
    this.completionNodes = []; // LocalStatement, FunctionDeclaration
    this.childIdx = -1; // 在父scope中的索引顺序
    this.range = null;
    this.parentScope = null;
  }
}

module.exports = Scope;
