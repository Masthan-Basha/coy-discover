'use client';
import { useState } from 'react';
import Discover from '@/components/Discover';

export default function App() {
  const [tab, setTab] = useState('discover');
  return (
    <div className="shell">
      <main className="screen">
        {tab === 'home' ? <div className="home"><p>Home placeholder</p></div> : <Discover />}
      </main>
      <nav className="tabbar" aria-label="Main">
        {['home', 'discover'].map((t) => (
          <button key={t} className={tab === t ? 'tab on' : 'tab'} aria-current={tab === t} onClick={() => setTab(t)}>
            {t === 'home' ? 'Home' : 'Discover'}
          </button>
        ))}
      </nav>
    </div>
  );
}
