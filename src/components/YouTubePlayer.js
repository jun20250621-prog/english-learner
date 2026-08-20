import React, { useState } from 'react';

export function YouTubePlayer({ videoId, title, onBack, darkMode }) {
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitles] = useState([
    { start: 0, end: 5, en: 'Welcome to this English lesson.', zh: '歡迎來到這堂英文課。' },
    { start: 5, end: 10, en: 'Today we will learn about daily conversations.', zh: '今天我們將學習日常對話。' },
    { start: 10, end: 15, en: 'Let us start with greeting people.', zh: '讓我們從打招呼開始。' },
    { start: 15, end: 20, en: 'Good morning. How are you today?', zh: '早安！今天好嗎？' },
    { start: 20, end: 25, en: 'I am doing great, thank you.', zh: '我很好，謝謝！' },
    { start: 25, end: 30, en: 'Nice to meet you.', zh: '很高興認識你！' },
    { start: 30, end: 35, en: 'Where are you from?', zh: '你來自哪裡？' },
    { start: 35, end: 40, en: 'I am from Taiwan.', zh: '我來自台灣。' },
    { start: 40, end: 45, en: 'That is interesting. I love Taiwan.', zh: '真有趣！我喜歡台灣。' },
    { start: 45, end: 50, en: 'Do you speak Chinese?', zh: '你會說中文嗎？' },
    { start: 50, end: 55, en: 'Yes, I speak Mandarin and Taiwanese.', zh: '是的，我會說國語和台語。' },
    { start: 55, end: 60, en: 'That is amazing. Can you teach me?', zh: '太棒了！你能教我嗎？' },
  ]);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', accent: '#4CAF50', border: '#444' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', accent: '#2196F3', border: '#ddd' };

  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.8;
    speechSynthesis.speak(u);
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: theme.bg, minHeight: '100vh', color: theme.text },
    header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
    backBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    title: { fontSize: '18px', fontWeight: 'bold' },
    videoCard: { backgroundColor: theme.cardBg, borderRadius: '16px', padding: '30px', marginBottom: '20px', textAlign: 'center' },
    videoEmoji: { fontSize: '60px', marginBottom: '15px' },
    playBtn: { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '15px 30px', borderRadius: '30px', border: 'none', backgroundColor: '#FF0000', color: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none' },
    subtitleBox: { backgroundColor: theme.cardBg, borderRadius: '12px', padding: '20px' },
    subtitleItem: { padding: '12px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', borderBottom: '1px solid ' + theme.border },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div style={styles.title}>{title || 'YouTube 影片學習'}</div>
      </div>

      <div style={styles.videoCard}>
        <div style={styles.videoEmoji}>📺</div>
        <button style={styles.playBtn} onClick={openInYouTube}>
          ▶️ 在 YouTube 觀看影片
        </button>
      </div>

      <div style={styles.subtitleBox}>
        <div style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '15px'}}>
          📝 字幕練習
        </div>
        <div style={{fontSize: '14px', color: theme.text + '80', marginBottom: '15px'}}>
          💡 點擊句子可朗讀，對照影片練習聽力
        </div>
        
        {subtitles.map((sub, idx) => (
          <div 
            key={idx}
            style={styles.subtitleItem}
            onClick={() => speak(sub.en)}
          >
            <div style={{fontSize: '12px', color: theme.accent, marginBottom: '4px'}}>
              {Math.floor(sub.start / 60)}:{String(Math.floor(sub.start % 60)).padStart(2, '0')}
            </div>
            <div style={{fontSize: '15px', marginBottom: '2px'}}>🔊 {sub.en}</div>
            <div style={{fontSize: '13px', color: theme.text + '80'}}>{sub.zh}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default YouTubePlayer;
