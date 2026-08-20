import React, { useState, useEffect } from 'react';

const getStoredData = (key, defaultValue) => { try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : defaultValue; } catch { return defaultValue; } };
const saveData = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// TOEIC Sample Questions
const toeicQuestions = {
  listening: {
    photos: [
      { id: 1, image: '🏢', question: 'What is happening in the photo?', options: ['A building', 'A meeting', 'A party', 'A concert'], correct: 0 },
      { id: 2, image: '✈️', question: 'Where might this be?', options: ['Airport', 'Hotel', 'Restaurant', 'Hospital'], correct: 0 },
    ],
    conversations: [
      {
        id: 1,
        dialogue: `Woman: Hello, I'd like to make a reservation for two.
Man: Of course. What date would you like?
Woman: This Saturday evening.
Man: Let me check... We have tables available at 7 PM and 8 PM.
Woman: 7 PM would be perfect.
Man: Great. May I have your name and phone number?`,
        questions: [
          { q: 'What is the woman trying to do?', options: ['Order food', 'Make a reservation', 'Cancel an order', 'Complain about service'], correct: 1 },
          { q: 'What time is reserved?', options: ['6 PM', '7 PM', '8 PM', '9 PM'], correct: 1 },
        ]
      }
    ],
    talks: [
      {
        id: 1,
        talk: `Welcome to City Museum. We're open from 9 AM to 6 PM, Tuesday through Sunday. Admission is $15 for adults and $8 for children under 12. Guided tours are available every hour. Please note that photography is not allowed in the special exhibition hall.`,
        questions: [
          { q: 'When is the museum closed?', options: ['Monday', 'Sunday', 'Saturday', 'Friday'], correct: 0 },
          { q: 'How much is admission for two adults?', options: ['$15', '$23', '$30', '$16'], correct: 2 },
        ]
      }
    ]
  },
  reading: {
    sentences: [
      { id: 1, question: 'She ___ to the meeting yesterday.', options: ['go', 'goes', 'went', 'going'], correct: 2 },
      { id: 2, question: 'Please ___ the form before submitting.', options: ['complete', 'completes', 'completing', 'completed'], correct: 0 },
      { id: 3, question: 'The report ___ by the manager yesterday.', options: ['write', 'writes', 'wrote', 'written'], correct: 3 },
    ],
    texts: [
      {
        id: 1,
        text: `Dear Mr. Johnson,
Thank you for your interest in our products. We have received your inquiry and would like to offer you a 10% discount on your first order. This offer is valid until the end of this month.
Best regards,
Sales Team`,
        questions: [
          { q: 'What is the purpose of this letter?', options: ['To order products', 'To offer discount', 'To complain', 'To resign'], correct: 1 },
          { q: 'How long is the discount valid?', options: ['One week', 'Two weeks', 'One month', 'Three months'], correct: 2 },
        ]
      }
    ]
  }
};

// IELTS Sample Questions
const ieltsQuestions = {
  listening: {
    sections: [
      {
        id: 1,
        type: 'conversation',
        audio: 'Section 1: A conversation about booking a hotel room',
        questions: [
          { q: 'What type of room did the person book?', options: ['Single', 'Double', 'Suite', 'Twin'], correct: 1 },
          { q: 'How many nights will they stay?', options: ['One', 'Two', 'Three', 'Four'], correct: 2 },
        ]
      },
      {
        id: 2,
        type: 'talk',
        audio: 'Section 3: A lecture about climate change',
        questions: [
          { q: 'What is the main topic?', options: ['Weather', 'Climate change', 'Ocean levels', 'Pollution'], correct: 1 },
          { q: 'According to the lecture, what is increasing?', options: ['Ice caps', 'Sea levels', 'Forests', 'Deserts'], correct: 1 },
        ]
      }
    ]
  },
  reading: {
    passages: [
      {
        id: 1,
        title: 'The History of Coffee',
        text: `Coffee is one of the most popular drinks in the world. It was first discovered in Ethiopia around the 9th century. By the 15th century, coffee had spread to the Middle East. Today, Brazil is the largest producer of coffee in the world.

The coffee plant grows best in tropical regions with plenty of rain and shade. It takes about 3-4 years for a coffee tree to produce its first beans. The beans are actually seeds inside the coffee cherry.`,
        questions: [
          { q: 'Where was coffee first discovered?', options: ['Brazil', 'Middle East', 'Ethiopia', 'Turkey'], correct: 2 },
          { q: 'How long does it take for a coffee tree to produce beans?', options: ['1-2 years', '2-3 years', '3-4 years', '5-6 years'], correct: 2 },
        ]
      }
    ]
  },
  speaking: {
    topics: [
      { id: 1, part: 'Part 2', topic: 'Describe a memorable trip you took', cues: ['When?', 'Where?', 'Who with?', 'Why memorable?'] },
      { id: 2, part: 'Part 3', topic: 'Discuss the importance of travel', cues: ['Benefits of travel?', 'Problems with tourism?', 'Future of travel?'] },
    ]
  }
};

export function ExamSimulation({ examType, darkMode, onClose }) {
  const [section, setSection] = useState('listening'); // listening, reading
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', accent: '#4CAF50', border: '#444', wrong: '#f44336' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', accent: '#4CAF50', border: '#ddd', wrong: '#f44336' };

  const questions = examType === 'toeic' ? toeicQuestions : ieltsQuestions;
  const currentQuestions = questions[section]?.conversations?.[0]?.questions || 
                          questions[section]?.texts?.[0]?.questions ||
                          questions[section]?.sections?.[0]?.questions ||
                          questions[section]?.sentences ||
                          [];

  const handleAnswer = (idx) => {
    setAnswers({ ...answers, [currentQ]: idx });
  };

  const nextQuestion = () => {
    if (currentQ < currentQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate score
      let correct = 0;
      currentQuestions.forEach((q, idx) => {
        if (answers[idx] === q.correct) correct++;
      });
      setScore(correct);
      setShowResult(true);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setAnswers({});
    setShowResult(false);
    setScore(0);
  };

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: theme.bg, minHeight: '100vh', color: theme.text },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '20px', fontWeight: 'bold' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
    tab: { flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.cardBg, color: theme.text, cursor: 'pointer', textAlign: 'center' },
    activeTab: { backgroundColor: theme.accent, color: 'white', borderColor: theme.accent },
    progress: { height: '6px', backgroundColor: theme.border, borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.accent, transition: 'width 0.3s' },
    card: { backgroundColor: theme.cardBg, borderRadius: '16px', padding: '25px', marginBottom: '20px' },
    questionNum: { fontSize: '14px', color: theme.accent, marginBottom: '10px' },
    question: { fontSize: '18px', marginBottom: '20px', lineHeight: '1.6' },
    options: { display: 'flex', flexDirection: 'column', gap: '12px' },
    option: { padding: '15px', borderRadius: '10px', border: `2px solid ${theme.border}`, backgroundColor: theme.bg, cursor: 'pointer', transition: 'all 0.2s' },
    selectedOption: { borderColor: theme.accent, backgroundColor: theme.accent + '20' },
    correctOption: { borderColor: '#4CAF50', backgroundColor: '#4CAF5020' },
    wrongOption: { borderColor: theme.wrong, backgroundColor: theme.wrong + '20' },
    optionLetter: { display: 'inline-block', width: '28px', height: '28px', lineHeight: '28px', textAlign: 'center', borderRadius: '50%', backgroundColor: theme.border, marginRight: '10px', fontSize: '14px' },
    resultCard: { backgroundColor: theme.cardBg, borderRadius: '16px', padding: '30px', textAlign: 'center' },
    score: { fontSize: '64px', fontWeight: 'bold', color: theme.accent },
    scoreLabel: { fontSize: '16px', color: theme.text + '80', marginBottom: '20px' },
    resultText: { fontSize: '18px', marginBottom: '20px' },
    buttons: { display: 'flex', gap: '10px', justifyContent: 'center' },
    btn: { padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', fontSize: '16px' },
    secondaryBtn: { backgroundColor: 'transparent', border: `2px solid ${theme.border}`, color: theme.text }
  };

  if (showResult) {
    const percentage = Math.round((score / currentQuestions.length) * 100);
    let message = '';
    if (percentage >= 80) message = '🎉 表現優異！';
    else if (percentage >= 60) message = '👍 做得很不錯！';
    else if (percentage >= 40) message = '📚 繼續加油！';
    else message = '💪 需要多加練習！';

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>📊 測驗結果</div>
        </div>
        <div style={styles.resultCard}>
          <div style={styles.score}>{percentage}%</div>
          <div style={styles.scoreLabel}>{score} / {currentQuestions.length} 正確</div>
          <div style={styles.resultText}>{message}</div>
          <div style={styles.buttons}>
            <button style={{...styles.btn, ...styles.secondaryBtn}} onClick={restart}>再考一次</button>
            <button style={styles.btn} onClick={onClose}>完成</button>
          </div>
        </div>
      </div>
    );
  }

  const q = currentQuestions[currentQ];
  if (!q) return <div style={styles.container}>載入中...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>{examType === 'toeic' ? '📝 TOEIC 模擬測驗' : '🎓 IELTS 模擬測驗'}</div>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      <div style={styles.tabs}>
        {['listening', 'reading'].map(tab => (
          <button 
            key={tab}
            style={{...styles.tab, ...(section === tab ? styles.activeTab : {})}}
            onClick={() => { setSection(tab); setCurrentQ(0); setAnswers({}); }}
          >
            {tab === 'listening' ? '👂 聽力' : '📖 閱讀'}
          </button>
        ))}
      </div>

      <div style={styles.progress}>
        <div style={{...styles.progressFill, width: `${((currentQ + 1) / currentQuestions.length) * 100}%`}}></div>
      </div>

      <div style={styles.card}>
        <div style={styles.questionNum}>問題 {currentQ + 1} / {currentQuestions.length}</div>
        <div style={styles.question}>{q.q || q.question}</div>
        
        <div style={styles.options}>
          {(q.options || []).map((opt, idx) => (
            <div 
              key={idx}
              style={{
                ...styles.option,
                ...(answers[currentQ] === idx ? styles.selectedOption : {})
              }}
              onClick={() => handleAnswer(idx)}
            >
              <span style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
              {opt}
            </div>
          ))}
        </div>
      </div>

      <button 
        style={{...styles.btn, width: '100%', opacity: answers[currentQ] !== undefined ? 1 : 0.5}}
        onClick={nextQuestion}
        disabled={answers[currentQ] === undefined}
      >
        {currentQ < currentQuestions.length - 1 ? '下一題' : '查看結果'}
      </button>
    </div>
  );
}

export default ExamSimulation;
