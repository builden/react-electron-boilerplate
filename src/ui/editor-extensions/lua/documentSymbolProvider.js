/* global monaco */
import { findSymbols } from './analyser';

export default function documentSymbolProvider(ast) {
  monaco.languages.registerDocumentSymbolProvider('lua', {
    provideDocumentSymbols: (model, token) => {
      console.log('provideDocumentSymbols', model, token);
      return new Promise((resolve, reject) => {
        resolve(findSymbols());
      });
    },
  });
}
