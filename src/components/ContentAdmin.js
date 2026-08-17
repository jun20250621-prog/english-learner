import React, { useState } from 'react';

export const ContentAdmin = ({ darkMode, onClose }) => {
  const [formData, setFormData] = useState({
    english: '',
    chinese: '',
    category: 'daily',
    level: 'A1',
    keywords: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [saved, setSaved] = useState(false);

  const theme = darkMode ? 
    { bg: '#1e1e1e', cardBg: '#2a2a2a', text: '#e0e0e0', sub: '#aaa', accent: '#4CAF50', border: '#444' } : 
    { bg: '#f5f5f5', cardBg: 'white', text: '#333', sub: '#666', accent: '#4CAF50', border: '#ddd' };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 模擬從 Unsplash 獲取圖片
  const fetchPreviewImage = async () => {
    if (!formData.keywords) return;
    
    const keywords = formData.keywords.split(',').map(k => k.trim()).filter(Boolean);
    if (keywords.length === 0) return;

    // 模擬 API 調用（實際需要 Unsplash API Key）
    const mockImages = {
      'cat,dog': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
      'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      'nature': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400',
      'city': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
      'people': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
    };

    const key = Object.keys(mockImages).find(k => 
      keywords.some(w => w.toLowerCase().includes(k))
    );
    
    setPreviewImage(key ? mockImages[key] : mockImages['nature']);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newSentence = {
      id: Date.now(),
      en: formData.english,
      zh: formData.chinese,
      category: formData.category,
      level: formData.level,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      imageUrl: previewImage
    };

    // 儲存到 localStorage（實際應該儲存到後端數據庫）
    const existingData = JSON.parse(localStorage.getItem('customSentences') || '[]');
    existingData.push(newSentence);
    localStorage.setItem('customSentences', JSON.stringify(existingData));

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setFormData({
        english: '',
        chinese: '',
        category: 'daily',
        level: 'A1',
        keywords: ''
      });
      setPreviewImage(null);
    }, 2000);
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', overflow: 'auto'
    }}>
      <div style={{ 
        backgroundColor: theme.cardBg, borderRadius: '20px', 
        padding: '30px', width: '100%', maxWidth: '500px',
        maxHeight: '90vh', overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: theme.text }}>➕ 新增句子</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: theme.text, fontSize: '14px' }}>英文句子 *</label>
            <input
              type="text"
              name="english"
              value={formData.english}
              onChange={handleChange}
              placeholder="Hello, how are you?"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: '16px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: theme.text, fontSize: '14px' }}>中文翻譯 *</label>
            <input
              type="text"
              name="chinese"
              value={formData.chinese}
              onChange={handleChange}
              placeholder="你好，你好嗎？"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: '16px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: theme.text, fontSize: '14px' }}>分類</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: '16px' }}
              >
                <option value="daily">日常 Daily</option>
                <option value="greeting">問候 Greeting</option>
                <option value="work">工作 Work</option>
                <option value="tech">科技 Tech</option>
                <option value="business">商業 Business</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: theme.text, fontSize: '14px' }}>難度</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: '16px' }}
              >
                <option value="A1">A1 初級</option>
                <option value="A2">A2 中級</option>
                <option value="B1">B1 中高級</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: theme.text, fontSize: '14px' }}>關鍵詞（用於配圖，逗號分隔）</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="cat, happy, room"
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, fontSize: '16px' }}
              />
              <button
                type="button"
                onClick={fetchPreviewImage}
                style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                🔍 配圖
              </button>
            </div>
          </div>

          {/* 圖片預覽 */}
          {previewImage && (
            <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={previewImage} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            </div>
          )}

          <button
            type="submit"
            disabled={!formData.english || !formData.chinese}
            style={{ 
              width: '100%', padding: '15px', borderRadius: '12px', border: 'none', 
              backgroundColor: formData.english && formData.chinese ? theme.accent : '#666', 
              color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
              opacity: saved ? 0.7 : 1
            }}
          >
            {saved ? '✅ 已儲存！' : '💾 儲存句子'}
          </button>
        </form>

        {/* 現有自定義句子 */}
        <div style={{ marginTop: '30px', borderTop: `1px solid ${theme.border}`, paddingTop: '20px' }}>
          <h3 style={{ color: theme.text, fontSize: '14px', marginBottom: '10px' }}>📝 已儲存的句子</h3>
          <div id="savedList" style={{ maxHeight: '150px', overflow: 'auto' }}>
            {/* 這裡可以渲染已儲存的句子 */}
            <p style={{ color: theme.sub, fontSize: '12px' }}>尚無自定義句子</p>
          </div>
        </div>
      </div>
    </div>
  );
};
