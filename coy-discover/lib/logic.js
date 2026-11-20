import { readDb, writeDb, publicProfile } from './db.js';

export function getFeed() {
  const db = readDb();
  return db.profiles.filter((p) => !(p.id in db.swipes)).map(publicProfile);
}

export function recordSwipe(profileId, action) {
  if (action !== 'like' && action !== 'pass') return { status: 400, error: 'action must be "like" or "pass"' };
  const db = readDb();
  const profile = db.profiles.find((p) => p.id === profileId);
  if (!profile) return { status: 404, error: 'Profile not found' };

  // A profile can only be swiped once. Repeats are no-ops that return the original outcome.
  if (profileId in db.swipes) {
    const existing = db.matches.find((m) => m.profileId === profileId);
    return { status: 200, body: { match: !!existing, alreadySwiped: true, matchedAt: existing?.matchedAt ?? null } };
  }

  db.swipes[profileId] = action;
  let match = false;
  let matchedAt = null;
  // Mutual only: the user liked them AND they had already liked the user.
  if (action === 'like' && profile.likesMe) {
    match = true;
    matchedAt = new Date().toISOString();
    db.matches.push({ profileId, matchedAt });
  }
  writeDb(db);
  return { status: 200, body: { match, matchedAt } };
}

export function getMatches() {
  const db = readDb();
  return db.matches
    .map((m) => ({ ...publicProfile(db.profiles.find((p) => p.id === m.profileId)), matchedAt: m.matchedAt }))
    .sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
}
