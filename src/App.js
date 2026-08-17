import React, { useState, useEffect, useCallback } from 'react';
import { sentences } from './data/sentences';

const getStoredData = (key, defaultValue) => { try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : defaultValue; } catch { return defaultValue; } };
const saveData = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const getToday = () => new Date().toISOString().split('T')[0];

const initializeProgress = () => {
  const today = getToday();
  const stored = getStoredData('learningProgress', null);
  if (stored) return stored;
  const initial = { startDate: today, lastStudyDate: today, totalDays: 1, totalLearned: 0, quizCorrect: 0, quizTotal: 0, streak: 1, dailyHistory: { [today]: 0 } };
  saveData('learningProgress', initial);
  return initial;
};

const ClickableWord = ({ word, onSpeak, darkMode }) => {
  const theme = darkMode ? { bg: '#333', hover: '#444' } : { bg: '#e8f5e9', hover: '#c8e6c9' };
  return <span style={{ display: 'inline-block', padding: '2px 6px', margin: '2px', borderRadius: '4px', cursor: 'pointer', backgroundColor: theme.bg, transition: 'all 0.2s' }} onClick={(e) => { e.stopPropagation(); onSpeak(word); }} onMouseEnter={(e) => e.target.style.backgroundColor = theme.hover} onMouseLeave={(e) => e.target.style.backgroundColor = theme.bg} title="點擊發音">{word}</span>;
};

const SpeedControl = ({ rate, onRateChange, darkMode }) => {
  const speeds = [{ value: 0.5, label: '0.5x' }, { value: 0.7, label: '0.7x' }, { value: 1.0, label: '1.0x' }];
  const theme = darkMode ? { active: '#4CAF50', inactive: '#333' } : { active: '#4CAF50', inactive: '#e0e0e0' };
  return <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>{speeds.map(s => <button key={s.value} style={{ padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: rate === s.value ? 'bold' : 'normal', backgroundColor: rate === s.value ? theme.active : theme.inactive, color: rate === s.value ? 'white' : (darkMode ? '#aaa' : '#666') }} onClick={() => onRateChange(s.value)}>{s.label}</button>)}</div>;
};

const ContentPlayer = ({ content, type, onBack, darkMode }) => {
  const [index, setIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const isNews = type === 'news';
  const segments = isNews ? content.segments : content.sentences;
  const current = segments[index];
  const isWordList = isNews && current && current.title === '預習單字';

  const speak = (text) => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.7; speechSynthesis.speak(u); };
  const theme = darkMode ? { bg: '#121212', cardBg: '#1e1e1e', text: '#e0e0e0', textSecondary: '#aaa', accent: '#4CAF50', accentBg: '#1b5e20', button: '#2196F3', border: '#333' } : { bg: '#f5f5f5', cardBg: 'white', text: '#333', textSecondary: '#666', accent: '#4CAF50', accentBg: '#e8f5e9', button: '#2196F3', border: '#ddd' };

  const renderWords = (text) => text.split(/(\s+)/).filter(Boolean).map((word, idx) => (word.trim() === '' || /^[^\w\s]+$/.test(word.trim())) ? <span key={idx}>{word}</span> : <ClickableWord key={idx} word={word.trim()} onSpeak={(w) => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(w); u.lang = 'en-US'; u.rate = 0.5; speechSynthesis.speak(u); }} darkMode={darkMode} />);

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: theme.bg, minHeight: '100vh', color: theme.text },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    backBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    title: { margin: 0, fontSize: '16px' },
    card: { backgroundColor: theme.cardBg, borderRadius: '16px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    label: { backgroundColor: theme.accentBg, color: theme.accent, padding: '4px 12px', borderRadius: '12px', fontSize: '12px', display: 'inline-block', marginBottom: '15px' },
    sentence: { fontSize: '20px', lineHeight: '1.8', marginBottom: '20px', wordBreak: 'break-word' },
    btnRow: { display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' },
    speakBtn: { padding: '12px 24px', border: 'none', borderRadius: '25px', backgroundColor: theme.accent, color: 'white', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
    transBtn: { display: 'block', margin: '0 auto 15px', padding: '10px 20px', backgroundColor: 'transparent', border: `2px solid ${theme.border}`, borderRadius: '25px', color: theme.textSecondary, cursor: 'pointer' },
    chinese: { color: theme.textSecondary, fontSize: '18px', padding: '15px', backgroundColor: theme.bg, borderRadius: '8px', marginBottom: '20px', textAlign: 'center' },
    nav: { display: 'flex', gap: '10px', justifyContent: 'center' },
    navBtn: { padding: '12px 24px', backgroundColor: theme.button, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
    progress: { textAlign: 'center', color: theme.textSecondary, marginBottom: '15px' },
    progressBar: { height: '8px', backgroundColor: theme.border, borderRadius: '4px', marginTop: '20px', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.accent, width: `${((index + 1) / segments.length) * 100}%`, transition: 'width 0.3s' },
  };

  if (!current) return <div style={styles.container}>載入中...</div>;

  const words = !isNews && current.words ? current.words : [];
  const enText = isNews ? (isWordList ? '' : current.sentences?.map(s => s.en).join(' ')) : current.en;
  const zhText = isNews ? (isWordList ? '' : current.sentences?.map(s => s.zh).join(' ')) : current.zh;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <h2 style={styles.title}>{content.image || '📰'} {content.title}</h2>
        <button style={{...styles.backBtn, opacity: 0}}>←</button>
      </div>
      <div style={styles.card}>
        <span style={styles.label}>{isNews ? (isWordList ? '📖 預習單字' : current.title) : `句子 ${index + 1} / ${segments.length}`}</span>
        {isWordList ? (
          <div>{current.words && current.words.map((w, i) => <button key={i} onClick={() => speak(w.en)} style={{display: 'block', width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '12px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, cursor: 'pointer', textAlign: 'left'}}><span style={{fontSize: '18px', marginRight: '10px'}}>🔊</span><strong>{w.en}</strong> = {w.zh}</button>)}</div>
        ) : (
          <>
            <div style={styles.sentence}>{!isNews ? renderWords(current.en) : current.sentences && current.sentences.map((s, i) => <div key={i} style={{marginBottom: '15px', padding: '12px', backgroundColor: theme.bg, borderRadius: '8px'}}><div style={{marginBottom: '8px'}}>{s.en}</div><button onClick={() => speak(s.en)} style={{backgroundColor: theme.accent, color: 'white', border: 'none', borderRadius: '15px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer'}}>🔊</button></div>)}</div>
            <div style={styles.btnRow}><button style={styles.speakBtn} onClick={() => speak(enText)}>🔊 朗讀</button></div>
            <button style={styles.transBtn} onClick={() => setShowTranslation(!showTranslation)}>{showTranslation ? '🙈 隱藏翻譯' : '👁️ 顯示翻譯'}</button>
            {showTranslation && <div style={styles.chinese}>{zhText}</div>}
          </>
        )}
        <div style={styles.progress}>{index + 1} / {segments.length}</div>
        <div style={styles.nav}>
          <button style={styles.navBtn} onClick={() => setIndex(Math.max(0, index - 1))}>◀️ 上一個</button>
          <button style={styles.navBtn} onClick={() => setIndex(Math.min(segments.length - 1, index + 1))}>下一個 ▶️</button>
        </div>
      </div>
      <div style={styles.progressBar}><div style={styles.progressFill} /></div>
    </div>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(() => getStoredData('darkMode', false));
  const [speechRate, setSpeechRate] = useState(() => getStoredData('speechRate', 0.7));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [category, setCategory] = useState('all');
  const [favorites, setFavorites] = useState(() => getStoredData('favorites', []));
  const [showFavorites, setShowFavorites] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentPage, setCurrentPage] = useState('main');
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [contentList, setContentList] = useState({ fairyTales: [], news: [] });
  const [quizMode, setQuizMode] = useState('choice');
  const [quizSentence, setQuizSentence] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [quizResult, setQuizResult] = useState(null);
  const [progress, setProgress] = useState(initializeProgress);
  const categories = ['all', 'greeting', 'daily', 'work', 'tech', 'business'];

  useEffect(() => { fetch('/content/content-index.json').then(res => res.json()).then(data => setContentList(data)).catch(err => console.log('載入內容失敗', err)); }, []);

  const filteredSentences = showFavorites ? sentences.filter(s => favorites.includes(s.id)) : category === 'all' ? sentences : sentences.filter(s => s.category === category);
  const current = filteredSentences[currentIndex];

  useEffect(() => saveData('favorites', favorites), [favorites]);
  useEffect(() => saveData('darkMode', darkMode), [darkMode]);
  useEffect(() => saveData('speechRate', speechRate), [speechRate]);
  useEffect(() => saveData('learningProgress', progress), [progress]);

  const speak = useCallback((text, rate = speechRate) => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = rate; speechSynthesis.speak(u); }, [speechRate]);
  const speakWord = useCallback((word) => speak(word, 0.5), [speak]);
  const speakSentence = useCallback(() => current && speak(current.en, speechRate), [current, speak, speechRate]);

  const updateProgress = (isCorrect = null) => {
    const today = getToday();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    setProgress(prev => {
      let newStreak = prev.streak;
      if (today !== prev.lastStudyDate) newStreak = prev.lastStudyDate === yesterdayStr ? prev.streak + 1 : 1;
      return { ...prev, lastStudyDate: today, totalLearned: prev.totalLearned + 1, totalDays: prev.lastStudyDate === today ? prev.totalDays : prev.totalDays + 1, streak: newStreak, quizCorrect: isCorrect === true ? prev.quizCorrect + 1 : prev.quizCorrect, quizTotal: isCorrect !== null ? prev.quizTotal + 1 : prev.quizTotal, dailyHistory: { ...prev.dailyHistory, [today]: (prev.dailyHistory[today] || 0) + 1 } };
    });
  };

  const toggleFavorite = (id) => setFavorites(favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id]);
  const next = () => { setCurrentIndex((currentIndex + 1) % filteredSentences.length); setShowTranslation(false); updateProgress(); };
  const prev = () => { setCurrentIndex((currentIndex - 1 + filteredSentences.length) % filteredSentences.length); setShowTranslation(false); updateProgress(); };

  const startQuiz = () => {
    setQuizResult(null); setUserAnswer('');
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    setQuizSentence(randomSentence);
    if (quizMode === 'choice') {
      const wrongOptions = sentences.filter(s => s.id !== randomSentence.id).sort(() => Math.random() - 0.5).slice(0, 3).map(s => s.zh);
      setQuizOptions([randomSentence.zh, ...wrongOptions].sort(() => Math.random() - 0.5));
    }
    setShowQuiz(true);
  };

  const submitAnswer = () => {
    if (!userAnswer.trim()) return;
    const isCorrect = quizMode === 'choice' ? userAnswer === quizSentence.zh : userAnswer.trim().toLowerCase() === quizSentence.zh.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    setQuizResult(isCorrect);
    updateProgress(isCorrect);
  };

  const renderClickableWords = (text) => text.split(/(\s+)/).filter(Boolean).map((word, idx) => (word.trim() === '' || /^[^\w\s]+$/.test(word.trim())) ? <span key={idx}>{word}</span> : <ClickableWord key={idx} word={word.trim()} onSpeak={speakWord} darkMode={darkMode} />);

  const loadContent = async (type, id) => {
    try {
      const res = await fetch(`/content/${type}/${id}.json`);
      const data = await res.json();
      setSelectedContent(data);
      setContentType(type);
      setCurrentPage('player');
    } catch (err) { console.error('載入內容失敗', err); }
  };

  const theme = darkMode ? { bg: '#121212', cardBg: '#1e1e1e', text: '#e0e0e0', textSecondary: '#aaa', accent: '#4CAF50', accentBg: '#1b5e20', button: '#2196F3', border: '#333' } : { bg: '#f5f5f5', cardBg: 'white', text: '#333', textSecondary: '#666', accent: '#4CAF50', accentBg: '#e8f5e9', button: '#2196F3', border: '#ddd' };

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', transition: 'background-color 0.3s, color 0.3s' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '20px', margin: 0 },
    headerButtons: { display: 'flex', gap: '8px' },
    iconBtn: { background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '16px' },
    nav: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' },
    tab: { padding: '8px 12px', border: 'none', borderRadius: '20px', backgroundColor: theme.cardBg, color: theme.textSecondary, cursor: 'pointer', fontSize: '14px' },
    activeTab: { padding: '8px 12px', border: 'none', borderRadius: '20px', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', fontSize: '14px' },
    card: { backgroundColor: theme.cardBg, borderRadius: '16px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    category: { backgroundColor: theme.accentBg, color: theme.accent, padding: '4px 12px', borderRadius: '12px', fontSize: '12px', textTransform: 'uppercase' },
    fav: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' },
    englishText: { fontSize: '22px', lineHeight: '1.8', marginBottom: '15px', wordBreak: 'break-word' },
    wordHint: { fontSize: '12px', color: theme.textSecondary, marginBottom: '10px' },
    speakRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '15px' },
    speakBtnPrimary: { padding: '12px 24px', border: 'none', borderRadius: '25px', backgroundColor: theme.accent, color: 'white', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
    speakBtnSecondary: { padding: '12px 24px', border: 'none', borderRadius: '25px', backgroundColor: theme.button, color: 'white', fontSize: '16px', cursor: 'pointer' },
    chinese: { color: theme.textSecondary, fontSize: '18px', marginBottom: '20px', padding: '15px', backgroundColor: theme.bg, borderRadius: '8px' },
    progress: { textAlign: 'center', color: theme.textSecondary, marginBottom: '15px' },
    controls: { display: 'flex', gap: '10px', justifyContent: 'center' },
    btn: { padding: '12px 24px', backgroundColor: theme.button, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
    translationBtn: { display: 'block', margin: '15px auto', padding: '10px 20px', backgroundColor: 'transparent', border: `2px solid ${theme.border}`, borderRadius: '25px', color: theme.textSecondary, cursor: 'pointer', fontSize: '14px' },
    statsCard: { backgroundColor: theme.cardBg, borderRadius: '16px', padding: '20px', marginBottom: '20px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' },
    statsItem: { textAlign: 'center', padding: '15px', backgroundColor: theme.bg, borderRadius: '12px' },
    statsValue: { fontSize: '28px', fontWeight: 'bold', color: theme.accent },
    statsLabel: { fontSize: '12px', color: theme.textSecondary, marginTop: '5px' },
    progressBar: { height: '8px', backgroundColor: theme.border, borderRadius: '4px', marginTop: '10px', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.accent, borderRadius: '4px', transition: 'width 0.3s' },
    contentSection: { marginBottom: '20px' },
    contentTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' },
    contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
    contentCard: { backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    contentEmoji: { fontSize: '32px', marginBottom: '8px' },
    contentCardTitle: { fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' },
    contentLevel: { fontSize: '11px', color: theme.accent, backgroundColor: theme.accentBg, padding: '2px 8px', borderRadius: '10px' },
    footer: { textAlign: 'center', marginTop: '30px', color: theme.textSecondary },
    quizOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    quizCard: { backgroundColor: theme.cardBg, borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '500px', position: 'relative' },
    quizCloseBtn: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: theme.text, fontSize: '24px', cursor: 'pointer' },
    quizQuestion: { fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' },
    quizOption: { padding: '15px', border: `2px solid ${theme.border}`, borderRadius: '8px', backgroundColor: 'transparent', color: theme.text, cursor: 'pointer', textAlign: 'center', fontSize: '16px', marginBottom: '10px' },
    quizInput: { width: '100%', padding: '15px', fontSize: '18px', border: `2px solid ${theme.border}`, borderRadius: '8px', backgroundColor: theme.bg, color: theme.text, marginBottom: '20px', textAlign: 'center' },
    quizResult: { textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
    modeSelector: { display: 'flex', gap: '10px', marginBottom: '20px' },
    modeBtn: { flex: 1, padding: '10px', border: `2px solid ${theme.border}`, borderRadius: '8px', backgroundColor: 'transparent', color: theme.text, cursor: 'pointer', fontSize: '14px' },
    modeBtnActive: { borderColor: theme.accent, backgroundColor: theme.accent, color: 'white' },
  };

  if (currentPage === 'player' && selectedContent) return <ContentPlayer content={selectedContent} type={contentType} onBack={() => { setCurrentPage('main'); setSelectedContent(null); }} darkMode={darkMode} />;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>📚 English Learner</h1>
        <div style={styles.headerButtons}>
          <button style={styles.iconBtn} onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀️' : '🌙'}</button>
          <button style={styles.iconBtn} onClick={() => { setShowStats(!showStats); setShowQuiz(false); }}>📊</button>
        </div>
      </header>

      {showStats && (
        <div style={styles.statsCard}>
          <h2 style={{textAlign: 'center', marginBottom: '20px'}}>📈 學習統計</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statsItem}><div style={styles.statsValue}>{progress.totalLearned}</div><div style={styles.statsLabel}>總學習次數</div></div>
            <div style={styles.statsItem}><div style={styles.statsValue}>{progress.streak} 🔥</div><div style={styles.statsLabel}>連續天數</div></div>
            <div style={styles.statsItem}><div style={styles.statsValue}>{progress.totalDays}</div><div style={styles.statsLabel}>學習天數</div></div>
            <div style={styles.statsItem}><div style={styles.statsValue}>{progress.quizTotal > 0 ? Math.round((progress.quizCorrect / progress.quizTotal) * 100) : 0}%</div><div style={styles.statsLabel}>測驗正確率</div></div>
          </div>
        </div>
      )}

      <nav style={styles.nav}>
        <button style={showQuiz ? styles.activeTab : (showFavorites ? styles.activeTab : styles.tab)} onClick={() => { setShowFavorites(!showFavorites); setShowStats(false); setShowQuiz(false); setCurrentIndex(0); }}>{showFavorites ? '⭐ Favorites' : '❤️ My Favorites'}</button>
        <button style={showQuiz ? styles.activeTab : styles.tab} onClick={() => { setShowQuiz(!showQuiz); setShowStats(false); if (!showQuiz) startQuiz(); }}>📝 Quiz</button>
        {!showFavorites && !showQuiz && categories.map(cat => <button key={cat} style={category === cat ? styles.activeTab : styles.tab} onClick={() => { setCategory(cat); setCurrentIndex(0); setShowStats(false); }}>{cat === 'all' ? '📋 All' : cat === 'greeting' ? '👋 Greeting' : cat === 'daily' ? '💬 Daily' : cat === 'work' ? '💼 Work' : cat === 'tech' ? '🔧 Tech' : '🤝 Business'}</button>)}
      </nav>

      {contentList.fairyTales.length > 0 && !showQuiz && !showFavorites && category === 'all' && (
        <div style={styles.contentSection}>
          <div style={styles.contentTitle}>🦁 童話故事</div>
          <div style={styles.contentGrid}>
            {contentList.fairyTales.map(tale => <div key={tale.id} onClick={() => loadContent('fairy-tales', tale.id)} style={styles.contentCard}><div style={styles.contentEmoji}>{tale.image}</div><div style={styles.contentCardTitle}>{tale.title}</div><span style={styles.contentLevel}>{tale.level}</span></div>)}
          </div>
        </div>
      )}

      {contentList.news.length > 0 && !showQuiz && !showFavorites && category === 'all' && (
        <div style={styles.contentSection}>
          <div style={styles.contentTitle}>📰 慢速英語新聞</div>
          <div style={styles.contentGrid}>
            {contentList.news.map(item => <div key={item.id} onClick={() => loadContent('news', item.id)} style={styles.contentCard}><div style={styles.contentEmoji}>📰</div><div style={styles.contentCardTitle}>{item.title}</div><span style={styles.contentLevel}>{item.level}</span></div>)}
          </div>
        </div>
      )}

      {!showQuiz && (filteredSentences.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>No favorites yet! ❤️ Click heart to add.</div> : (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.category}>{current.category}</span>
            <button style={styles.fav} onClick={() => toggleFavorite(current.id)}>{favorites.includes(current.id) ? '❤️' : '🤍'}</button>
          </div>
          <SpeedControl rate={speechRate} onRateChange={setSpeechRate} darkMode={darkMode} />
          <div style={styles.wordHint}>💡 點擊單詞可以發音</div>
          <div style={styles.englishText}>{renderClickableWords(current.en)}</div>
          <div style={styles.speakRow}>
            <button style={styles.speakBtnPrimary} onClick={speakSentence}>🔊 朗讀 ({speechRate}x)</button>
            <button style={styles.speakBtnSecondary} onClick={speakSentence}>🔄 重聽</button>
          </div>
          <button style={styles.translationBtn} onClick={() => setShowTranslation(!showTranslation)}>{showTranslation ? '🙈 隱藏翻譯' : '👁️ 顯示翻譯'}</button>
          {showTranslation && <p style={styles.chinese}>{current.zh}</p>}
          <div style={styles.progress}>{currentIndex + 1} / {filteredSentences.length}</div>
          <div style={styles.controls}>
            <button style={styles.btn} onClick={prev}>◀️ 上一句</button>
            <button style={styles.btn} onClick={next}>下一句 ▶️</button>
          </div>
        </div>
      ))}

      {showQuiz && !showStats && (
        <div style={styles.quizOverlay}>
          <button style={styles.quizCloseBtn} onClick={() => setShowQuiz(false)}>✕</button>
          <div style={styles.quizCard}>
            <h2 style={{textAlign: 'center', marginBottom: '20px'}}>📝 測驗模式</h2>
            <div style={styles.modeSelector}>
              <button style={quizMode === 'choice' ? {...styles.modeBtn, ...styles.modeBtnActive} : styles.modeBtn} onClick={() => setQuizMode('choice')}>選擇題</button>
              <button style={quizMode === 'fill' ? {...styles.modeBtn, ...styles.modeBtnActive} : styles.modeBtn} onClick={() => setQuizMode('fill')}>填空題</button>
            </div>
            {quizSentence && !quizResult && (<><p style={styles.quizQuestion}>"{quizSentence.en}"<br/><span style={{fontSize: '14px', color: theme.textSecondary}}>請翻譯成中文</span></p>{quizMode === 'choice' ? <div>{quizOptions.map((opt, idx) => <button key={idx} style={userAnswer === opt ? {...styles.quizOption, borderColor: theme.button, backgroundColor: theme.button, color: 'white'} : styles.quizOption} onClick={() => setUserAnswer(opt)}>{opt}</button>)}</div> : <input type="text" style={styles.quizInput} placeholder="輸入中文翻譯..." value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && submitAnswer()} />}<div style={styles.controls}><button style={{...styles.btn, opacity: userAnswer ? 1 : 0.5}} onClick={submitAnswer} disabled={!userAnswer}>提交答案</button><button style={styles.btn} onClick={startQuiz}>下一題</button></div></>)}
            {quizResult !== null && quizSentence && (<div style={styles.quizResult}><div style={{ color: quizResult ? '#4CAF50' : '#f44336' }}>{quizResult ? '✅ 答對了！' : '❌ 答錯了！'}</div><p style={{fontSize: '18px', marginTop: '15px'}}>{quizSentence.en}<br/><strong>{quizSentence.zh}</strong></p><button style={{...styles.btn, marginTop: '20px'}} onClick={startQuiz}>下一題</button></div>)}
          </div>
        </div>
      )}

      <footer style={styles.footer}><p>200 Sentences for English Learning</p></footer>
    </div>
  );
}

export default App;
