/* global monaco */
// 函数提示
import { getOffsetAt } from './comm';
import { getCompletionItems, docAnalyse } from './analyser';

const triggerCharacters = ['.', ':'];

export default function completionItemProvider() {
  monaco.languages.registerCompletionItemProvider('lua', {
    provideCompletionItems: (model, position) => {
      const value = model.getValue();
      const lastChar = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: position.column - 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      return new Promise((resolve, reject) => {
        const offset = getOffsetAt(model, position);
        try {
          docAnalyse(value, offset);
        } catch (e) {}

        if (triggerCharacters.includes(lastChar)) {
          resolve();
        } else {
          const completionItems = getCompletionItems(offset);
          resolve(completionItems);
        }
      });
    },
    triggerCharacters,
  });
}
