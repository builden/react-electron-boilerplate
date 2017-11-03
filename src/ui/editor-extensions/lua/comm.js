/* global monaco */

export function locToRange(loc) {
  return {
    startLineNumber: loc.start.line,
    startColumn: loc.start.column + 1,
    endLineNumber: loc.end.line,
    endColumn: loc.end.column + 1,
  };
}

export function getOffsetAt(model, position) {
  return monaco.editor.getModel(model.uri).getOffsetAt(position);
}

export function getToLeftBoundaryCount(text, offset) {
  let i = offset - 1;
  const boundaryWords = ' \t\n\r\v":{[,]}()+-!';
  while (i >= 0 && boundaryWords.indexOf(text.charAt(i)) === -1) {
    i--;
  }
  return offset - i - 1;
}

export function getCurrentWord(model, offset) {
  const text = monaco.editor.getModel(model.uri).getValue();
  let i = offset - 1;
  const boundaryWords = ' \t\n\r\v":{[,]}()+-!';
  while (i >= 0 && boundaryWords.indexOf(text.charAt(i)) === -1) {
    i--;
  }
  let j = offset;
  while (j < text.length && boundaryWords.indexOf(text.charAt(j)) === -1) {
    j++;
  }
  return text.substring(i + 1, j);
}

export function isOffsetInRange(offset, range) {
  if (!range) return false;
  const [start, end] = range;
  return offset >= start && offset <= end;
}
