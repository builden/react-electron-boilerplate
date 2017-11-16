/* global monaco */
import { request } from './provider-child';

export async function updateRealAnalyse(editor) {
  const value = editor.getValue();
  const diagnostics = [];
  try {
    const id = editor.model.id;
    await request('onDidChangeModelContent', { modelId: id, value });
  } catch (e) {
    try {
      const [, lineNumStr, columnNumStr, message] = e.msg.match(/\[(\d+):(\d+)\] (.*)/);
      const [line, column] = [Number(lineNumStr), Number(columnNumStr)];
      const lines = value.split(/\r?\n/g);
      const lineStr = lines[line - 1];
      diagnostics.push({
        severity: monaco.Severity.Error,
        message,
        startLineNumber: line,
        startColumn: column + 1,
        endLineNumber: line,
        endColumn: lineStr.length + 1,
      });
    } catch (err) {
      console.warn('updateRealAnalyse error', err);
    }
  }
  monaco.editor.setModelMarkers(monaco.editor.getModel(editor.model.uri), 'lua', diagnostics);
}
