import React, { useState, useEffect } from 'react';

const getStoredData = (key, defaultValue) => { try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : defaultValue; } catch { return defaultValue; } };
const saveData = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export function WrongAnswerBook({ darkMode, onClose }) {
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, quiz, fill, dictation

  useEffect(() => {
    const stored = getStoredData('wrongAnswers', []);
    setWrongAnswers(stored);
  }, []);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', accent: '#f44336', border: '#444' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', accent: '#f44336', border: '#ddd' };

  const filteredAnswers = filter === 'all' 
    ? wrongAnswers 
    : wrongAnswers.filter(a => a.type === filter);

  const [showConfirm, setShowConfirm] = useState(false);

  const clearAll = () => {
    setShowConfirm(true);
  };

  const confirmClear = () => {
    setWrongAnswers([]);
    saveData('wrongAnswers', []);
    setShowConfirm(false);
  };

  const removeItem = (id) => {
    const updated = wrongAnswers.filter(a => a.id !== id);
    setWrongAnswers(updated);
    saveData('wrongAnswers', updated);
  };

  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.7;
    speechSynthesis.speak(u);
  };

  const getTypeLabel = (type) => {
    const labels = {
      quiz: '📝 測驗',
      fill: '✏️ 填空',
      dictation: '🎧 聽寫'
    };
    return labels[type] || '📝';
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    container: { backgroundColor: theme.cardBg, borderRadius: '16px', width: '90%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
    header: { padding: '15px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '18px', fontWeight: 'bold', color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    filterBar: { padding: '10px 15px', display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: `1px solid ${theme.border}` },
    filterBtn: { padding: '6px 12px', borderRadius: '20px', border: 'none', backgroundColor: theme.bg, color: theme.text, cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' },
    activeFilter: { backgroundColor: theme.accent, color: 'white' },
    list: { flex: 1, overflowY: 'auto', padding: '15px' },
    empty: { textAlign: 'center', padding: '40px', color: theme.text + '80' },
    item: { backgroundColor: theme.bg, borderRadius: '12px', padding: '15px', marginBottom: '12px', borderLeft: `3px solid ${theme.accent}` },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    typeTag: { fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: theme.accent + '20', color: theme.accent },
    date: { fontSize: '11px', color: theme.text + '80' },
    sentence: { fontSize: '16px', marginBottom: '8px', color: theme.text },
    answer: { fontSize: '14px', color: theme.accent, marginBottom: '4px' },
    correct: { fontSize: '14px', color: '#4CAF50' },
    actions: { display: 'flex', gap: '8px', marginTop: '10px' },
    actionBtn: { padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: theme.cardBg, color: theme.text, cursor: 'pointer', fontSize: '12px' },
    footer: { padding: '15px', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    clearBtn: { padding: '10px 20px', borderRadius: '8px', border: `1px solid ${theme.accent}`, backgroundColor: 'transparent', color: theme.accent, cursor: 'pointer' },
    count: { fontSize: '14px', color: theme.text + '80' }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>📕 錯題本</div>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.filterBar}>
          {['all', 'quiz', 'fill', 'dictation'].map(f => (
            <button 
              key={f}
              style={{...styles.filterBtn, ...(filter === f ? styles.activeFilter : {})}}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '全部' : f === 'quiz' ? '測驗' : f === 'fill' ? '填空' : '聽寫'}
            </button>
          ))}
        </div>

        <div style={styles.list}>
          {filteredAnswers.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
              <div>太棒了！沒有錯題</div>
              <div style={{ fontSize: '12px', marginTop: '5px' }}>保持這個勢頭！</div>
            </div>
          ) : (
            filteredAnswers.map((item, idx) => (
              <div key={item.id || idx} style={styles.item}>
                <div style={styles.itemHeader}>
                  <span style={styles.typeTag}>{getTypeLabel(item.type)}</span>
                  <span style={styles.date}>{item.date}</span>
                </div>
                <div style={styles.sentence}>{item.en}</div>
                <div style={styles.answer}>❌ 你的答案: {item.userAnswer}</div>
                <div style={styles.correct}>✅ 正確答案: {item.correctAnswer}</div>
                <div style={styles.actions}>
                  <button style={styles.actionBtn} onClick={() => speak(item.en)}>🔊 朗讀</button>
                  <button style={styles.actionBtn} onClick={() => removeItem(item.id)}>✓ 移除</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.footer}>
          <span style={styles.count}>共 {filteredAnswers.length} 題</span>
          <button style={styles.clearBtn} onClick={clearAll}>清空全部</button>
        </div>
      </div>
    </div>
  );
}

// Helper function to add wrong answer (call this from quiz/fill/dictation)
export function addWrongAnswer(data) {
  const wrongAnswers = getStoredData('wrongAnswers', []);
  const newWrong = {
    id: Date.now(),
    type: data.type || 'quiz',
    en: data.en,
    zh: data.zh,
    userAnswer: data.userAnswer,
    correctAnswer: data.correctAnswer,
    date: new Date().toLocaleDateString('zh-TW')
  };
  wrongAnswers.unshift(newWrong);
  saveData('wrongAnswers', wrongAnswers.slice(0, 100)); // Keep max 100
}

export default WrongAnswerBook;
