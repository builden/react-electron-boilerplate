/* global monaco */
// 函数提示
import { getOffsetAt } from '../comm';
import { request } from '../provider-child';

const triggerCharacters = ['.', ':'];

export default function completionItemProvider() {
  monaco.languages.registerCompletionItemProvider('lua', {
    provideCompletionItems: (model, position) => {
      const value = model.getValue();
      return new Promise((resolve, reject) => {
        const offset = getOffsetAt(model, position);
        request('completionItem', { value, offset })
          .then(completionItems => resolve(completionItems))
          .catch(() => resolve());
      });
    },
    triggerCharacters,
  });
}
