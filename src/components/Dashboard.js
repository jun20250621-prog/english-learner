import React from 'react';

const getToday = () => new Date().toISOString().split('T')[0];

export const Dashboard = ({ progress, darkMode, onClose }) => {
  const theme = darkMode ? { bg: '#1e1e1e', text: '#e0e0e0', accent: '#4CAF50', sub: '#aaa' } : { bg: 'white', text: '#333', accent: '#4CAF50', sub: '#666' };
  const today = getToday();
  const todayProgress = progress.dailyHistory[today] || 0;
  const goalPercent = Math.min(100, Math.round((todayProgress / progress.dailyGoal) * 100));
  const radius = 50; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goalPercent / 100) * circumference;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: theme.bg, borderRadius: '20px', padding: '30px', width: '90%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: theme.text }}>📊 學習儀表板</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text }}>✕</button>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r={radius} fill="none" stroke={darkMode ? '#333' : '#e0e0e0'} strokeWidth="12" />
            <circle cx="70" cy="70" r={radius} fill="none" stroke={theme.accent} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
          </svg>
          <div style={{ marginTop: '-80px', fontSize: '36px', fontWeight: 'bold', color: theme.accent }}>{goalPercent}%</div>
          <div style={{ color: theme.sub, fontSize: '14px' }}>今日目標 ({todayProgress}/{progress.dailyGoal})</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          <div style={{ backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: theme.accent }}>{progress.totalLearned}</div>
            <div style={{ fontSize: '12px', color: theme.sub }}>總學習次數</div>
          </div>
          <div style={{ backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: theme.accent }}>{progress.streak} 🔥</div>
            <div style={{ fontSize: '12px', color: theme.sub }}>連續天數</div>
          </div>
          <div style={{ backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: theme.accent }}>{progress.totalDays}</div>
            <div style={{ fontSize: '12px', color: theme.sub }}>學習天數</div>
          </div>
          <div style={{ backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: theme.accent }}>{progress.quizTotal > 0 ? Math.round((progress.quizCorrect / progress.quizTotal) * 100) : 0}%</div>
            <div style={{ fontSize: '12px', color: theme.sub }}>測驗正確率</div>
          </div>
        </div>
      </div>
    </div>
  );
};
