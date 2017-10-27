/* global monaco */

export default function documentSymbolProvider() {
  monaco.languages.registerDocumentSymbolProvider('lua', {
    provideDocumentSymbols: (model, token) => {
      console.log('provideDocumentSymbols', model, token);
      const { SymbolKind } = monaco.languages;
      return new Promise((resolve, reject) => {
        const symbol1 = {
          name: 'func',
          kind: SymbolKind.Variable,
          location: {
            range: model.getFullModelRange(),
          },
        };

        const symbol2 = {
          name: 'add',
          kind: SymbolKind.Function,
          location: {
            range: model.getFullModelRange(),
          },
        };

        const symbol3 = {
          name: 'localvar',
          containerName: 'add',
          kind: SymbolKind.Function,
          location: {
            range: model.getFullModelRange(),
          },
        };

        resolve([symbol1, symbol2, symbol3]);
      });
    },
  });
}
