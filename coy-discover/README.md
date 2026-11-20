# Coy Discover

A swipe-based "Discover" tab for Coy, built as a standalone Next.js app. The Home tab is intentionally blank.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000 (open in a mobile viewport)
npm test         # backend logic tests
```

State is stored in `data/db.json` (created on first request) and survives reloads. Use **Reset demo data** on the empty-state screen (or `POST /api/reset`) to start over.

## Using it

- Mobile: drag the card right to like, left to pass.
- Desktop: use the ♥ / ✕ buttons or the arrow keys.
- 10 of the 32 seeded profiles have already liked you, so matches appear within a handful of likes.

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/feed` | Profiles not yet swiped on |
| `POST /api/swipe` `{profileId, action: "like"\|"pass"}` | Records the swipe, returns `{match, matchedAt}` |
| `GET /api/matches` | Mutual matches, newest first |
| `POST /api/reset` | Demo helper: restore seed data |

## Privacy decisions

The core promise is that nobody learns who liked them unless it is mutual.

1. **`likesMe` never leaves the server.** It lives in the DB but every response goes through `publicProfile()`, which strips it. Tests assert this for `/feed` and `/matches`.
2. **Feed order is shuffled at seed time.** If admirers appeared first, the order itself would leak who liked you.
3. **A match requires both sides.** `recordSwipe` creates a match only when the user likes AND the profile already liked the user. Passing never reveals anything.
4. **Swipes are write-once.** Re-swiping a profile is a no-op, so nobody can flip a pass into a like to probe whether someone liked them.
5. **Swiped profiles are removed from the feed server-side**, and the client also removes the card immediately, so it can't reappear.

## Structure

```
lib/seed.js     32 mock profiles (deterministic)
lib/db.js       JSON-file persistence, atomic writes
lib/logic.js    feed / swipe / matches rules (unit tested)
app/api/*       thin route handlers
components/     Discover (feed, matches, empty/match states), SwipeCard (drag + buttons)
```

## Trade-offs

- JSON file storage keeps setup to zero. It needs a writable filesystem, so use a local run or a Node host rather than a read-only serverless one. In production I'd swap `lib/db.js` for SQLite/Postgres with a unique `(user_id, target_id)` constraint on swipes.
- Single logged-in user per the brief; adding auth means scoping `swipes` and `matches` by user id.

## Part A: Two feature suggestions

(See the section below. Replace or extend with your own observations from using the live app.)
