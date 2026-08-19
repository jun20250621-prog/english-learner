import React, { useState, useCallback } from 'react';

// 克漏字測驗組件
export function FillInBlank({ sentence, darkMode, onClose }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', accent: '#4CAF50', danger: '#f44336', inputBg: '#3d3d3d' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', accent: '#4CAF50', danger: '#f44336', inputBg: 'white' };

  // 從句子中移除一個關鍵單字
  const getBlanks = () => {
    const words = sentence.en.split(' ');
    const blankWordIndex = Math.floor(words.length / 2);
    const blankWord = words[blankWordIndex];
    words[blankWordIndex] = '_____';
    return { blankWords: words.join(' '), answer: blankWord, index: blankWordIndex };
  };

  const { blankWords, answer, index } = getBlanks();

  const checkAnswer = () => {
    const userAns = userAnswer.trim().toLowerCase();
    const correctAns = answer.replace(/[.,!?]/g, '').toLowerCase();
    const isCorrect = userAns === correctAns || userAns.includes(correctAns);
    
    setSubmitted(true);
    setResult({
      correct: isCorrect,
      answer: answer,
      feedback: isCorrect 
        ? '🎉 正確！太厲害了！' 
        : `❌ 正確答案是：${answer}`
    });
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    container: { backgroundColor: theme.cardBg, borderRadius: '16px', width: '90%', maxWidth: '500px', padding: '25px' },
    title: { fontSize: '20px', fontWeight: 'bold', color: theme.text, marginBottom: '20px', textAlign: 'center' },
    sentence: { fontSize: '18px', color: theme.text, marginBottom: '25px', textAlign: 'center', lineHeight: '1.8', backgroundColor: theme.bg, padding: '15px', borderRadius: '8px' },
    input: { width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', border: `2px solid ${theme.accent}`, backgroundColor: theme.inputBg, color: theme.text, marginBottom: '15px', textAlign: 'center' },
    button: { width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', marginBottom: '10px' },
    result: { marginTop: '20px', padding: '15px', borderRadius: '12px', backgroundColor: theme.bg, textAlign: 'center' },
    resultText: { fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' },
    closeBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.text}30`, backgroundColor: 'transparent', color: theme.text, cursor: 'pointer', marginTop: '10px' }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.container}>
        <div style={styles.title}>📝 克漏字測驗</div>
        
        <div style={styles.sentence}>
          {blankWords}
        </div>
        
        <div style={{ color: theme.text, fontSize: '14px', marginBottom: '15px', textAlign: 'center' }}>
          提示：{sentence.zh}
        </div>

        <input
          style={styles.input}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="請輸入英文單字"
          disabled={submitted}
        />

        {!submitted ? (
          <button style={styles.button} onClick={checkAnswer} disabled={!userAnswer}>
            確認答案
          </button>
        ) : (
          <div style={styles.result}>
            <div style={{...styles.resultText, color: result.correct ? theme.accent : theme.danger}}>
              {result.feedback}
            </div>
          </div>
        )}

        <button style={styles.closeBtn} onClick={onClose}>
          關閉
        </button>
      </div>
    </div>
  );
}

// 聽寫練習組件
export function Dictation({ sentence, darkMode, onClose }) {
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', accent: '#4CAF50', danger: '#f44336', inputBg: '#3d3d3d' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', accent: '#4CAF50', danger: '#f44336', inputBg: 'white' };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.6;
    speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    speak(sentence.en);
    setPlayCount(prev => prev + 1);
  };

  const checkAnswer = () => {
    const userAns = userInput.trim().toLowerCase();
    const correctAns = sentence.en.toLowerCase().replace(/[.,!?]/g, '').trim();
    
    // 計算相似度
    const userWords = userAns.split(' ');
    const correctWords = correctAns.split(' ');
    let correctCount = 0;
    
    for (let i = 0; i < Math.min(userWords.length, correctWords.length); i++) {
      if (userWords[i] === correctWords[i]) correctCount++;
    }
    
    const similarity = Math.round((correctCount / correctWords.length) * 100);
    const isCorrect = similarity >= 70;
    
    setSubmitted(true);
    setResult({
      correct: isCorrect,
      similarity,
      yourAnswer: userInput,
      correctAnswer: sentence.en
    });
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    container: { backgroundColor: theme.cardBg, borderRadius: '16px', width: '90%', maxWidth: '500px', padding: '25px' },
    title: { fontSize: '20px', fontWeight: 'bold', color: theme.text, marginBottom: '20px', textAlign: 'center' },
    hint: { fontSize: '14px', color: theme.text + '99', marginBottom: '15px', textAlign: 'center' },
    playBtn: { width: '100%', padding: '20px', fontSize: '24px', border: 'none', borderRadius: '12px', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    input: { width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', border: `2px solid ${theme.text}30`, backgroundColor: theme.inputBg, color: theme.text, marginBottom: '15px', minHeight: '80px', textAlign: 'center' },
    button: { width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', marginBottom: '10px' },
    result: { marginTop: '20px', padding: '15px', borderRadius: '12px', backgroundColor: theme.bg },
    score: { fontSize: '36px', fontWeight: 'bold', textAlign: 'center', color: result?.similarity >= 70 ? theme.accent : theme.danger },
    feedback: { fontSize: '14px', color: theme.text, marginTop: '10px', padding: '10px', backgroundColor: theme.cardBg, borderRadius: '8px' },
    closeBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.text}30`, backgroundColor: 'transparent', color: theme.text, cursor: 'pointer', marginTop: '10px' }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.container}>
        <div style={styles.title}>🎧 聽寫練習</div>
        
        <div style={styles.hint}>
          點擊播放按鈕，聽寫出聽到的句子<br/>
          已播放次數：{playCount}
        </div>

        <button style={styles.playBtn} onClick={handlePlay}>
          ▶️ 播放句子
        </button>

        <textarea
          style={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="請在此輸入你聽到的句子..."
          disabled={submitted}
        />

        {!submitted ? (
          <button style={styles.button} onClick={checkAnswer} disabled={!userInput}>
            確認答案
          </button>
        ) : (
          <div style={styles.result}>
            <div style={styles.score}>{result.similarity}%</div>
            <div style={styles.feedback}>
              <div><strong>你的答案：</strong>{result.yourAnswer}</div>
              <div style={{ marginTop: '8px' }}><strong>正確答案：</strong>{result.correctAnswer}</div>
            </div>
          </div>
        )}

        <button style={styles.closeBtn} onClick={onClose}>
          關閉
        </button>
      </div>
    </div>
  );
}

// 單字卡複習組件
export function Flashcard({ content, darkMode, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', accent: '#4CAF50', danger: '#f44336', warning: '#FF9800' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', accent: '#4CAF50', danger: '#f44336', warning: '#FF9800' };

  // 從內容中提取單字
  const getWords = () => {
    const words = [];
    if (content.sentences) {
      content.sentences.forEach(sentence => {
        if (sentence.words) {
          sentence.words.forEach(word => {
            if (!words.find(w => w.en === word.en)) {
              words.push(word);
            }
          });
        }
      });
    }
    return words;
  };

  const allWords = getWords();
  const currentWord = allWords[currentIndex];

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((currentIndex + 1) % allWords.length);
    }, 200);
  };

  const prevCard = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((currentIndex - 1 + allWords.length) % allWords.length);
    }, 200);
  };

  const markKnown = () => {
    if (!known.includes(currentWord.en)) {
      setKnown([...known, currentWord.en]);
    }
    nextCard();
  };

  const markUnknown = () => {
    nextCard();
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    container: { backgroundColor: theme.cardBg, borderRadius: '16px', width: '90%', maxWidth: '400px', padding: '25px' },
    title: { fontSize: '20px', fontWeight: 'bold', color: theme.text, marginBottom: '15px', textAlign: 'center' },
    counter: { textAlign: 'center', color: theme.text + '99', marginBottom: '20px', fontSize: '14px' },
    card: { 
      backgroundColor: theme.bg, 
      borderRadius: '16px', 
      padding: '40px 20px', 
      textAlign: 'center', 
      minHeight: '150px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'transform 0.3s',
      transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
    },
    word: { fontSize: '28px', fontWeight: 'bold', color: theme.text, marginBottom: '10px' },
    pronunciation: { fontSize: '14px', color: theme.text + '99', marginBottom: '15px' },
    translation: { fontSize: '20px', color: theme.accent },
    hint: { fontSize: '12px', color: theme.text + '70', marginTop: '10px' },
    buttons: { display: 'flex', gap: '10px', marginTop: '20px' },
    unknownBtn: { flex: 1, padding: '14px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', backgroundColor: theme.danger, color: 'white', cursor: 'pointer' },
    knownBtn: { flex: 1, padding: '14px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', backgroundColor: theme.accent, color: 'white', cursor: 'pointer' },
    navButtons: { display: 'flex', gap: '10px', marginTop: '15px' },
    navBtn: { flex: 1, padding: '10px', fontSize: '14px', border: `1px solid ${theme.text}30`, borderRadius: '8px', backgroundColor: 'transparent', color: theme.text, cursor: 'pointer' },
    progress: { textAlign: 'center', marginTop: '15px', fontSize: '14px', color: theme.text + '99' },
    closeBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.text}30`, backgroundColor: 'transparent', color: theme.text, cursor: 'pointer', marginTop: '15px' }
  };

  if (!currentWord) {
    return (
      <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={styles.container}>
          <div style={styles.title}>📇 單字卡</div>
          <div style={{ textAlign: 'center', color: theme.text }}>
            此內容沒有單字資料
          </div>
          <button style={styles.closeBtn} onClick={onClose}>關閉</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.container}>
        <div style={styles.title}>📇 單字卡</div>
        
        <div style={styles.counter}>
          已認識 {known.length} / {allWords.length} 個單字
        </div>

        <div style={styles.card} onClick={() => setFlipped(!flipped)}>
          {!flipped ? (
            <>
              <div style={styles.word}>{currentWord.en}</div>
              <div style={styles.hint}>點擊卡片查看中文</div>
            </>
          ) : (
            <>
              <div style={styles.translation}>{currentWord.zh}</div>
              <div style={styles.hint}>點擊卡片查看英文</div>
            </>
          )}
        </div>

        <div style={styles.buttons}>
          <button style={styles.unknownBtn} onClick={markUnknown}>
            ❌ 不認識
          </button>
          <button style={styles.knownBtn} onClick={markKnown}>
            ✅ 認識
          </button>
        </div>

        <div style={styles.navButtons}>
          <button style={styles.navBtn} onClick={prevCard}>◀ 上一張</button>
          <button style={styles.navBtn} onClick={nextCard}>下一張 ▶</button>
        </div>

        <div style={styles.progress}>
          {currentIndex + 1} / {allWords.length}
        </div>

        <button style={styles.closeBtn} onClick={onClose}>
          關閉
        </button>
      </div>
    </div>
  );
}

export default { FillInBlank, Dictation, Flashcard };
