import React, { useState, useCallback } from 'react';

// Simple conversation scenarios for offline AI practice
const conversationScenarios = [
  {
    topic: 'greeting',
    title: '打招呼 Greetings',
    prompts: [
      { en: 'Hello! How are you?', zh: '你好！你好嗎？' },
      { en: "I'm doing great, thank you!", zh: '我很好，謝謝！' },
      { en: 'Nice to meet you!', zh: '很高興認識你！' },
      { en: "What's your name?", zh: '你叫什麼名字？' },
      { en: 'Where are you from?', zh: '你來自哪裡？' },
    ]
  },
  {
    topic: 'shopping',
    title: '購物 Shopping',
    prompts: [
      { en: 'How much does this cost?', zh: '這個多少錢？' },
      { en: 'Can I try this on?', zh: '我可以試穿嗎？' },
      { en: 'Do you have this in a different size?', zh: '有其他尺寸嗎？' },
      { en: "That's too expensive.", zh: '太貴了。' },
      { en: 'Can you give me a discount?', zh: '可以便宜一點嗎？' },
    ]
  },
  {
    topic: 'restaurant',
    title: '餐廳 Restaurant',
    prompts: [
      { en: 'A table for two, please.', zh: '請給我兩位的桌子。' },
      { en: 'Can I see the menu?', zh: '我可以看菜單嗎？' },
      { en: "I'd like to order...", zh: '我想點...' },
      { en: 'The bill, please.', zh: '請結帳。' },
      { en: 'This is delicious!', zh: '這個很好吃！' },
    ]
  },
  {
    topic: 'directions',
    title: '問路 Directions',
    prompts: [
      { en: 'Excuse me, where is...?', zh: '不好意思，...在哪裡？' },
      { en: 'Is it far from here?', zh: '離這裡遠嗎？' },
      { en: 'Turn left/right.', zh: '左轉/右轉。' },
      { en: 'Go straight.', zh: '直走。' },
      { en: 'Thank you for your help!', zh: '謝謝你的幫忙！' },
    ]
  },
  {
    topic: 'travel',
    title: '旅行 Travel',
    prompts: [
      { en: 'I need a taxi to the airport.', zh: '我需要計程車去機場。' },
      { en: 'What time does the train leave?', zh: '火車幾點出發？' },
      { en: 'Where can I buy a ticket?', zh: '我在哪裡買票？' },
      { en: 'I lost my passport.', zh: '我的護照掉了。' },
      { en: 'Can you speak more slowly?', zh: '請你說慢一點好嗎？' },
    ]
  }
];

// Simple responses when API is not available
const simpleResponses = [
  "That's interesting! Can you tell me more?",
  "I see! Could you explain that in different words?",
  "Great! What else can you tell me about that?",
  "That's a nice topic. Let's practice more!",
  "Try using complete sentences: 'I think that...'",
  "Good try! Remember to use proper grammar.",
  "Nice! Can you say that in a different way?",
  "Keep practicing! You're making progress.",
];

export function AIChatbot({ darkMode, onClose }) {
  const [mode, setMode] = useState('free'); // 'free' or 'scenario'
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI English tutor. Choose a mode to start practicing!', type: 'intro' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', inputBg: '#3d3d3d', accent: '#4CAF50', border: '#444' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', inputBg: 'white', accent: '#2196F3', border: '#ddd' };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Try to call AI API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history: messages })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      // Fallback: simple response
      const response = simpleResponses[Math.floor(Math.random() * simpleResponses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }
    setLoading(false);
  };

  const startScenario = (scenario) => {
    setCurrentScenario(scenario);
    setScenarioIndex(0);
    setMode('scenario');
    setMessages([
      { role: 'assistant', content: `Let's practice: ${scenario.title}`, type: 'scenario' },
      { role: 'assistant', content: `Try saying: "${scenario.prompts[0].en}"`, type: 'prompt', zh: scenario.prompts[0].zh }
    ]);
  };

  const nextPrompt = () => {
    if (!currentScenario) return;
    const nextIdx = (scenarioIndex + 1) % currentScenario.prompts.length;
    setScenarioIndex(nextIdx);
    setMessages(prev => [...prev, 
      { role: 'assistant', content: `Try saying: "${currentScenario.prompts[nextIdx].en}"`, type: 'prompt', zh: currentScenario.prompts[nextIdx].zh }
    ]);
  };

  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.8;
    speechSynthesis.speak(u);
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    container: { backgroundColor: theme.cardBg, borderRadius: '16px', width: '95%', maxWidth: '550px', height: '85vh', display: 'flex', flexDirection: 'column' },
    header: { padding: '15px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '18px', fontWeight: 'bold', color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    modeBar: { padding: '10px 15px', display: 'flex', gap: '10px', borderBottom: `1px solid ${theme.border}` },
    modeBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.text, cursor: 'pointer', fontSize: '14px' },
    activeMode: { backgroundColor: theme.accent, color: 'white', borderColor: theme.accent },
    scenarioGrid: { padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', borderBottom: `1px solid ${theme.border}`, maxHeight: '150px', overflowY: 'auto' },
    scenarioBtn: { padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, cursor: 'pointer', textAlign: 'center', fontSize: '13px' },
    messages: { flex: 1, overflowY: 'auto', padding: '15px' },
    msg: { marginBottom: '12px', padding: '12px 16px', borderRadius: '12px', maxWidth: '85%', lineHeight: '1.5', fontSize: '14px' },
    userMsg: { backgroundColor: theme.accent, color: 'white', marginLeft: 'auto' },
    botMsg: { backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` },
    promptMsg: { backgroundColor: theme.accent + '20', border: `1px solid ${theme.accent}`, borderLeft: `3px solid ${theme.accent}` },
    introMsg: { backgroundColor: theme.accent + '10', textAlign: 'center', fontSize: '13px' },
    zhText: { fontSize: '12px', color: theme.text + '80', marginTop: '6px', fontStyle: 'italic' },
    inputArea: { padding: '15px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: '10px' },
    input: { flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: '14px' },
    sendBtn: { padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', fontWeight: 'bold' },
    hint: { fontSize: '12px', color: theme.text + '80', textAlign: 'center', padding: '8px' },
    nextBtn: { display: 'block', margin: '10px auto 0', padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', fontSize: '12px' }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>🤖 AI Tutor</div>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.modeBar}>
          <button 
            style={{...styles.modeBtn, ...(mode === 'free' ? styles.activeMode : {})}}
            onClick={() => setMode('free')}
          >
            💬 自由對話
          </button>
          <button 
            style={{...styles.modeBtn, ...(mode === 'scenario' ? styles.activeMode : {})}}
            onClick={() => setMode('scenario')}
          >
            📚 情境練習
          </button>
        </div>

        {mode === 'scenario' && (
          <div style={styles.scenarioGrid}>
            {conversationScenarios.map((sc, idx) => (
              <button 
                key={idx}
                style={styles.scenarioBtn}
                onClick={() => startScenario(sc)}
              >
                {sc.title}
              </button>
            ))}
          </div>
        )}

        <div style={styles.messages}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              ...styles.msg,
              ...(msg.role === 'user' ? styles.userMsg : msg.type === 'prompt' ? styles.promptMsg : msg.type === 'intro' ? styles.introMsg : styles.botMsg)
            }}>
              {msg.role === 'assistant' && '💬 '}
              {msg.content}
              {msg.zh && <div style={styles.zhText}>{msg.zh}</div>}
              {msg.type === 'prompt' && (
                <button style={styles.nextBtn} onClick={nextPrompt}>
                  下一句 →
                </button>
              )}
            </div>
          ))}
          {loading && <div style={{...styles.msg, ...styles.botMsg}}>正在思考...</div>}
        </div>

        <div style={styles.hint}>
          💡 {mode === 'free' ? '用英文與 AI 對話練習！嘗試說完整的句子。' : '點擊情境開始練習日常對話'}
        </div>
        <div style={styles.inputArea}>
          <input 
            style={styles.input} 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'scenario' ? '輸入你說的句子...' : 'Type in English...'}
            disabled={loading}
          />
          <button style={styles.sendBtn} onClick={handleSend} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default AIChatbot;
