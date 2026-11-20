'use client';
import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 110;
const clamp = (v) => Math.max(0, Math.min(1, v));

export default function SwipeCard({ profile, isTop, onSwipe }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState('idle'); // idle | dragging | leaving
  const start = useRef(null);
  const done = useRef(false);

  const fling = (dir) => {
    if (done.current) return;
    done.current = true;
    setPhase('leaving');
    setPos({ x: dir * 700, y: 40 });
    setTimeout(() => onSwipe(profile, dir > 0 ? 'like' : 'pass'), 230);
  };

  useEffect(() => {
    if (!isTop) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') fling(1);
      if (e.key === 'ArrowLeft') fling(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const down = (e) => {
    if (!isTop || done.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setPhase('dragging');
  };
  const move = (e) => {
    if (phase !== 'dragging' || !start.current) return;
    setPos({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.3 });
  };
  const up = () => {
    if (phase !== 'dragging') return;
    start.current = null;
    if (Math.abs(pos.x) > THRESHOLD) fling(pos.x > 0 ? 1 : -1);
    else { setPhase('idle'); setPos({ x: 0, y: 0 }); }
  };

  const likeOpacity = clamp(pos.x / THRESHOLD);
  const passOpacity = clamp(-pos.x / THRESHOLD);
  const style = isTop
    ? {
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.x * 0.06}deg)`,
        transition: phase === 'dragging' ? 'none' : 'transform .25s cubic-bezier(.2,.8,.2,1)',
      }
    : { transform: 'scale(.95) translateY(14px)', opacity: 0.7 };

  return (
    <>
      <article
        className={'card' + (isTop ? ' top' : '')}
        style={style}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      >
        <img src={profile.photo} alt={`${profile.name}'s photo`} draggable={false} />
        <span className="stamp like" style={{ opacity: likeOpacity }}>Like</span>
        <span className="stamp pass" style={{ opacity: passOpacity }}>Pass</span>
        <div className="info">
          <h2>{profile.name}, {profile.age}</h2>
          <p className="place">{profile.place}</p>
          <p>{profile.bio}</p>
          <ul>{profile.interests.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      </article>
      {isTop && (
        <div className="actions">
          <button className="round pass" aria-label={`Pass on ${profile.name}`} onClick={() => fling(-1)}>✕</button>
          <button className="round like" aria-label={`Like ${profile.name}`} onClick={() => fling(1)}>♥</button>
        </div>
      )}
    </>
  );
}
