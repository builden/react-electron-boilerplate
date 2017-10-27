/* global monaco */
// 格式化代码
import {formatText} from 'lua-fmt';

export default function documentFormattingEditProvider() {
  monaco.languages.registerDocumentFormattingEditProvider('lua', {
    provideDocumentFormattingEdits: (model, options, token) => {
      return new Promise((resolve, reject) => {
        const formatOptions = {
          indentCount: options.tabSize,
          lineWidth: 80,
          // quotemark: 'single'
        };
        const text = formatText(model.getValue(), formatOptions);
        resolve([{ range: model.getFullModelRange(), text }]);
      });
    },
  });

/*   monaco.languages.registerDocumentRangeFormattingEditProvider('lua', {
    provideDocumentRangeFormattingEdits(model, range, options, token) {
      console.log('range format, select text:', model.getValueInRange(range))
      return new Promise((resolve, reject) => {
        resolve([{ range: range, text: 'range replace' }]);
      });
    }
  }) */
}
