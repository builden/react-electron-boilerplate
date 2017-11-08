/* global monaco */
import { request } from '../provider-child';

export default function documentSymbolProvider() {
  monaco.languages.registerDocumentSymbolProvider('lua', {
    provideDocumentSymbols: (model, token) => {
      return new Promise((resolve, reject) => {
        request('symbol')
          .then(res => {
            resolve(res);
          })
          .catch(e => resolve());
      });
    },
  });
}
