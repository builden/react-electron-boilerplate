/* global monaco */
import { getOffsetAt, locToRange, getCurrentWord } from '../comm';
import { request } from '../provider-child';

export default function definitionProvider() {
  monaco.languages.registerDefinitionProvider('lua', {
    provideDefinition(model, position, token) {
      return new Promise((resolve, reject) => {
        const offset = getOffsetAt(model, position);
        const word = getCurrentWord(model, offset);
        request('definition', {
          modelId: model.id,
          word,
          offset,
        })
          .then(loc => resolve({ uri: model.uri, range: locToRange(loc) }))
          .catch(() => resolve());
      });
    },
  });
}
