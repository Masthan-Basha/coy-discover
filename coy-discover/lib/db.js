import fs from 'fs';
import path from 'path';
import { buildProfiles } from './seed.js';

const FILE = process.env.COY_DB_FILE || path.join(process.cwd(), 'data', 'db.json');

export function resetDb() {
  const db = { profiles: buildProfiles(), swipes: {}, matches: [] };
  writeDb(db);
  return db;
}

export function readDb() {
  if (!fs.existsSync(FILE)) return resetDb();
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

export function writeDb(db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, FILE); // atomic replace, so a crash never leaves half a file
}

// The ONLY shape of a profile that may leave the server. `likesMe` is stripped.
export function publicProfile({ likesMe, ...rest }) {
  return rest;
}
