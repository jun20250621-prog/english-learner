import React, { useState, useEffect } from 'react';
import { sentences } from './data/sentences';

// ========== 取得儲存的資料 ==========
const getStoredData = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ========== 取得今天的日期字串 ==========
const getToday = () => new Date().toISOString().split('T')[0];

// ========== 初始化學習紀錄 ==========
const initializeProgress = () => {
  const today = getToday();
  const stored = getStoredData('learningProgress', null);
  if (stored) return stored;
  
  const initial = {
    startDate: today,
    lastStudyDate: today,
    totalDays: 1,
    totalLearned: 0,
    quizCorrect: 0,
    quizTotal: 0,
    streak: 1,
    dailyHistory: { [today]: 0 }
  };
  saveData('learningProgress', initial);
  return initial;
};

function App() {
  // ---------- 狀態 ----------
  const [darkMode, setDarkMode] = useState(() => getStoredData('darkMode', false));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [category, setCategory] = useState('all');
  const [favorites, setFavorites] = useState(() => getStoredData('favorites', []));
  const [showFavorites, setShowFavorites] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // 測驗模式狀態
  const [quizMode, setQuizMode] = useState('choice'); // 'choice' or 'fill'
  const [quizSentence, setQuizSentence] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [quizResult, setQuizResult] = useState(null); // null, true, false
  
  // 進度統計
  const [progress, setProgress] = useState(initializeProgress);

  const categories = ['all', 'greeting', 'daily', 'work', 'tech', 'business'];

  // ---------- 過濾句子 ----------
  const filteredSentences = showFavorites 
    ? sentences.filter(s => favorites.includes(s.id))
    : category === 'all' 
      ? sentences 
      : sentences.filter(s => s.category === category);

  const current = filteredSentences[currentIndex];

  // ---------- 儲存變更 ----------
  useEffect(() => saveData('favorites', favorites), [favorites]);
  useEffect(() => saveData('darkMode', darkMode), [darkMode]);
  useEffect(() => saveData('learningProgress', progress), [progress]);

  // ---------- 更新學習進度 ----------
  const updateProgress = (isCorrect = null) => {
    const today = getToday();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    setProgress(prev => {
      let newStreak = prev.streak;
      if (today !== prev.lastStudyDate) {
        if (prev.lastStudyDate === yesterdayStr) {
          newStreak = prev.streak + 1;
        } else {
          newStreak = 1;
        }
      }

      return {
        ...prev,
        lastStudyDate: today,
        totalLearned: prev.totalLearned + 1,
        totalDays: prev.lastStudyDate === today ? prev.totalDays : prev.totalDays + 1,
        streak: newStreak,
        quizCorrect: isCorrect === true ? prev.quizCorrect + 1 : prev.quizCorrect,
        quizTotal: isCorrect !== null ? prev.quizTotal + 1 : prev.quizTotal,
        dailyHistory: {
          ...prev.dailyHistory,
          [today]: (prev.dailyHistory[today] || 0) + 1
        }
      };
    });
  };

  // ---------- 朗讀功能 ----------
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  // ---------- 收藏功能 ----------
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // ---------- 卡片導航 ----------
  const next = () => {
    setCurrentIndex((currentIndex + 1) % filteredSentences.length);
    updateProgress();
  };

  const prev = () => {
    setCurrentIndex((currentIndex - 1 + filteredSentences.length) % filteredSentences.length);
    updateProgress();
  };

  // ---------- 測驗功能 ----------
  const startQuiz = () => {
    setQuizResult(null);
    setUserAnswer('');
    
    // 隨機選擇一個句子
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    setQuizSentence(randomSentence);
    
    if (quizMode === 'choice') {
      // 產生 4 個選項 (1 個正確 + 3 個隨機)
      const wrongOptions = sentences
        .filter(s => s.id !== randomSentence.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(s => s.zh);
      
      const allOptions = [randomSentence.zh, ...wrongOptions].sort(() => Math.random() - 0.5);
      setQuizOptions(allOptions);
    }
    
    setShowQuiz(true);
  };

  const submitAnswer = () => {
    if (!userAnswer.trim()) return;
    
    let isCorrect = false;
    if (quizMode === 'choice') {
      isCorrect = userAnswer === quizSentence.zh;
    } else {
      // 填空模式：忽略大小寫和空格
      const userAns = userAnswer.trim().toLowerCase();
      const correctAns = quizSentence.zh.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      isCorrect = userAns === correctAns || 
        quizSentence.en.toLowerCase().includes(userAns);
    }
    
    setQuizResult(isCorrect);
    updateProgress(isCorrect);
  };

  const closeQuiz = () => {
    setShowQuiz(false);
    setQuizSentence(null);
    setQuizResult(null);
  };

  // ---------- 主題樣式 ----------
  const theme = darkMode ? {
    bg: '#121212',
    cardBg: '#1e1e1e',
    text: '#e0e0e0',
    textSecondary: '#aaa',
    accent: '#4CAF50',
    accentBg: '#1b5e20',
    button: '#2196F3',
    border: '#333'
  } : {
    bg: '#f5f5f5',
    cardBg: 'white',
    text: '#333',
    textSecondary: '#666',
    accent: '#4CAF50',
    accentBg: '#e8f5e9',
    button: '#2196F3',
    border: '#ddd'
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: theme.bg,
      color: theme.text,
      minHeight: '100vh',
      transition: 'background-color 0.3s, color 0.3s'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    title: {
      fontSize: '20px',
      margin: 0,
    },
    headerButtons: {
      display: 'flex',
      gap: '8px',
    },
    iconBtn: {
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '16px',
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
      backgroundColor: theme.cardBg,
      color: theme.textSecondary,
      cursor: 'pointer',
      fontSize: '14px',
    },
    activeTab: {
      padding: '8px 12px',
      border: 'none',
      borderRadius: '20px',
      backgroundColor: theme.accent,
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
    },
    card: {
      backgroundColor: theme.cardBg,
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
      backgroundColor: theme.accentBg,
      color: theme.accent,
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
    english: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '15px',
    },
    englishText: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0,
    },
    speakBtn: {
      backgroundColor: theme.accent,
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      fontSize: '18px',
      cursor: 'pointer',
    },
    chinese: {
      color: theme.textSecondary,
      fontSize: '18px',
      marginBottom: '20px',
    },
    progress: {
      textAlign: 'center',
      color: theme.textSecondary,
      marginBottom: '15px',
    },
    controls: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
    },
    btn: {
      padding: '12px 24px',
      backgroundColor: theme.button,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    empty: {
      textAlign: 'center',
      padding: '40px',
      color: theme.textSecondary,
    },
    footer: {
      textAlign: 'center',
      marginTop: '30px',
      color: theme.textSecondary,
    },
    // 測驗樣式
    quizOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    quizCard: {
      backgroundColor: theme.cardBg,
      borderRadius: '16px',
      padding: '30px',
      width: '90%',
      maxWidth: '500px',
    },
    quizTitle: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    quizQuestion: {
      fontSize: '20px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '20px',
    },
    quizOptions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    quizOption: {
      padding: '15px',
      border: `2px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: 'transparent',
      color: theme.text,
      cursor: 'pointer',
      textAlign: 'center',
      fontSize: '16px',
    },
    quizOptionSelected: {
      borderColor: theme.button,
      backgroundColor: theme.button,
      color: 'white',
    },
    quizInput: {
      width: '100%',
      padding: '15px',
      fontSize: '18px',
      border: `2px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: theme.bg,
      color: theme.text,
      marginBottom: '20px',
      textAlign: 'center',
    },
    quizResult: {
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    quizResultCorrect: {
      color: '#4CAF50',
    },
    quizResultWrong: {
      color: '#f44336',
    },
    quizCloseBtn: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'none',
      border: 'none',
      color: theme.text,
      fontSize: '24px',
      cursor: 'pointer',
    },
    // 統計樣式
    statsCard: {
      backgroundColor: theme.cardBg,
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '15px',
    },
    statsItem: {
      textAlign: 'center',
      padding: '15px',
      backgroundColor: theme.bg,
      borderRadius: '12px',
    },
    statsValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: theme.accent,
    },
    statsLabel: {
      fontSize: '12px',
      color: theme.textSecondary,
      marginTop: '5px',
    },
    progressBar: {
      height: '8px',
      backgroundColor: theme.border,
      borderRadius: '4px',
      marginTop: '10px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.accent,
      borderRadius: '4px',
      transition: 'width 0.3s',
    },
    modeSelector: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
    },
    modeBtn: {
      flex: 1,
      padding: '10px',
      border: `2px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: 'transparent',
      color: theme.text,
      cursor: 'pointer',
      fontSize: '14px',
    },
    modeBtnActive: {
      borderColor: theme.accent,
      backgroundColor: theme.accent,
      color: 'white',
    },
  };

  // ---------- 渲染 ----------
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>📚 English Learner</h1>
        <div style={styles.headerButtons}>
          <button 
            style={styles.iconBtn}
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button 
            style={styles.iconBtn}
            onClick={() => { setShowStats(!showStats); setShowQuiz(false); }}
            title="Statistics"
          >
            📊
          </button>
        </div>
      </header>

      {/* 統計面板 */}
      {showStats && (
        <div style={styles.statsCard}>
          <h2 style={{textAlign: 'center', marginBottom: '20px'}}>📈 學習統計</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statsItem}>
              <div style={styles.statsValue}>{progress.totalLearned}</div>
              <div style={styles.statsLabel}>總學習次數</div>
            </div>
            <div style={styles.statsItem}>
              <div style={styles.statsValue}>{progress.streak} 🔥</div>
              <div style={styles.statsLabel}>連續天數</div>
            </div>
            <div style={styles.statsItem}>
              <div style={styles.statsValue}>{progress.totalDays}</div>
              <div style={styles.statsLabel}>學習天數</div>
            </div>
            <div style={styles.statsItem}>
              <div style={styles.statsValue}>
                {progress.quizTotal > 0 
                  ? Math.round((progress.quizCorrect / progress.quizTotal) * 100) 
                  : 0}%
              </div>
              <div style={styles.statsLabel}>測驗正確率</div>
            </div>
          </div>
          <div style={{marginTop: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
              <span>收藏進度</span>
              <span>{favorites.length} / {sentences.length}</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${(favorites.length / sentences.length) * 100}%`}} />
            </div>
          </div>
        </div>
      )}

      <nav style={styles.nav}>
        <button 
          style={showQuiz ? styles.activeTab : (showFavorites ? styles.activeTab : styles.tab)}
          onClick={() => { setShowFavorites(!showFavorites); setShowStats(false); setShowQuiz(false); setCurrentIndex(0); }}
        >
          {showFavorites ? '⭐ Favorites' : '❤️ My Favorites'}
        </button>
        <button 
          style={showQuiz ? styles.activeTab : styles.tab}
          onClick={() => { setShowQuiz(!showQuiz); setShowStats(false); if (!showQuiz) startQuiz(); }}
        >
          📝 Quiz
        </button>
        {!showFavorites && !showQuiz && categories.map(cat => (
          <button
            key={cat}
            style={category === cat ? styles.activeTab : styles.tab}
            onClick={() => { setCategory(cat); setCurrentIndex(0); setShowStats(false); }}
          >
            {cat === 'all' ? '📋 All' : cat === 'greeting' ? '👋 Greeting' : 
             cat === 'daily' ? '💬 Daily' : cat === 'work' ? '💼 Work' : 
             cat === 'tech' ? '🔧 Tech' : '🤝 Business'}
          </button>
        ))}
      </nav>

      {/* 學習卡片 */}
      {!showQuiz && (filteredSentences.length === 0 ? (
        <div style={styles.empty}>
          <p>No favorites yet! ❤️ Click heart to add.</p>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.category}>{current.category}</span>
            <button 
              style={styles.fav}
              onClick={() => toggleFavorite(current.id)}
            >
              {favorites.includes(current.id) ? '❤️' : '🤍'}
            </button>
          </div>
          
          <div style={styles.english}>
            <h2 style={styles.englishText}>{current.en}</h2>
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
      ))}

      {/* 測驗模式 */}
      {showQuiz && !showStats && (
        <div style={styles.quizOverlay}>
          <button style={styles.quizCloseBtn} onClick={closeQuiz}>✕</button>
          <div style={styles.quizCard}>
            <h2 style={styles.quizTitle}>📝 測驗模式</h2>
            
            <div style={styles.modeSelector}>
              <button 
                style={quizMode === 'choice' ? {...styles.modeBtn, ...styles.modeBtnActive} : styles.modeBtn}
                onClick={() => setQuizMode('choice')}
              >
                選擇題
              </button>
              <button 
                style={quizMode === 'fill' ? {...styles.modeBtn, ...styles.modeBtnActive} : styles.modeBtn}
                onClick={() => setQuizMode('fill')}
              >
                填空題
              </button>
            </div>

            {quizSentence && !quizResult && (
              <>
                <p style={styles.quizQuestion}>
                   "{quizSentence.en}"<br/>
                  <span style={{fontSize: '16px', color: theme.textSecondary}}>
                    請翻譯成中文
                  </span>
                </p>

                {quizMode === 'choice' ? (
                  <div style={styles.quizOptions}>
                    {quizOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        style={userAnswer === opt ? {...styles.quizOption, ...styles.quizOptionSelected} : styles.quizOption}
                        onClick={() => setUserAnswer(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    style={styles.quizInput}
                    placeholder="輸入中文翻譯..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                  />
                )}

                <div style={styles.controls}>
                  <button 
                    style={{...styles.btn, opacity: userAnswer ? 1 : 0.5}} 
                    onClick={submitAnswer}
                    disabled={!userAnswer}
                  >
                    提交答案
                  </button>
                  <button style={styles.btn} onClick={startQuiz}>
                    下一題
                  </button>
                </div>
              </>
            )}

            {quizResult !== null && quizSentence && (
              <div style={styles.quizResult}>
                <div style={quizResult ? styles.quizResultCorrect : styles.quizResultWrong}>
                  {quizResult ? '✅ 答對了！' : '❌ 答錯了！'}
                </div>
                <p style={{fontSize: '18px', marginTop: '15px'}}>
                  {quizSentence.en}<br/>
                  <strong>{quizSentence.zh}</strong>
                </p>
                <button style={{...styles.btn, marginTop: '20px'}} onClick={startQuiz}>
                  下一題
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <p>200 Sentences for English Learning</p>
      </footer>
    </div>
  );
}

export default App;
