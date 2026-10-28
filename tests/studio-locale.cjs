/* Test helper: serves Studio locale files to a jsdom window without needing generated files.
   Reads locale/<code>.json plus locale/parts/*.<code>.json (the same sources tools/build_locales.py merges). */
const fs = require('node:fs'), path = require('node:path');
const locale = path.join(__dirname, '..', 'locale');
const prefixes = ['language.', 'common.', 'studio.', 'backend.'];
function table(code) {
  const file = path.join(locale, code + '.json');
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const parts = path.join(locale, 'parts');
  if (fs.existsSync(parts))
    for (const name of fs.readdirSync(parts).sort())
      if (name.endsWith('.' + code + '.json')) Object.assign(data, JSON.parse(fs.readFileSync(path.join(parts, name), 'utf8')));
  return Object.fromEntries(Object.entries(data).filter(([key]) => prefixes.some(prefix => key.startsWith(prefix))));
}
module.exports = function installLocale(w, requested) {
  w.fetch = async url => {
    const match = /\/([a-z]{2,3})\.json$/.exec(String(url));
    const data = match && table(match[1]);
    if (requested) requested.push(String(url));
    return data ? { ok: true, json: async () => data } : { ok: false, json: async () => ({}) };
  };
  return table;
};
module.exports.table = table;
