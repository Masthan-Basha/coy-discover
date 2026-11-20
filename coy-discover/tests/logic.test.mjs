import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';

process.env.COY_DB_FILE = path.join(os.tmpdir(), `coy-test-${Date.now()}.json`);
const { getFeed, recordSwipe, getMatches } = await import('../lib/logic.js');
const { readDb, resetDb } = await import('../lib/db.js');

test('seeds at least 30 profiles and some like the user', () => {
  resetDb();
  const db = readDb();
  assert.ok(db.profiles.length >= 30);
  assert.ok(db.profiles.some((p) => p.likesMe));
});

test('feed never leaks who liked the user', () => {
  resetDb();
  for (const p of getFeed()) assert.equal('likesMe' in p, false);
});

test('swiped profiles never reappear in feed', () => {
  resetDb();
  const first = getFeed()[0];
  recordSwipe(first.id, 'pass');
  assert.ok(!getFeed().some((p) => p.id === first.id));
});

test('match only when both liked; pass never matches', () => {
  resetDb();
  const db = readDb();
  const fan = db.profiles.find((p) => p.likesMe);
  const other = db.profiles.find((p) => !p.likesMe);
  assert.equal(recordSwipe(other.id, 'like').body.match, false);
  assert.equal(recordSwipe(fan.id, 'like').body.match, true);
  assert.equal(getMatches().length, 1);
});

test('passing someone who liked you creates no match', () => {
  resetDb();
  const fan = readDb().profiles.find((p) => p.likesMe);
  assert.equal(recordSwipe(fan.id, 'pass').body.match, false);
  assert.equal(getMatches().length, 0);
});

test('repeat swipe cannot flip the outcome', () => {
  resetDb();
  const fan = readDb().profiles.find((p) => p.likesMe);
  recordSwipe(fan.id, 'pass');
  const again = recordSwipe(fan.id, 'like');
  assert.equal(again.body.match, false);
  assert.equal(getMatches().length, 0);
});

test('validates input', () => {
  assert.equal(recordSwipe('nope', 'like').status, 404);
  assert.equal(recordSwipe('p01', 'maybe').status, 400);
});

test('matches never expose likesMe', () => {
  resetDb();
  const fan = readDb().profiles.find((p) => p.likesMe);
  recordSwipe(fan.id, 'like');
  for (const m of getMatches()) assert.equal('likesMe' in m, false);
});
