/* global monaco */
import { getOffsetAt, locToRange, getCurrentWord } from './comm';
import { findReferenceNodes } from './analyser';

export default function referenceProvider() {
  monaco.languages.registerReferenceProvider('lua', {
    provideReferences(model, position, context, token) {
      return new Promise((resolve, reject) => {
        const offset = getOffsetAt(model, position);
        const word = getCurrentWord(model, offset);
        const nodes = findReferenceNodes(word, offset);
        if (nodes) {
          resolve(
            nodes.map(node => ({
              uri: model.uri,
              range: locToRange(node.loc),
            }))
          );
        }
        resolve();
      });
    },
  });
}
