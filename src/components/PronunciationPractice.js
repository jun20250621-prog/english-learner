import React, { useState, useRef } from 'react';

export function PronunciationPractice({ sentence, darkMode, onClose }) {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null);
  const [spokenText, setSpokenText] = useState('');
  const mediaRecorderRef = useRef(null);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', accent: '#4CAF50', danger: '#f44336' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', accent: '#2196F3', danger: '#f44336' };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSpokenText(transcript);
        evaluatePronunciation(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setResult({ score: 0, feedback: '無法識別語音，請再試一次。' });
      };

      recognition.start();
      setIsRecording(true);
      setResult(null);

      // Stop after 10 seconds
      setTimeout(() => {
        if (isRecording) {
          recognition.stop();
          setIsRecording(false);
        }
      }, 10000);

    } catch (err) {
      console.error('Microphone access denied:', err);
      setResult({ score: 0, feedback: '無法訪問麥克風，請檢查權限設定。' });
    }
  };

  const evaluatePronunciation = (spoken) => {
    const target = sentence.en.toLowerCase().replace(/[.,!?]/g, '').trim();
    const spokenClean = spoken.toLowerCase().replace(/[.,!?]/g, '').trim();
    
    // Calculate similarity
    const targetWords = target.split(' ');
    const spokenWords = spokenClean.split(' ');
    
    let correctWords = 0;
    for (let i = 0; i < Math.min(targetWords.length, spokenWords.length); i++) {
      if (targetWords[i] === spokenWords[i]) {
        correctWords++;
      }
    }
    
    const score = Math.round((correctWords / targetWords.length) * 100);
    
    let feedback = '';
    if (score >= 90) {
      feedback = '🎉 發音非常棒！簡直完美！';
    } else if (score >= 70) {
      feedback = '👍 很不錯！再練習一下可以更好。';
    } else if (score >= 50) {
      feedback = '💪 有進步空間，聽起來像：' + spoken;
    } else {
      feedback = '📚 讓我們再試一次！記得每個單字要發音清楚。';
    }

    setResult({ score, feedback, spoken });
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    container: { backgroundColor: theme.cardBg, borderRadius: '16px', width: '90%', maxWidth: '450px', padding: '25px', textAlign: 'center' },
    title: { fontSize: '20px', fontWeight: 'bold', color: theme.text, marginBottom: '20px' },
    sentence: { fontSize: '18px', color: theme.text, marginBottom: '10px', lineHeight: '1.6' },
    chinese: { fontSize: '14px', color: theme.text + '99', marginBottom: '25px' },
    recordBtn: { width: '80px', height: '80px', borderRadius: '50%', border: 'none', backgroundColor: isRecording ? theme.danger : theme.accent, color: 'white', fontSize: '32px', cursor: 'pointer', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    status: { fontSize: '14px', color: theme.text + '99', marginBottom: '15px' },
    result: { marginTop: '20px', padding: '20px', borderRadius: '12px', backgroundColor: theme.bg },
    score: { fontSize: '48px', fontWeight: 'bold', color: result?.score >= 70 ? theme.accent : theme.danger },
    feedback: { fontSize: '16px', color: theme.text, marginTop: '10px' },
    spoken: { fontSize: '14px', color: theme.text + '99', marginTop: '8px', fontStyle: 'italic' },
    closeBtn: { marginTop: '20px', padding: '10px 30px', borderRadius: '8px', border: 'none', backgroundColor: theme.text + '20', color: theme.text, cursor: 'pointer' }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.container}>
        <div style={styles.title}>🎤 發音練習</div>
        
        <div style={styles.sentence}>{sentence.en}</div>
        <div style={styles.chinese}>{sentence.zh}</div>
        
        <button 
          style={styles.recordBtn} 
          onClick={startRecording}
          disabled={isRecording}
        >
          {isRecording ? '🔴' : '🎤'}
        </button>
        
        <div style={styles.status}>
          {isRecording ? '正在錄音... 請說出上面的句子' : '點擊錄音開始練習'}
        </div>

        {result && (
          <div style={styles.result}>
            <div style={styles.score}>{result.score}%</div>
            <div style={styles.feedback}>{result.feedback}</div>
            {result.spoken && (
              <div style={styles.spoken}>你說的：{result.spoken}</div>
            )}
          </div>
        )}

        <button style={styles.closeBtn} onClick={onClose}>關閉</button>
      </div>
    </div>
  );
}

export default PronunciationPractice;
