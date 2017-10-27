/* global monaco */
// 函数提示

function convertKind(kind) {
  const { CompletionItemKind } = monaco.languages;
  switch (kind) {
    case 'namespace':
      return CompletionItemKind.Module;
    case 'class':
      return CompletionItemKind.Class;
    case 'constructor':
      return CompletionItemKind.Constructor;
    case 'memberVariable':
      return CompletionItemKind.Field;
    case 'memberFunction': // 成员函数
      return CompletionItemKind.Method;
    case 'function': // 静态函数
      return CompletionItemKind.Function;
    case 'enum':
      return CompletionItemKind.Enum;
    case 'enumMember':
      return CompletionItemKind.EnumMember;
    default:
      return CompletionItemKind.Property;
  }
}

function completionItem(name, kind) {
  return {
    label: name,
    kind: convertKind(kind),
  };
}

export default function completionItemProvider() {
  monaco.languages.registerCompletionItemProvider('lua', {
    provideCompletionItems: (model, position) => {
       return new Promise((resolve, reject) => {
         resolve([completionItem('abc', 'function')]);
       });
    },
    triggerCharacters: ['.', ':'],
  });
}
