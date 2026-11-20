'use client';
import { useCallback, useEffect, useState } from 'react';
import SwipeCard from './SwipeCard';

export default function Discover() {
  const [view, setView] = useState('swipe');
  const [feed, setFeed] = useState(null);
  const [matches, setMatches] = useState([]);
  const [justMatched, setJustMatched] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [f, m] = await Promise.all([
        fetch('/api/feed').then((r) => r.json()),
        fetch('/api/matches').then((r) => r.json()),
      ]);
      setFeed(f.profiles);
      setMatches(m.matches);
      setError('');
    } catch {
      setError('Could not load profiles. Check your connection and try again.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const swipe = async (profile, action) => {
    setFeed((f) => f.filter((p) => p.id !== profile.id)); // never shown again, even if the request fails
    try {
      const r = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.id, action }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (d.match) {
        setJustMatched(profile);
        setMatches((m) => [{ ...profile, matchedAt: d.matchedAt }, ...m]);
      }
    } catch {
      setError('That swipe did not save. Reloading your feed.');
      load();
    }
  };

  const resetDemo = async () => {
    await fetch('/api/reset', { method: 'POST' });
    setJustMatched(null);
    load();
  };

  const stack = feed ?? [];
  return (
    <section className="discover">
      <header className="top">
        <h1>Discover</h1>
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={view === 'swipe'} className={view === 'swipe' ? 'on' : ''} onClick={() => setView('swipe')}>Swipe</button>
          <button role="tab" aria-selected={view === 'matches'} className={view === 'matches' ? 'on' : ''} onClick={() => setView('matches')}>
            Matches{matches.length > 0 && <span className="count">{matches.length}</span>}
          </button>
        </div>
      </header>

      {error && <p className="error" role="alert">{error} <button className="link" onClick={load}>Retry</button></p>}

      {view === 'swipe' && (
        <div className="deck">
          {feed === null && !error && <p className="muted center">Loading profiles…</p>}
          {feed !== null && stack.length === 0 && (
            <div className="empty">
              <h2>You’ve seen everyone for now</h2>
              <p>New people show up here as they join. Your likes stay private unless they like you back.</p>
              <button className="btn" onClick={() => setView('matches')}>See your matches</button>
              <button className="link" onClick={resetDemo}>Reset demo data</button>
            </div>
          )}
          {stack.slice(0, 2).reverse().map((p, i, arr) => (
            <SwipeCard key={p.id} profile={p} isTop={i === arr.length - 1} onSwipe={swipe} />
          ))}
        </div>
      )}

      {view === 'matches' && (
        <div className="matches">
          {matches.length === 0 ? (
            <div className="empty">
              <h2>No matches yet</h2>
              <p>A match appears only when you and someone else have both liked each other.</p>
              <button className="btn" onClick={() => setView('swipe')}>Keep swiping</button>
            </div>
          ) : (
            <ul>
              {matches.map((m) => (
                <li key={m.id}>
                  <img src={m.photo} alt="" />
                  <div>
                    <strong>{m.name}, {m.age}</strong>
                    <span>{m.place}</span>
                    <small>Matched {new Date(m.matchedAt).toLocaleDateString()}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {justMatched && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="It's a match">
          <div className="pair">
            <div className="pic you">You</div>
            <img className="pic" src={justMatched.photo} alt="" />
          </div>
          <h2>It’s a match!</h2>
          <p>You and {justMatched.name} liked each other.</p>
          <button className="btn" onClick={() => setJustMatched(null)}>Keep swiping</button>
          <button className="link light" onClick={() => { setJustMatched(null); setView('matches'); }}>View matches</button>
        </div>
      )}
    </section>
  );
}
