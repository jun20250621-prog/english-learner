import React, { useState } from 'react';

// 文法規則數據庫
const grammarRules = {
  presentSimple: {
    pattern: /\b(am|are|is|do|does|go|goes|have|has|work|works|like|likes|love|loves|hate|hates|need|needs|want|wants|know|knows|think|thinks|see|sees|hear|hears)\b/i,
    label: '現在簡單式',
    color: '#4CAF50',
    desc: '描述習慣、事實、真理'
  },
  pastSimple: {
    pattern: /\b(was|were|did|went|had|saw|heard|knew|thought|worked|liked|loved|hated|needed|wanted|said|told|asked|answered)\b/i,
    label: '過去簡單式',
    color: '#FF9800',
    desc: '描述過去的動作或狀態'
  },
  presentContinuous: {
    pattern: /\b(am|are|is)\s+\w+(ing)\b/i,
    label: '現在進行式',
    color: '#2196F3',
    desc: '描述正在進行的動作'
  },
  pastContinuous: {
    pattern: /\b(was|were)\s+\w+(ing)\b/i,
    label: '過去進行式',
    color: '#9C27B0',
    desc: '描述過去某時刻正在進行的動作'
  },
  presentPerfect: {
    pattern: /\b(have|has)\s+\w+(ed|en)\b/i,
    label: '現在完成式',
    color: '#00BCD4',
    desc: '描述過去到現在的經驗或結果'
  },
  future: {
    pattern: /\b(will|shall|going to)\b/i,
    label: '未來式',
    color: '#E91E63',
    desc: '描述未來的動作'
  },
  modal: {
    pattern: /\b(can|could|may|might|will|would|shall|should|must|ought to)\b/i,
    label: '情態助詞',
    color: '#795548',
    desc: '表達可能性、許可、能力'
  },
  passive: {
    pattern: /\b(is|are|was|were|been|being)\s+\w+(ed|en)\b/i,
    label: '被動語態',
    color: '#607D8B',
    desc: '主詞承受動作'
  },
  comparative: {
    pattern: /\b(better|worse|more|less|easier|harder|hotter|colder| happier| prettier)\b/i,
    label: '比較級',
    color: '#FF5722',
    desc: '比較兩者'
  },
  superlative: {
    pattern: /\b(best|worst|most|least|easiest|hardest|hottest|coldest| happiest|prettiest)\b/i,
    label: '最高級',
    color: '#3F51B5',
    desc: '最極端的程度'
  }
};

export function GrammarAnalyzer({ sentence, darkMode, onClose }) {
  const [highlightMode, setHighlightMode] = useState(true);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', border: '#444' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', border: '#ddd' };

  // 分析句子文法
  const analyzeGrammar = (text) => {
    const words = text.split(/(\s+)/);
    const analyzed = words.map((word, idx) => {
      let matched = null;
      let rule = null;
      
      for (const [key, value] of Object.entries(grammarRules)) {
        if (value.pattern.test(word)) {
          matched = key;
          rule = value;
          break;
        }
      }
      
      return { word, key: idx, matched, rule };
    });
    return analyzed;
  };

  // 取得句型描述
  const getSentenceType = (text) => {
    if (/^\w+ing\b/.test(text)) return '現在分詞/動名詞';
    if (/\bto\s+\w+/.test(text)) return '不定詞';
    if (/\b\w+ed\b/.test(text) && /\bhave\b/i.test(text)) return '現在完成式';
    if (/\bwill\b/.test(text)) return '未來式';
    if (/\b(is|are|was|were)\b/.test(text) && /\b\w+ing\b/.test(text)) return '進行式';
    if (/\b(is|are|was|were)\b/.test(text) && /\w+ed\b/.test(text)) return '被動語態';
    if (/\b(if|when|unless|before|after|while)\b/.test(text)) return '副詞子句';
    return '簡單句';
  };

  const analyzed = analyzeGrammar(sentence.en);
  const sentenceType = getSentenceType(sentence.en);
  const matchedRules = [...new Set(analyzed.filter(a => a.matched).map(a => a.rule))];

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    container: { backgroundColor: theme.cardBg, borderRadius: '16px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto', padding: '25px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '20px', fontWeight: 'bold', color: theme.text },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    sentence: { fontSize: '22px', lineHeight: '2', color: theme.text, marginBottom: '20px', textAlign: 'center' },
    word: { padding: '2px 4px', borderRadius: '4px', margin: '0 2px', cursor: 'help' },
    section: { marginTop: '20px', padding: '15px', borderRadius: '12px', backgroundColor: theme.bg },
    sectionTitle: { fontSize: '14px', fontWeight: 'bold', color: theme.text + '99', marginBottom: '10px', textTransform: 'uppercase' },
    tag: { display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', margin: '4px', color: 'white', fontWeight: 'bold' },
    typeTag: { display: 'inline-block', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', margin: '4px', backgroundColor: '#2196F3', color: 'white', fontWeight: 'bold' },
    legend: { marginTop: '15px' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '12px', color: theme.text + '99' },
    legendColor: { width: '12px', height: '12px', borderRadius: '3px' }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>📖 文法分析</div>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.sentence}>
          {analyzed.map((item) => (
            <span 
              key={item.key} 
              style={item.rule ? { ...styles.word, backgroundColor: item.rule.color + '40', borderBottom: `2px solid ${item.rule.color}` } : {}}
              title={item.rule ? `${item.rule.label}: ${item.rule.desc}` : ''}
            >
              {item.word}
            </span>
          ))}
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>句型</div>
          <div style={styles.typeTag}>{sentenceType}</div>
        </div>

        {matchedRules.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>偵測到的文法</div>
            {matchedRules.map((rule, idx) => (
              <span key={idx} style={{...styles.tag, backgroundColor: rule.color}}>
                {rule.label}
              </span>
            ))}
            <div style={styles.legend}>
              {matchedRules.map((rule, idx) => (
                <div key={idx} style={styles.legendItem}>
                  <div style={{...styles.legendColor, backgroundColor: rule.color}}></div>
                  <span>{rule.label}: {rule.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{...styles.section, marginTop: '15px'}}>
          <div style={styles.sectionTitle}>學習提示</div>
          <ul style={{ color: theme.text + '99', paddingLeft: '20px', margin: 0, fontSize: '14px' }}>
            <li>點擊帶有底線的單字查看文法說明</li>
            <li>注意時態標記 (ed = 過去, ing = 進行中)</li>
            <li>助動詞決定句子的時間和語氣</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GrammarAnalyzer;
