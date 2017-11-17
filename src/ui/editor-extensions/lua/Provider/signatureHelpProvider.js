/* global monaco */
import { getOffsetAt } from '../comm';
import { request } from '../provider-child';

export default function signatureHelpProvider() {
  monaco.languages.registerSignatureHelpProvider('lua', {
    signatureHelpTriggerCharacters: ['(', ','],
    provideSignatureHelp(model, position, token) {
      return new Promise((resolve, reject) => {
        const value = model.getValue();
        const offset = getOffsetAt(model, position);
        request('signature', { value, offset })
          .then(res => resolve(res))
          .catch(e => resolve());
      });
    },
  });
}
