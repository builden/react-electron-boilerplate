import { request } from './provider-child';

export async function updateRealAnalyse(id, value) {
  try {
    await request('onDidChangeModelContent', { modelId: id, value });
  } catch (e) {}
}
