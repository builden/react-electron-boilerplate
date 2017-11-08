/* global monaco */
import { getOffsetAt, locToRange, getCurrentWord } from '../comm';
import { request } from '../provider-child';

export default function renameProvider() {
  monaco.languages.registerRenameProvider('lua', {
    provideRenameEdits(model, position, newName, token) {
      return new Promise((resolve, reject) => {
        const offset = getOffsetAt(model, position);
        const word = getCurrentWord(model, offset);
        request('reference', { word, offset })
          .then(locs =>
            resolve({
              edits: locs.map(loc => ({
                resource: model.uri,
                range: locToRange(loc),
                newText: newName,
              })),
            })
          )
          .catch(() => reject('You cannot rename this element.'));
      });
    },
  });
}
