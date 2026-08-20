import React, { useState, useEffect } from 'react';

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
    container: { maxWidth: '800px', margin: '0 auto', padding: '20px', backgroundColor: theme.bg, minHeight: '100vh', color: theme.text },
    header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
    backBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    title: { fontSize: '18px', fontWeight: 'bold' },
    videoWrapper: { position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', marginBottom: '20px' },
    video: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
    controls: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    controlBtn: { padding: '10px 16px', borderRadius: '8px', border: '1px solid ' + theme.border, backgroundColor: theme.cardBg, color: theme.text, cursor: 'pointer', fontSize: '14px' },
    activeBtn: { backgroundColor: theme.accent, color: 'white', borderColor: theme.accent },
    subtitleBox: { backgroundColor: theme.cardBg, borderRadius: '12px', padding: '20px', marginBottom: '20px' },
    subtitleEn: { fontSize: '20px', marginBottom: '10px', lineHeight: '1.6' },
    subtitleZh: { fontSize: '16px', color: theme.text + '99' },
    subtitleList: { maxHeight: '300px', overflowY: 'auto' },
    subtitleItem: { padding: '12px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' },
    hint: { fontSize: '12px', color: theme.text + '80', marginTop: '10px', textAlign: 'center' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div style={styles.title}>{title || 'YouTube 影片學習'}</div>
      </div>

      <div style={styles.videoWrapper}>
        <iframe 
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          style={styles.video}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        ></iframe>
      </div>

      <div style={styles.controls}>
        <button 
          style={{...styles.controlBtn, ...(showSubtitles ? styles.activeBtn : {})}}
          onClick={() => setShowSubtitles(!showSubtitles)}
        >
          📝 {showSubtitles ? '隱藏字幕' : '顯示字幕'}
        </button>
        <button 
          style={styles.controlBtn}
          onClick={openInYouTube}
        >
          🔗 YouTube 開啟
        </button>
      </div>

      {showSubtitles && (
        <div style={styles.subtitleBox}>
          <div style={{textAlign: 'center', marginBottom: '15px', padding: '10px', backgroundColor: theme.bg, borderRadius: '8px'}}>
            <div style={{fontSize: '14px', color: theme.text + '80'}}>
              💡 對照字幕練習聽力
            </div>
          </div>

          <div style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '10px'}}>📋 字幕列表</div>
          <div style={styles.subtitleList}>
            {subtitles.map((sub, idx) => (
              <div 
                key={idx}
                style={styles.subtitleItem}
                onClick={() => speak(sub.en)}
              >
                <div style={{fontSize: '12px', color: theme.accent, marginBottom: '4px'}}>
                  {Math.floor(sub.start / 60)}:{String(Math.floor(sub.start % 60)).padStart(2, '0')}
                </div>
                <div style={{fontSize: '14px', marginBottom: '2px'}}>🔊 {sub.en}</div>
                <div style={{fontSize: '12px', color: theme.text + '80'}}>{sub.zh}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.hint}>
        💡 點擊字幕可朗讀，在 YouTube 開啟可看更多功能
      </div>
    </div>
  );
}

export default YouTubePlayer;
