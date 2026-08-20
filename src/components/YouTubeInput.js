import React, { useState } from 'react';

export function YouTubeInput({ darkMode, onClose }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', accent: '#4CAF50', border: '#444' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', accent: '#2196F3', border: '#ddd' };

  const extractVideoId = (url) => {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\s?]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSubmit = () => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('請輸入正確的 YouTube 連結');
      return;
    }
    setError('');
    // Open the video in new tab
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const quickLinks = [
    { name: 'Learn English Daily', url: 'https://www.youtube.com/@LearnEnglishDailyStories', desc: '頻道首頁' },
    { name: 'ESL 課程', url: 'https://www.youtube.com/results?search_query=ESL+English+lesson', desc: '搜尋結果' },
    { name: '商業英文', url: 'https://www.youtube.com/results?search_query=business+English+conversation', desc: '搜尋結果' },
  ];

  const styles = {
    container: { maxWidth: '500px', margin: '0 auto', padding: '20px', backgroundColor: theme.bg, minHeight: '100vh', color: theme.text },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    card: { backgroundColor: theme.cardBg, borderRadius: '12px', padding: '20px', marginBottom: '15px' },
    label: { fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'block' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid ' + theme.border, backgroundColor: theme.bg, color: theme.text, fontSize: '14px', boxSizing: 'border-box' },
    error: { color: '#f44336', fontSize: '12px', marginTop: '8px' },
    btn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', marginTop: '15px' },
    hint: { fontSize: '12px', color: theme.text + '80', marginTop: '10px', textAlign: 'center' },
    quickTitle: { fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' },
    quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' },
    quickBtn: { padding: '12px', borderRadius: '8px', border: '1px solid ' + theme.border, backgroundColor: theme.bg, color: theme.text, cursor: 'pointer', fontSize: '13px', textAlign: 'center' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🎬 YouTube 影片學習</div>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      <div style={styles.card}>
        <label style={styles.label}>輸入 YouTube 連結</label>
        <input 
          style={styles.input}
          placeholder="https://youtu.be/xxx 或 https://youtube.com/watch?v=xxx"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        {error && <div style={styles.error}>{error}</div>}
        <button style={styles.btn} onClick={handleSubmit}>
          ▶️ 前往觀看
        </button>
        <div style={styles.hint}>
          💡 支援多種格式：youtu.be/xxx 或 youtube.com/watch?v=xxx
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.quickTitle}>或前往 YouTube 搜尋</div>
        <div style={styles.quickGrid}>
          {quickLinks.map((link, idx) => (
            <button 
              key={idx}
              style={styles.quickBtn}
              onClick={() => window.open(link.url, '_blank')}
            >
              <div>▶️ {link.name}</div>
              <div style={{fontSize: '10px', opacity: 0.7}}>{link.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <div style={{fontSize: '13px', color: theme.text + '80'}}>
          <b>使用說明：</b><br/>
          1. 貼上 YouTube 影片連結<br/>
          2. 點擊「前往觀看」<br/>
          3. 在 YouTube 練習聽力
        </div>
      </div>
    </div>
  );
}

export default YouTubeInput;
