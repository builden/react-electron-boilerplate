/* global monaco */
import { getOffsetAt, locToRange, getCurrentWord } from './comm';
import { findReferenceNodes } from './analyser';

export default function renameProvider() {
  monaco.languages.registerRenameProvider('lua', {
    provideRenameEdits(model, position, newName, token) {
      return new Promise((resolve, reject) => {
        const offset = getOffsetAt(model, position);
        const word = getCurrentWord(model, offset);
        const nodes = findReferenceNodes(word, offset);

        if (nodes) {
          resolve({
            edits: nodes.map(node => ({
              resource: model.uri,
              range: locToRange(node.loc),
              newText: newName,
            })),
          });
        } else {
          reject('You cannot rename this element.');
        }
      });
    },
  });
}
