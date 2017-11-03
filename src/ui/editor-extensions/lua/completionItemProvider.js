/* global monaco */
// 函数提示
import { getOffsetAt } from './comm';
import { getCompletionItems, docAnalyse } from './analyser';

export default function completionItemProvider() {
  monaco.languages.registerCompletionItemProvider('lua', {
    provideCompletionItems: (model, position) => {
      const value = model.getValue();
      return new Promise((resolve, reject) => {
        const offset = getOffsetAt(model, position);
        try {
          docAnalyse(value, offset);
        } catch (e) {}

        const completionItems = getCompletionItems(offset);
        resolve(completionItems);
      });
    },
    triggerCharacters: ['.', ':'],
  });
}
