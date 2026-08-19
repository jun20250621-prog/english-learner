import React, { useState } from 'react';

export function AIChatbot({ darkMode, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI English tutor. Feel free to practice English with me! What would you like to talk about?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', inputBg: '#3d3d3d', accent: '#4CAF50' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', inputBg: 'white', accent: '#2196F3' };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Call AI API (需要 API key)
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        // Fallback: 簡單的回應
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'That\'s interesting! Could you tell me more about it? Try to use complete sentences in English!' 
        }]);
      }
    } catch (err) {
      // Offline fallback
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I\'m practicing my responses! Let\'s continue: Can you describe your day in English?' 
      }]);
    }
    setLoading(false);
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    container: { backgroundColor: theme.cardBg, borderRadius: '16px', width: '90%', maxWidth: '500px', height: '70vh', display: 'flex', flexDirection: 'column' },
    header: { padding: '15px', borderBottom: `1px solid ${theme.text}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '18px', fontWeight: 'bold', color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    messages: { flex: 1, overflowY: 'auto', padding: '15px' },
    msg: { marginBottom: '12px', padding: '10px 14px', borderRadius: '12px', maxWidth: '80%', lineHeight: '1.5' },
    userMsg: { backgroundColor: theme.accent, color: 'white', marginLeft: 'auto' },
    botMsg: { backgroundColor: theme.inputBg, color: theme.text, border: `1px solid ${theme.text}20` },
    inputArea: { padding: '15px', borderTop: `1px solid ${theme.text}20`, display: 'flex', gap: '10px' },
    input: { flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.text}30`, backgroundColor: theme.inputBg, color: theme.text, fontSize: '14px' },
    sendBtn: { padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', fontWeight: 'bold' },
    hint: { fontSize: '12px', color: theme.text + '99', textAlign: 'center', padding: '8px' }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>🤖 AI Tutor</div>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={styles.messages}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{...styles.msg, ...(msg.role === 'user' ? styles.userMsg : styles.botMsg)}}>
              {msg.role === 'assistant' && '💬 '}
              {msg.content}
            </div>
          ))}
          {loading && <div style={{...styles.msg, ...styles.botMsg}}>正在思考...</div>}
        </div>
        <div style={styles.hint}>💡 用英文與 AI 對話練習！</div>
        <div style={styles.inputArea}>
          <input 
            style={styles.input} 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type in English..."
            disabled={loading}
          />
          <button style={styles.sendBtn} onClick={handleSend} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default AIChatbot;
