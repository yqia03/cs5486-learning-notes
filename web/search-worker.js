import { prepareIndex, search } from './search-core.js';
let indexPromise;
self.onmessage = async ({ data }) => {
  try {
    indexPromise ||= fetch(new URL('../search-index.json', import.meta.url)).then(response => {
      if (!response.ok) throw new Error('Search index unavailable');
      return response.json();
    }).then(prepareIndex).catch(error => { indexPromise = undefined; throw error; });
    const index = await indexPromise;
    self.postMessage({ id: data.id, ...search(index, data.query) });
  } catch {
    self.postMessage({ id: data.id, error: '搜索索引暂时无法加载，请检查网络后重试。' });
  }
};
