import React, { useState } from 'react';
import { sentences } from './data/sentences';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [category, setCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const categories = ['all', 'greeting', 'daily', 'work', 'tech', 'business'];

  const filteredSentences = showFavorites 
    ? sentences.filter(s => favorites.includes(s.id))
    : category === 'all' 
      ? sentences 
      : sentences.filter(s => s.category === category);

  const current = filteredSentences[currentIndex];

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const next = () => {
    setCurrentIndex((currentIndex + 1) % filteredSentences.length);
  };

  const prev = () => {
    setCurrentIndex((currentIndex - 1 + filteredSentences.length) % filteredSentences.length);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>📚 English Learner</h1>
        <div style={styles.stats}>
          <span>❤️ {favorites.length}</span>
        </div>
      </header>

      <nav style={styles.nav}>
        <button 
          style={showFavorites ? styles.activeTab : styles.tab}
          onClick={() => { setShowFavorites(!showFavorites); setCurrentIndex(0); }}
        >
          {showFavorites ? '⭐ Favorites' : '❤️ My Favorites'}
        </button>
        {!showFavorites && categories.map(cat => (
          <button
            key={cat}
            style={category === cat ? styles.activeTab : styles.tab}
            onClick={() => { setCategory(cat); setCurrentIndex(0); }}
          >
            {cat === 'all' ? '📋 All' : cat === 'greeting' ? '👋 Greeting' : 
             cat === 'daily' ? '💬 Daily' : cat === 'work' ? '💼 Work' : 
             cat === 'tech' ? '🔧 Tech' : '🤝 Business'}
          </button>
        ))}
      </nav>

      {filteredSentences.length === 0 ? (
        <div style={styles.empty}>
          <p>No favorites yet! ❤️ Click heart to add.</p>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.category}>{current.category}</span>
            <button 
              style={favorites.includes(current.id) ? styles.favActive : styles.fav}
              onClick={() => toggleFavorite(current.id)}
            >
              {favorites.includes(current.id) ? '❤️' : '🤍'}
            </button>
          </div>
          
          <div style={styles.english}>
            <h2>{current.en}</h2>
            <button style={styles.speakBtn} onClick={() => speak(current.en)}>
              🔊
            </button>
          </div>
          
          <p style={styles.chinese}>{current.zh}</p>
          
          <div style={styles.progress}>
            {currentIndex + 1} / {filteredSentences.length}
          </div>

          <div style={styles.controls}>
            <button style={styles.btn} onClick={prev}>◀️ Prev</button>
            <button style={styles.btn} onClick={next}>Next ▶️</button>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <p>200 Sentences for English Learning</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  stats: {
    fontSize: '18px',
  },
  nav: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  },
  tab: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '20px',
    backgroundColor: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '14px',
  },
  activeTab: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  category: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  fav: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  favActive: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  english: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px',
  },
  speakBtn: {
    backgroundColor: '#4CAF50',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '18px',
    cursor: 'pointer',
  },
  chinese: {
    color: '#666',
    fontSize: '18px',
    marginBottom: '20px',
  },
  progress: {
    textAlign: 'center',
    color: '#999',
    marginBottom: '15px',
  },
  controls: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  btn: {
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  footer: {
    textAlign: 'center',
    marginTop: '30px',
    color: '#999',
  },
};

export default App;
