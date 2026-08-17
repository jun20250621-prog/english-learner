import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordTooltip } from './WordTooltip';
import { fetchImage, getFallbackImage } from '../utils/imageHelper';

export const ContentPlayer = ({ content, type, onBack, darkMode }) => {
  const [index, setIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const timerRef = useRef(null);
  const isNews = type === 'news';
  const segments = isNews ? content.segments : content.sentences;
  const current = segments[index];
  const isWordList = isNews && current && current.title === '預習單字';

  const speak = useCallback((text) => { 
    speechSynthesis.cancel(); 
    const u = new SpeechSynthesisUtterance(text); 
    u.lang = 'en-US'; 
    u.rate = 0.7; 
    speechSynthesis.speak(u); 
  }, []);

  // 當前句子變化時自動朗讀
  useEffect(() => {
    if (autoPlay && current && !isWordList) {
      const enText = isNews ? (current.sentences?.map(s => s.en).join(' ')) : current.en;
      if (enText) {
        setTimeout(() => speak(enText), 300);
      }
    }
  }, [index, autoPlay, current, isWordList, isNews, speak]);

  // 獲取圖片
  useEffect(() => {
    if (!current || isWordList) {
      setImageUrl(null);
      return;
    }

    const loadImage = async () => {
      if (!showImage) return;
      
      setImageLoading(true);
      
      const keywords = content.keywords || current.keywords || [];
      
      if (keywords.length > 0) {
        const url = await fetchImage(keywords, darkMode);
        setImageUrl(url || getFallbackImage(keywords[0]));
      } else {
        const words = current.en?.split(' ').slice(0, 3) || [];
        const url = await fetchImage(words, darkMode);
        setImageUrl(url || getFallbackImage('default'));
      }
      
      setImageLoading(false);
    };

    if (showImage) {
      loadImage();
    } else {
      setImageUrl(null);
    }
  }, [current, content, darkMode, isWordList, showImage]);

  // 自動播放邏輯（不自動切換，只朗讀）
  useEffect(() => {
    if (!autoPlay || !current || isWordList) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    
    const enText = isNews ? (current.sentences?.map(s => s.en).join(' ')) : current.en;
    
    // 流程：朗讀 → 停 → 顯示翻譯 → 停 → 重複朗讀（不切換）
    const steps = [
      { delay: 500, action: () => speak(enText) },
      { delay: 3500, action: () => setShowTranslation(true) },
      { delay: 6000, action: () => setShowTranslation(false) },
      { delay: 7000, action: () => speak(enText) }, // 再次朗讀
    ];

    steps.forEach(step => { 
      timerRef.current = setTimeout(step.action, step.delay); 
    });
    
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [autoPlay, index, current, isWordList, speak, isNews]);

  const theme = darkMode ? 
    { bg: '#121212', cardBg: '#1e1e1e', text: '#e0e0e0', textSecondary: '#aaa', accent: '#4CAF50', accentBg: '#1b5e20', button: '#2196F3', border: '#333' } : 
    { bg: '#f5f5f5', cardBg: 'white', text: '#333', textSecondary: '#666', accent: '#4CAF50', accentBg: '#e8f5e9', button: '#2196F3', border: '#ddd' };

  const renderWords = (text) => text.split(/(\s+)/).filter(Boolean).map((word, idx) => 
    (word.trim() === '' || /^[^\w\s]+$/.test(word.trim())) ? 
      <span key={idx}>{word}</span> : 
      <WordTooltip key={idx} word={word.trim()} darkMode={darkMode} onSpeak={(w) => { 
        speechSynthesis.cancel(); 
        const u = new SpeechSynthesisUtterance(w); 
        u.lang = 'en-US'; 
        u.rate = 0.5; 
        speechSynthesis.speak(u); 
      }} />
  );

  if (!current) return <div style={{ padding: '20px', textAlign: 'center' }}>載入中...</div>;

  const enText = isNews ? (isWordList ? '' : current.sentences?.map(s => s.en).join(' ')) : current.en;
  const zhText = isNews ? (isWordList ? '' : current.sentences?.map(s => s.zh).join(' ')) : current.zh;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: theme.bg, minHeight: '100vh', color: theme.text }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text }}>←</button>
        <h2 style={{ margin: 0, fontSize: '16px' }}>{content.image || '📰'} {content.title}</h2>
        <button onClick={() => setShowImage(!showImage)} style={{ background: showImage ? theme.accent : theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '20px', padding: '8px 16px', cursor: 'pointer', color: showImage ? 'white' : theme.text, fontSize: '14px' }}>
          🖼️ {showImage ? '隱藏' : '圖片'}
        </button>
      </div>

      {/* 圖片顯示區域 */}
      {showImage && !isWordList && (
        <div style={{ marginBottom: '20px', borderRadius: '16px', overflow: 'hidden', animation: 'slideUp 0.5s ease' }}>
          {imageLoading ? (
            <div style={{ height: '200px', backgroundColor: theme.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
              <span style={{ color: theme.textSecondary }}>載入圖片中...</span>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Learning" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '16px' }} />
          ) : null}
        </div>
      )}

      <div style={{ backgroundColor: theme.cardBg, borderRadius: '16px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <span style={{ backgroundColor: theme.accentBg, color: theme.accent, padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>
            {isNews ? (isWordList ? '📖 預習單字' : current.title) : `句子 ${index + 1} / ${segments.length}`}
          </span>
        </div>

        {isWordList ? (
          <div>
            {current.words && current.words.map((w, i) => (
              <button key={i} onClick={() => speak(w.en)} style={{ display: 'block', width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '12px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: '18px', marginRight: '10px' }}>🔊</span><strong>{w.en}</strong> = {w.zh}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div style={{ fontSize: '20px', lineHeight: '1.8', marginBottom: '20px', wordBreak: 'break-word' }}>
              {!isNews ? renderWords(current.en) : current.sentences && current.sentences.map((s, i) => (
                <div key={i} style={{ marginBottom: '15px', padding: '12px', backgroundColor: theme.bg, borderRadius: '8px' }}>
                  <div style={{ marginBottom: '8px' }}>{s.en}</div>
                  <button onClick={() => speak(s.en)} style={{ backgroundColor: theme.accent, color: 'white', border: 'none', borderRadius: '15px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>🔊</button>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
              <button onClick={() => speak(enText)} style={{ padding: '12px 24px', border: 'none', borderRadius: '25px', backgroundColor: theme.accent, color: 'white', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>🔊 朗讀</button>
            </div>
            
            <button onClick={() => setShowTranslation(!showTranslation)} style={{ display: 'block', margin: '0 auto 15px', padding: '10px 20px', backgroundColor: 'transparent', border: `2px solid ${theme.border}`, borderRadius: '25px', color: theme.textSecondary, cursor: 'pointer' }}>
              {showTranslation ? '🙈 隱藏翻譯' : '👁️ 顯示翻譯'}
            </button>
            
            {showTranslation && <div style={{ color: theme.textSecondary, fontSize: '18px', padding: '15px', backgroundColor: theme.bg, borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{zhText}</div>}
          </>
        )}

        <div style={{ textAlign: 'center', color: theme.textSecondary, marginBottom: '15px' }}>{index + 1} / {segments.length}</div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { setIndex(Math.max(0, index - 1)); setShowTranslation(false); }} style={{ padding: '12px 24px', backgroundColor: theme.button, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>◀️ 上一句</button>
          
          <button onClick={() => setAutoPlay(!autoPlay)} style={{ padding: '12px 24px', backgroundColor: autoPlay ? theme.accent : theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '16px', color: autoPlay ? 'white' : theme.text }}>
            {autoPlay ? '⏹️ 停止' : '▶️ 自動朗讀'}
          </button>
          
          <button onClick={() => { setIndex(Math.min(segments.length - 1, index + 1)); setShowTranslation(false); }} style={{ padding: '12px 24px', backgroundColor: theme.button, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>下一句 ▶️</button>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', height: '8px', backgroundColor: theme.border, borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', backgroundColor: theme.accent, width: `${((index + 1) / segments.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
};
