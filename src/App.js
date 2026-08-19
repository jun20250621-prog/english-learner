import React, { useState, useEffect, useCallback } from 'react';
import { sentences } from './data/sentences';
import { WordTooltip, SpeedControl } from './components/WordTooltip';
import { ContentPlayer } from './components/ContentPlayer';
import { ContentAdmin } from './components/ContentAdmin';
import { Dashboard } from './components/Dashboard';
import { AIChatbot } from './components/AIChatbot';
import { PronunciationPractice } from './components/PronunciationPractice';
import { GrammarAnalyzer } from './components/GrammarAnalyzer';

const getStoredData = (key, defaultValue) => { try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : defaultValue; } catch { return defaultValue; } };
const saveData = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const getToday = () => new Date().toISOString().split('T')[0];

const initializeProgress = () => {
  const today = getToday();
  const stored = getStoredData('learningProgress', null);
  if (stored) return stored;
  const initial = { startDate: today, lastStudyDate: today, totalDays: 1, totalLearned: 0, quizCorrect: 0, quizTotal: 0, streak: 1, dailyGoal: 10, dailyHistory: { [today]: 0 }, categoryStats: {} };
  saveData('learningProgress', initial);
  return initial;
};

function App() {
  const [darkMode, setDarkMode] = useState(() => getStoredData('darkMode', false));
  const [speechRate, setSpeechRate] = useState(() => getStoredData('speechRate', 0.7));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [category, setCategory] = useState('all');
  const [favorites, setFavorites] = useState(() => getStoredData('favorites', []));
  const [showFavorites, setShowFavorites] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentPage, setCurrentPage] = useState('main');
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [contentList, setContentList] = useState({ fairyTales: [], news: [], movies: [], exams: [], oral: [] });
  const [quizMode, setQuizMode] = useState('choice');
  const [quizSentence, setQuizSentence] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [quizResult, setQuizResult] = useState(null);
  const [progress, setProgress] = useState(initializeProgress);
  
  // 新功能狀態
  const [showAIChat, setShowAIChat] = useState(false);
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  
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

  const renderClickableWords = (text) => text.split(/(\s+)/).filter(Boolean).map((word, idx) => (word.trim() === '' || /^[^\w\s]+$/.test(word.trim())) ? <span key={idx}>{word}</span> : <WordTooltip key={idx} word={word.trim()} onSpeak={speakWord} darkMode={darkMode} />);

  const loadContent = async (type, id) => {
    try {
      let url = `/content/${type}/${id}.json`;
      // 考試題庫和口語練習直接用 id 作為檔名
      if (type === 'exams' || type === 'oral') {
        url = `/content/${id}.json`;
      }
      const res = await fetch(url);
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
        <h1 style={styles.title} onClick={() => setShowAdmin(true)} title="點擊新增內容">📚 English Learner</h1>
        <div style={styles.headerButtons}>
          <button style={styles.iconBtn} onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀️' : '🌙'}</button>
          <button style={styles.iconBtn} onClick={() => setShowDashboard(true)}>📊</button>
        </div>
      </header>

      {showDashboard && <Dashboard progress={progress} darkMode={darkMode} onClose={() => setShowDashboard(false)} />}
      {showAdmin && <ContentAdmin darkMode={darkMode} onClose={() => setShowAdmin(false)} />}

      <nav style={styles.nav}>
        <button style={showQuiz ? styles.activeTab : (showFavorites ? styles.activeTab : styles.tab)} onClick={() => { setShowFavorites(!showFavorites); setShowDashboard(false); setShowQuiz(false); setCurrentIndex(0); }}>{showFavorites ? '⭐ Favorites' : '❤️ My Favorites'}</button>
        <button style={showQuiz ? styles.activeTab : styles.tab} onClick={() => { setShowQuiz(!showQuiz); setShowDashboard(false); if (!showQuiz) startQuiz(); }}>📝 Quiz</button>
        {!showFavorites && !showQuiz && categories.map(cat => <button key={cat} style={category === cat ? styles.activeTab : styles.tab} onClick={() => { setCategory(cat); setCurrentIndex(0); setShowDashboard(false); }}>{cat === 'all' ? '📋 All' : cat === 'greeting' ? '👋 Greeting' : cat === 'daily' ? '💬 Daily' : cat === 'work' ? '💼 Work' : cat === 'tech' ? '🔧 Tech' : '🤝 Business'}</button>)}
      </nav>

      {contentList.fairyTales.length > 0 && !showQuiz && !showFavorites && category === 'all' && (
        <div style={styles.contentSection}>
          <div style={styles.contentTitle}>🦁 童話故事</div>
          <div style={styles.contentGrid}>
            {contentList.fairyTales.map(tale => <div key={tale.id} onClick={() => loadContent('fairy-tales', tale.id)} style={styles.contentCard}><div style={styles.contentEmoji}>{tale.image}</div><div style={styles.contentCardTitle}>{tale.title}</div><span style={styles.contentLevel}>{tale.level}</span></div>)}
          </div>
        </div>
      )}

      {contentList.movies && contentList.movies.length > 0 && !showQuiz && !showFavorites && category === 'all' && (
        <div style={styles.contentSection}>
          <div style={styles.contentTitle}>🎬 電影英文</div>
          <div style={styles.contentGrid}>
            {contentList.movies.map(movie => <div key={movie.id} onClick={() => loadContent('movies', movie.id)} style={styles.contentCard}><div style={styles.contentEmoji}>{movie.image}</div><div style={styles.contentCardTitle}>{movie.title}</div><span style={styles.contentLevel}>{movie.level}</span></div>)}
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

      {contentList.exams && contentList.exams.length > 0 && !showQuiz && !showFavorites && category === 'all' && (
        <div style={styles.contentSection}>
          <div style={styles.contentTitle}>📝 考試題庫</div>
          <div style={styles.contentGrid}>
            {contentList.exams.map(exam => <div key={exam.id} onClick={() => loadContent('exams', exam.id)} style={styles.contentCard}><div style={styles.contentEmoji}>{exam.image}</div><div style={styles.contentCardTitle}>{exam.title}</div><span style={styles.contentLevel}>{exam.level}</span></div>)}
          </div>
        </div>
      )}

      {contentList.oral && contentList.oral.length > 0 && !showQuiz && !showFavorites && category === 'all' && (
        <div style={styles.contentSection}>
          <div style={styles.contentTitle}>🗣️ 口語練習</div>
          <div style={styles.contentGrid}>
            {contentList.oral.map(item => <div key={item.id} onClick={() => loadContent('oral', item.id)} style={styles.contentCard}><div style={styles.contentEmoji}>{item.image}</div><div style={styles.contentCardTitle}>{item.title}</div><span style={styles.contentLevel}>{item.level}</span></div>)}
          </div>
        </div>
      )}

      {/* 新功能快捷鍵 */}
      <div style={styles.contentSection}>
        <div style={styles.contentTitle}>🚀 進階功能</div>
        <div style={{...styles.contentGrid, gridTemplateColumns: 'repeat(3, 1fr)'}}>
          <div onClick={() => setShowAIChat(true)} style={styles.contentCard}>
            <div style={styles.contentEmoji}>🤖</div>
            <div style={styles.contentCardTitle}>AI 對話</div>
          </div>
          <div onClick={() => setShowPronunciation(true)} style={styles.contentCard}>
            <div style={styles.contentEmoji}>🎤</div>
            <div style={styles.contentCardTitle}>發音練習</div>
          </div>
          <div onClick={() => setShowGrammar(true)} style={styles.contentCard}>
            <div style={styles.contentEmoji}>📖</div>
            <div style={styles.contentCardTitle}>文法解析</div>
          </div>
        </div>
      </div>

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

      {showQuiz && (
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

      <footer style={styles.footer}>
        <p>200 Sentences for English Learning</p>
        <button onClick={() => setShowAdmin(true)} style={{ 
          background: theme.cardBg, 
          border: `1px solid ${theme.border}`, 
          borderRadius: '20px',
          padding: '8px 16px', 
          color: theme.accent, 
          cursor: 'pointer', 
          fontSize: '14px',
          marginTop: '15px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}>➕ 新增內容</button>
      </footer>

      {/* 新功能組件 */}
      {showAIChat && <AIChatbot darkMode={darkMode} onClose={() => setShowAIChat(false)} />}
      {showPronunciation && current && <PronunciationPractice sentence={current} darkMode={darkMode} onClose={() => setShowPronunciation(false)} />}
      {showGrammar && current && <GrammarAnalyzer sentence={current} darkMode={darkMode} onClose={() => setShowGrammar(false)} />}
    </div>
  );
}

export default App;
