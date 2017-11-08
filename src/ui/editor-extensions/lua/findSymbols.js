const { locToRange, SymbolKind } = require('./comm');

function genSymbols(symbols, ast, containerName) {
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

module.exports = function findSymbols(ast) {
  const symbols = [];
  genSymbols(symbols, ast);
  return symbols;
};
