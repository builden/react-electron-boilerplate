/* global monaco */
import { getOffsetAt, locToRange, getCurrentWord } from './comm';
import { findDefNode } from './analyser';

export default function definitionProvider() {
  monaco.languages.registerDefinitionProvider('lua', {
    provideDefinition(model, position, token) {
      return new Promise((resolve, reject) => {
        const offset = getOffsetAt(model, position);
        const word = getCurrentWord(model, offset);
        const myNode = findDefNode(word, offset);
        if (myNode) {
          return resolve({ uri: model.uri, range: locToRange(myNode.loc) });
        }

        return resolve();
      });
    },
  });
}
