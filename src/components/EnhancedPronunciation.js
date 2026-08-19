import React, { useState } from 'react';

// 加強版發音練習组件
export function EnhancedPronunciation({ sentence, darkMode, onClose }) {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null);
  const [spokenText, setSpokenText] = useState('');
  const [showPhonetics, setShowPhonetics] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', accent: '#4CAF50', danger: '#f44336', warning: '#FF9800', inputBg: '#3d3d3d' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', accent: '#4CAF50', danger: '#f44336', warning: '#FF9800', inputBg: 'white' };

  // 常用單字的 KK 音標資料庫（精簡版）
  const phoneticsDB = {
    'the': '/ðə/', 'that': '/ðæt/', 'this': '/ðɪs/', 'they': '/ðeɪ/', 'was': '/wʌz/', 'were': '/wɜːr/',
    'have': '/hæv/', 'has': '/hæz/', 'had': '/hæd/', 'do': '/duː/', 'does': '/dʌz/', 'did': '/dɪd/',
    'can': '/kæn/', 'could': '/kʊd/', 'would': '/wʊd/', 'should': '/ʃʊd/', 'will': '/wɪl/', 'may': '/meɪ/',
    'get': '/ɡet/', 'got': '/ɡɒt/', 'go': '/ɡoʊ/', 'went': '/went/', 'come': '/kʌm/', 'came': '/keɪm/',
    'see': '/siː/', 'saw': '/sɔː/', 'know': '/noʊ/', 'knew': '/njuː/', 'think': '/θɪŋk/', 'thought': '/θɔːt/',
    'take': '/teɪk/', 'took': '/tʊk/', 'make': '/meɪk/', 'made': '/meɪd/', 'give': '/ɡɪv/', 'gave': '/ɡeɪv/',
    'find': '/faɪnd/', 'found': '/faʊnd/', 'tell': '/tel/', 'told': '/toʊld/', 'become': '/bɪˈkʌm/',
    'leave': '/liːv/', 'put': '/pʊt/', 'keep': '/kiːp/', 'begin': '/bɪˈɡɪn/', 'seem': '/siːm/',
    'help': '/help/', 'show': '/ʃoʊ/', 'hear': '/hɪr/', 'play': '/pleɪ/', 'run': '/rʌn/',
    'move': '/muːv/', 'live': '/lɪv/', 'believe': '/bɪˈliːv/', 'hold': '/hoʊld/', 'bring': '/brɪŋ/',
    'write': '/raɪt/', 'wrote': '/roʊt/', 'provide': '/prəˈvaɪd/', 'sit': '/sɪt/', 'stand': '/stænd/',
    'lose': '/luːz/', 'pay': '/peɪ/', 'meet': '/miːt/', 'include': '/ɪnˈkluːd/', 'continue': '/kənˈtɪnjuː/',
    'set': '/set/', 'learn': '/lɜːrn/', 'change': '/tʃeɪndʒ/', 'lead': '/liːd/', 'understand': '/ˌʌndərˈstænd/',
    'watch': '/wɒtʃ/', 'follow': '/ˈfɒloʊ/', 'stop': '/stɒp/', 'create': '/kriːˈeɪt/', 'speak': '/spiːk/',
    'read': '/riːd/', 'allow': '/əˈlaʊ/', 'add': '/æd/', 'spend': '/spend/', 'grow': '/ɡroʊ/',
    'open': '/ˈoʊpən/', 'walk': '/wɔːk/', 'win': '/wɪn/', 'offer': '/ˈɔːfər/', 'remember': '/rɪˈmembər/',
    'love': '/lʌv/', 'consider': '/kənˈsɪdər/', 'appear': '/əˈpɪr/', 'buy': '/baɪ/', 'wait': '/weɪt/',
    'serve': '/sɜːrv/', 'die': '/daɪ/', 'send': '/send/', 'expect': '/ɪkˈspekt/', 'build': '/bɪld/',
    'stay': '/steɪ/', 'fall': '/fɔːl/', 'cut': '/kʌt/', 'reach': '/riːtʃ/', 'kill': '/kɪl/',
    'remain': '/rɪˈmeɪn/', 'suggest': '/səˈdʒest/', 'raise': '/reɪz/', 'pass': '/pæs/', 'sell': '/sel/',
    'require': '/rɪˈkwaɪər/', 'report': '/rɪˈpɔːrt/', 'decide': '/dɪˈsaɪd/', 'pull': '/pʊl/',
  };

  // 取得單字音標
  const getPhonetic = (word) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
    return phoneticsDB[cleanWord] || null;
  };

  // 取得句子中的單字（用於顯示）
  const getWords = () => {
    return sentence.en.split(/(\s+)/).filter(Boolean).map((word, idx) => {
      const cleanWord = word.replace(/[.,!?]/g, '');
      const isPunctuation = !/\S/.test(word) || /^[^\w\s]+$/.test(word.trim());
      return { word, cleanWord, idx, isPunctuation, phonetic: getPhonetic(cleanWord) };
    });
  };

  const startRecording = async () => {
    try {
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
    
    const targetWords = target.split(' ');
    const spokenWords = spokenClean.split(' ');
    
    let correctWords = 0;
    let mistakes = [];
    
    for (let i = 0; i < Math.min(targetWords.length, spokenWords.length); i++) {
      if (targetWords[i] === spokenWords[i]) {
        correctWords++;
      } else {
        mistakes.push({ expected: targetWords[i], got: spokenWords[i] });
      }
    }
    
    const score = Math.round((correctWords / targetWords.length) * 100);
    
    let feedback = '';
    if (score >= 90) {
      feedback = '🎉 發音非常棒！簡直完美！';
    } else if (score >= 70) {
      feedback = '👍 很不錯！再練習一下可以更好。';
    } else if (score >= 50) {
      feedback = '💪 有進步空間，加強練習這些單字：' + mistakes.slice(0, 3).map(m => m.expected).join(', ');
    } else {
      feedback = '📚 讓我們再試一次！記得每個單字要發音清楚。';
    }

    setResult({ score, feedback, mistakes, spoken });
  };

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.7;
    speechSynthesis.speak(utterance);
  };

  const words = getWords();

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto' },
    container: { backgroundColor: theme.cardBg, borderRadius: '16px', width: '90%', maxWidth: '550px', padding: '25px', margin: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '20px', fontWeight: 'bold', color: theme.text },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    toggleBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: showPhonetics ? theme.accent : theme.text + '20', color: showPhonetics ? 'white' : theme.text, cursor: 'pointer', fontSize: '14px' },
    sentence: { fontSize: '18px', color: theme.text, marginBottom: '20px', lineHeight: '2.2', backgroundColor: theme.bg, padding: '15px', borderRadius: '12px' },
    word: { padding: '2px 4px', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' },
    phonetic: { fontSize: '12px', color: theme.accent, marginLeft: '4px' },
    recordBtn: { width: '80px', height: '80px', borderRadius: '50%', border: 'none', backgroundColor: isRecording ? theme.danger : theme.accent, color: 'white', fontSize: '32px', cursor: 'pointer', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    status: { fontSize: '14px', color: theme.text + '99', marginBottom: '15px', textAlign: 'center' },
    result: { marginTop: '20px', padding: '20px', borderRadius: '12px', backgroundColor: theme.bg },
    score: { fontSize: '48px', fontWeight: 'bold', textAlign: 'center', color: result?.score >= 70 ? theme.accent : theme.danger },
    feedback: { fontSize: '16px', color: theme.text, marginTop: '10px', textAlign: 'center' },
    mistakes: { marginTop: '15px', padding: '10px', backgroundColor: theme.cardBg, borderRadius: '8px', fontSize: '14px' },
    tip: { marginTop: '20px', padding: '15px', backgroundColor: theme.warning + '20', borderRadius: '8px', fontSize: '13px', color: theme.text }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>🎤 發音練習</div>
          <div>
            <button style={styles.toggleBtn} onClick={() => setShowPhonetics(!showPhonetics)}>
              {showPhonetics ? '🎵 隱藏音標' : '🎵 顯示音標'}
            </button>
            <button style={{...styles.closeBtn, marginLeft: '10px'}} onClick={onClose}>×</button>
          </div>
        </div>

        <div style={styles.sentence}>
          {words.map((item) => (
            item.isPunctuation ? (
              <span key={item.idx}>{item.word}</span>
            ) : (
              <span 
                key={item.idx} 
                style={{
                  ...styles.word,
                  backgroundColor: selectedWord === item.idx ? theme.accent + '40' : 'transparent'
                }}
                onClick={() => {
                  setSelectedWord(item.idx);
                  speakWord(item.cleanWord);
                }}
                title={item.phonetic ? `點擊播放: ${item.phonetic}` : '點擊播放'}
              >
                {item.word}
                {showPhonetics && item.phonetic && (
                  <span style={styles.phonetic}>{item.phonetic}</span>
                )}
              </span>
            )
          ))}
        </div>
        
        <div style={styles.status}>
          {isRecording ? '正在錄音... 請說出上面的句子' : '點擊錄音開始練習，或點擊單字練習發音'}
        </div>

        <button 
          style={styles.recordBtn} 
          onClick={startRecording}
          disabled={isRecording}
        >
          {isRecording ? '🔴' : '🎤'}
        </button>

        {result && (
          <div style={styles.result}>
            <div style={styles.score}>{result.score}%</div>
            <div style={styles.feedback}>{result.feedback}</div>
            {result.mistakes && result.mistakes.length > 0 && (
              <div style={styles.mistakes}>
                <strong>注意發音：</strong> {result.mistakes.map(m => m.expected).join(', ')}
              </div>
            )}
          </div>
        )}

        <div style={styles.tip}>
          💡 <strong>發音技巧：</strong>
          <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
            <li>th 發音時舌頭放在齒間 (think, this, that)</li>
            <li>L 和 R 注意舌頭位置 (like vs right)</li>
            <li>連讀時注意輔音+元音的連接</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EnhancedPronunciation;
