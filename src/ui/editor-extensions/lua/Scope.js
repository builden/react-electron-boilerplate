export default class Scope {
  identNodes = {}; // { nodes: [node], defIdx: -1 }; node: { ...Node, currScope, identIdx: 0 }
  childScopes = [];
  completionNodes = []; // LocalStatement, FunctionDeclaration
  childIdx = -1; // 在父scope中的索引顺序
  range = null;
  parentScope = null;
}
