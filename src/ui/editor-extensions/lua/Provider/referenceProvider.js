/* global monaco */
import { getOffsetAt, locToRange, getCurrentWord } from '../comm';
import { request } from '../provider-child';

export default function referenceProvider() {
  monaco.languages.registerReferenceProvider('lua', {
    provideReferences(model, position, context, token) {
      return new Promise((resolve, reject) => {
        const offset = getOffsetAt(model, position);
        const word = getCurrentWord(model, offset);
        request('reference', { word, offset, modelId: model.id })
          .then(locs =>
            resolve(
              locs.map(loc => ({
                uri: model.uri,
                range: locToRange(loc),
              }))
            )
          )
          .catch(() => resolve());
      });
    },
  });
}
