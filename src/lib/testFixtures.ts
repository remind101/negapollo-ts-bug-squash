import fs from 'fs';
import path from 'path';

const baseDir = path.join(__dirname, '__fixtures__');
const cache = new Map();

function get(key: string): string {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const data = fs.readFileSync(path.join(baseDir, key), 'utf8');
  cache.set(key, data);
  return data;
}

function getJSON(key: string): Object {
  return JSON.parse(get(key));
}

export default {
  get,
  getJSON,
};
