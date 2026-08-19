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
  
  // 檢測內容類型
  const isNews = type === 'news';
  const isOral = type === 'oral';
  const isExam = type === 'exams';
  
  // 不同類型使用不同的數據結構
  const segments = isNews ? content.segments : content.sentences || content.categories || content.sections || content.rules || [];
  const current = segments[index];
  const isWordList = isNews && current && current.title === '預考單字';

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
      let enText = '';
      if (isNews) {
        enText = current.sentences?.map(s => s.en).join(' ');
      } else if (isOral) {
        // 口語內容：嘗試獲取 example 欄位
        enText = current.example || current.words || '';
      } else if (isExam) {
        enText = current.question || current.dialogue || '';
      } else {
        enText = current.en;
      }
      if (enText) {
        setTimeout(() => speak(enText), 300);
      }
    }
  }, [index, autoPlay, current, isWordList, isNews, isOral, isExam, speak]);

  // 獲取圖片
  useEffect(() => {
    if (!current || isWordList || isOral || isExam) {
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
  }, [current, content, darkMode, isWordList, isOral, isExam, showImage]);

  // 自動播放邏輯
  useEffect(() => {
    if (!autoPlay || !current || isWordList || isOral || isExam) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    
    let enText = '';
    if (isNews) {
      enText = current.sentences?.map(s => s.en).join(' ');
    } else {
      enText = current.en;
    }
    
    const steps = [
      { delay: 500, action: () => speak(enText) },
      { delay: 3500, action: () => setShowTranslation(true) },
      { delay: 6000, action: () => setShowTranslation(false) },
      { delay: 7000, action: () => speak(enText) }
    ];

    steps.forEach(step => {
      timerRef.current = setTimeout(step.action, step.delay);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlay, current, isWordList, isNews, isOral, isExam, speak]);

  const theme = darkMode 
    ? { bg: '#121212', cardBg: '#1e1e1e', text: '#e0e0e0', textSecondary: '#aaa', accent: '#4CAF50', accentBg: '#1b5e20', button: '#2196F3', border: '#333' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', textSecondary: '#666', accent: '#4CAF50', accentBg: '#e8f5e9', button: '#2196F3', border: '#ddd' };

  // 渲染口語練習內容
  const renderOralContent = () => {
    if (!content.categories) return null;
    
    const category = content.categories[index];
    if (!category) return null;
    
    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: theme.text, marginBottom: '20px', fontSize: '20px' }}>
          📚 {category.name}
        </h3>
        
        {category.items && category.items.map((item, idx) => (
          <div key={idx} style={{ 
            backgroundColor: theme.cardBg, 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '15px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ 
                backgroundColor: theme.accent, 
                color: 'white', 
                padding: '4px 12px', 
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {item.spoken}
              </span>
              <span style={{ color: theme.textSecondary, fontSize: '14px' }}>
                {item.pronunciation}
              </span>
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: theme.textSecondary, fontSize: '12px' }}>完整形式: </span>
              <span style={{ color: theme.accent, fontWeight: 'bold' }}>{item.full}</span>
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <div style={{ color: theme.text, fontSize: '16px', marginBottom: '5px' }}>
                "{item.example}"
              </div>
              <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
                {item.exampleZh}
              </div>
            </div>
            
            <button 
              onClick={() => speak(item.example)}
              style={{
                backgroundColor: theme.accent,
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔊 播放
            </button>
          </div>
        ))}
      </div>
    );
  };

  // 渲染連音練習內容
  const renderConnectedSpeechContent = () => {
    if (!content.rules) return null;
    
    const rule = content.rules[index];
    if (!rule) return null;
    
    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: theme.text, marginBottom: '10px', fontSize: '20px' }}>
          🔗 {rule.name}
        </h3>
        
        <p style={{ color: theme.textSecondary, marginBottom: '20px' }}>
          {rule.description}
        </p>
        
        {rule.examples && rule.examples.map((ex, idx) => (
          <div key={idx} style={{ 
            backgroundColor: theme.cardBg, 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '15px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span style={{ 
                backgroundColor: theme.button, 
                color: 'white', 
                padding: '4px 12px', 
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                {ex.words}
              </span>
              <span style={{ color: theme.accent, fontSize: '14px' }}>
                → {ex.pronunciation}
              </span>
            </div>
            <div style={{ color: theme.text, fontSize: '16px', marginBottom: '5px' }}>
              "{ex.example}"
            </div>
            <div style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '10px' }}>
              {ex.exampleZh}
            </div>
            <button 
              onClick={() => speak(ex.example)}
              style={{
                backgroundColor: theme.accent,
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔊 播放
            </button>
          </div>
        ))}
      </div>
    );
  };

  // 渲染情境對話內容
  const renderScenariosContent = () => {
    if (!content.scenarios) return null;
    
    const scenario = content.scenarios[index];
    if (!scenario) return null;
    
    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: theme.text, marginBottom: '20px', fontSize: '20px' }}>
          {scenario.icon} {scenario.name}
        </h3>
        
        {scenario.dialogues && scenario.dialogues.map((dialogue, idx) => (
          <div key={idx} style={{ 
            backgroundColor: theme.cardBg, 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '12px',
            border: `1px solid ${theme.border}`,
            borderLeft: dialogue.role === 'customer' || dialogue.role === 'personA' || dialogue.role === 'caller' || dialogue.role === 'tourist'
              ? `4px solid ${theme.button}` 
              : `4px solid ${theme.accent}`
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: theme.textSecondary, 
              marginBottom: '5px',
              textTransform: 'uppercase'
            }}>
              {dialogue.role === 'customer' || dialogue.role === 'personA' || dialogue.role === 'caller' || dialogue.role === 'tourist' ? '👤 你' : '👨‍💼 對方'}
            </div>
            <div style={{ color: theme.text, fontSize: '16px', marginBottom: '5px' }}>
              {dialogue.text}
            </div>
            <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
              {dialogue.textZh}
            </div>
            <button 
              onClick={() => speak(dialogue.text)}
              style={{
                marginTop: '8px',
                backgroundColor: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '15px',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                color: theme.textSecondary
              }}
            >
              🔊 播放
            </button>
          </div>
        ))}
        
        {scenario.keyPhrases && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: theme.text, marginBottom: '10px' }}>📝 關鍵句型</h4>
            {scenario.keyPhrases.map((phrase, idx) => (
              <div 
                key={idx}
                onClick={() => speak(phrase)}
                style={{ 
                  color: theme.accent, 
                  padding: '8px 12px',
                  backgroundColor: theme.accentBg,
                  borderRadius: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔊 {phrase}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 判斷要渲染哪種內容
  const renderContent = () => {
    if (isOral) {
      // 根據 ID 判斷具體類型
      if (content.id === 'contractions' || content.categories) {
        return renderOralContent();
      } else if (content.rules) {
        return renderConnectedSpeechContent();
      } else if (content.scenarios) {
        return renderScenariosContent();
      }
    }
    return null;
  };

  // 如果是口語/考試內容，使用自定義渲染
  if (isOral || isExam) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '20px', 
        backgroundColor: theme.bg, 
        minHeight: '100vh',
        color: theme.text 
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={onBack} 
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text }}
          >
            ←
          </button>
          <h2 style={{ margin: 0, fontSize: '16px' }}>
            {content.image} {content.title}
          </h2>
          <div style={{ width: '24px' }}></div>
        </div>

        {renderContent()}

        <div style={{ 
          textAlign: 'center', 
          color: theme.textSecondary, 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: theme.cardBg,
          borderRadius: '12px'
        }}>
          {index + 1} / {segments.length}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
          <button 
            onClick={() => setIndex(Math.max(0, index - 1))} 
            style={{ 
              padding: '12px 24px', 
              backgroundColor: theme.button, 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontSize: '16px' 
            }}
          >
            ← 上一個
          </button>
          <button 
            onClick={() => setIndex(Math.min(segments.length - 1, index + 1))} 
            style={{ 
              padding: '12px 24px', 
              backgroundColor: theme.button, 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontSize: '16px' 
            }}
          >
            下一個 →
          </button>
        </div>
      </div>
    );
  }

  // 原有邏輯（新聞等）
  if (!current) return <div style={{ padding: '20px', textAlign: 'center' }}>載入中...</div>;

  const enText = isNews 
    ? (current.sentences?.map(s => s.en).join(' ')) 
    : current.en;
    
  const zhText = isNews 
    ? (current.sentences?.map(s => s.zh).join(' ')) 
    : current.zh;

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '20px', 
      backgroundColor: theme.bg, 
      minHeight: '100vh',
      color: theme.text 
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={onBack} 
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: '16px' }}>
          {content.image} {content.title}
        </h2>
        <button 
          onClick={() => setShowImage(!showImage)} 
          style={{ 
            background: showImage ? theme.accent : theme.cardBg, 
            border: `1px solid ${theme.border}`, 
            borderRadius: '20px', 
            padding: '8px 16px', 
            cursor: 'pointer', 
            color: showImage ? 'white' : theme.text, 
            fontSize: '14px' 
          }}
        >
          🖼️ {showImage ? '隱藏' : '圖片'}
        </button>
      </div>

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
            {isNews ? (isWordList ? '📖 預習單字' : `句子 ${index + 1} / ${segments.length}`) : `句子 ${index + 1} / ${segments.length}`}
          </span>
        </div>

        {isWordList ? (
          <div>
            {current.words && current.words.map((word, idx) => (
              <button 
                key={idx}
                onClick={() => speak(word.en)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '15px', 
                  marginBottom: '10px', 
                  borderRadius: '12px', 
                  border: `1px solid ${theme.border}`, 
                  backgroundColor: theme.bg, 
                  color: theme.text, 
                  cursor: 'pointer', 
                  textAlign: 'left' 
                }}
              >
                <span style={{ fontSize: '18px', marginRight: '10px' }}>💡</span>
                <strong>{word.en}</strong>
                {word.zh && <span style={{ color: theme.textSecondary }}> = {word.zh}</span>}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div style={{ fontSize: '20px', lineHeight: '1.8', marginBottom: '20px', wordBreak: 'break-word' }}>
              {isNews ? (
                current.sentences && current.sentences.map((sentence, idx) => (
                  <div key={idx} style={{ marginBottom: '15px', padding: '12px', backgroundColor: theme.bg, borderRadius: '8px' }}>
                    <div style={{ marginBottom: '8px' }}>{sentence.en}</div>
                    <button 
                      onClick={() => speak(sentence.en)} 
                      style={{ 
                        backgroundColor: theme.accent, 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '15px', 
                        padding: '4px 10px', 
                        fontSize: '12px', 
                        cursor: 'pointer' 
                      }}
                    >
                      💡
                    </button>
                  </div>
                ))
              ) : (
                current.en && current.en.split(/(\s+)/).filter(Boolean).map((word, idx) => {
                  const isPunctuation = !/\S/.test(word) || /^[^\w\s]+$/.test(word.trim());
                  return isPunctuation ? (
                    <span key={idx}>{word}</span>
                  ) : (
                    <WordTooltip 
                      key={idx} 
                      word={word.trim()} 
                      darkMode={darkMode} 
                      onSpeak={(w) => {
                        speechSynthesis.cancel();
                        const t = new SpeechSynthesisUtterance(w);
                        t.lang = 'en-US';
                        t.rate = 0.5;
                        speechSynthesis.speak(t);
                      }} 
                    />
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
              <button 
                onClick={() => speak(enText)}
                style={{ 
                  padding: '12px 24px', 
                  border: 'none', 
                  borderRadius: '25px', 
                  backgroundColor: theme.accent, 
                  color: 'white', 
                  fontSize: '16px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold' 
                }}
              >
                🔊 朗讀
              </button>
            </div>

            <button 
              onClick={() => setShowTranslation(!showTranslation)} 
              style={{ 
                display: 'block', 
                margin: '0 auto 15px', 
                padding: '10px 20px', 
                backgroundColor: 'transparent', 
                border: `2px solid ${theme.border}`, 
                borderRadius: '25px', 
                color: theme.textSecondary, 
                cursor: 'pointer' 
              }}
            >
              {showTranslation ? '🙈 隱藏翻譯' : '👁️ 顯示翻譯'}
            </button>

            {showTranslation && (
              <div style={{ color: theme.textSecondary, fontSize: '18px', padding: '15px', backgroundColor: theme.bg, borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                {zhText}
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', color: theme.textSecondary, marginBottom: '15px' }}>
          {index + 1} / {segments.length}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setIndex(Math.max(0, index - 1)); setShowTranslation(false); }}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: theme.button, 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontSize: '16px' 
            }}
          >
            ← 上一句
          </button>
          <button 
            onClick={() => setAutoPlay(!autoPlay)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: autoPlay ? theme.accent : theme.cardBg, 
              border: `1px solid ${theme.border}`, 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontSize: '16px', 
              color: autoPlay ? 'white' : theme.text 
            }}
          >
            {autoPlay ? '⏹️ 停止' : '▶️ 自動朗讀'}
          </button>
          <button 
            onClick={() => { setIndex(Math.min(segments.length - 1, index + 1)); setShowTranslation(false); }}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: theme.button, 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontSize: '16px' 
            }}
          >
            下一句 →
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px', height: '8px', backgroundColor: theme.border, borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', backgroundColor: theme.accent, width: (index + 1) / segments.length * 100 + '%', transition: 'width 0.3s' }}></div>
      </div>
    </div>
  );
};

export default ContentPlayer;
