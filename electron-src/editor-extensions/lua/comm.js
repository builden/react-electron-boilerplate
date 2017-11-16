/* global monaco */

exports.locToRange = function locToRange(loc) {
  return {
    startLineNumber: loc.start.line,
    startColumn: loc.start.column + 1,
    endLineNumber: loc.end.line,
    endColumn: loc.end.column + 1,
  };
};

exports.getOffsetAt = function getOffsetAt(model, position) {
  return monaco.editor.getModel(model.uri).getOffsetAt(position);
};

exports.getToLeftBoundaryCount = function getToLeftBoundaryCount(text, offset) {
  let i = offset - 1;
  const boundaryWords = ' \t\n\r\v":{[,]}()+-!';
  while (i >= 0 && boundaryWords.indexOf(text.charAt(i)) === -1) {
    i--;
  }
  return offset - i - 1;
};

exports.getToLeftSignatureBoundaryCount = function getToLeftSignatureBoundaryCount(text, offset) {
  let i = offset - 1;
  const boundaryWords = ' \t\n\r\v,';
  let isAfterComma = false;
  while (i >= 0 && !(boundaryWords.indexOf(text.charAt(i)) === -1)) {
    if (text.charAt(i) === ',') isAfterComma = true;
    i--;
  }
  return {
    offsetCount: offset - i - 1,
    isAfterComma,
  };
};

exports.getCurrentWord = function getCurrentWord(model, offset) {
  const text = monaco.editor.getModel(model.uri).getValue();
  let i = offset - 1;
  const boundaryWords = ' \t\n\r\v":{[,]}()+-!.';
  while (i >= 0 && boundaryWords.indexOf(text.charAt(i)) === -1) {
    i--;
  }
  let j = offset;
  while (j < text.length && boundaryWords.indexOf(text.charAt(j)) === -1) {
    j++;
  }
  return text.substring(i + 1, j);
};

exports.isOffsetInRange = function isOffsetInRange(offset, range) {
  if (!range) return false;
  const [start, end] = range;
  return offset >= start && offset <= end;
};

exports.getContainerNames = function getContainerNames(node) {
  const rst = [];
  if (node) {
    if (node.type === 'Identifier') {
      rst.push(node.name);
    } else if (node.type === 'MemberExpression' && node.identifier) {
      rst.push(node.identifier.name);
      rst.push(...getContainerNames(node.base));
    }
  }
  return rst;
};

exports.SymbolKind = {
  File: 0,
  Module: 1,
  Namespace: 2,
  Package: 3,
  Class: 4,
  Method: 5,
  Property: 6,
  Field: 7,
  Constructor: 8,
  Enum: 9,
  Interface: 10,
  Function: 11,
  Variable: 12,
  Constant: 13,
  String: 14,
  Number: 15,
  Boolean: 16,
  Array: 17,
  Object: 18,
  Key: 19,
  Null: 20,
  EnumMember: 21,
  Struct: 22,
  Event: 23,
  Operator: 24,
  TypeParameter: 25,
};

exports.CompletionItemKind = {
  Text: 0,
  Method: 1,
  Function: 2,
  Constructor: 3,
  Field: 4,
  Variable: 5,
  Class: 6,
  Interface: 7,
  Module: 8,
  Property: 9,
  Unit: 10,
  Value: 11,
  Enum: 12,
  Keyword: 13,
  Snippet: 14,
  Color: 15,
  File: 16,
  Reference: 17,
  Folder: 18,
};
