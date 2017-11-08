import { request } from './provider-child';

export async function updateRealAnalyse(value) {
  try {
    await request('onDidChangeModelContent', value);
  } catch (e) {}
}
