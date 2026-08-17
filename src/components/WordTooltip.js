import React, { useState, useEffect } from 'react';
import { defaultDictionary } from '../data/dictionary';

const getStoredData = (key, defaultValue) => {
  try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : defaultValue; } 
  catch { return defaultValue; }
};

const saveData = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// 單詞 Tooltip 組件
export const WordTooltip = ({ word, darkMode, onSpeak }) => {
  const [dictionary, setDictionary] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dict = getStoredData('wordDictionary', null);
    if (dict) { setDictionary(dict); }
    else { setDictionary(defaultDictionary); saveData('wordDictionary', defaultDictionary); }
  }, []);

  const wordData = dictionary ? dictionary[word.toLowerCase()] : null;
  const theme = darkMode ? { bg: '#2a2a2a', text: '#fff', sub: '#aaa' } : { bg: '#fff', text: '#333', sub: '#666' };

  if (!wordData) return <span>{word}</span>;

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{
        display: 'inline-block', padding: '2px 6px', margin: '2px', borderRadius: '4px',
        cursor: 'pointer', backgroundColor: darkMode ? '#333' : '#e8f5e9',
        transition: 'all 0.2s', fontWeight: 500
      }} onClick={(e) => { e.stopPropagation(); onSpeak && onSpeak(word); }}>
        {wordData.emoji} {word}
      </span>
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: theme.bg, color: theme.text, padding: '10px 14px', borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 999, minWidth: '130px',
          marginBottom: '8px', textAlign: 'center', animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{wordData.emoji} {word}</div>
          <div style={{ fontSize: '14px', color: theme.sub, marginBottom: '4px' }}>{wordData.zh}</div>
          <div style={{ fontSize: '11px', color: '#4CAF50', backgroundColor: darkMode ? '#1a3a1a' : '#e8f5e9', padding: '2px 8px', borderRadius: '10px', display: 'inline-block' }}>{wordData.pos}</div>
        </div>
      )}
    </span>
  );
};

// 速度控制組件
export const SpeedControl = ({ rate, onRateChange, darkMode }) => {
  const speeds = [{ value: 0.5, label: '0.5x' }, { value: 0.7, label: '0.7x' }, { value: 1.0, label: '1.0x' }];
  const theme = darkMode ? { active: '#4CAF50', inactive: '#333' } : { active: '#4CAF50', inactive: '#e0e0e0' };
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
      {speeds.map(s => (
        <button key={s.value} style={{ 
          padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer', 
          fontSize: '14px', fontWeight: rate === s.value ? 'bold' : 'normal', 
          backgroundColor: rate === s.value ? theme.active : theme.inactive, 
          color: rate === s.value ? 'white' : (darkMode ? '#aaa' : '#666') 
        }} onClick={() => onRateChange(s.value)}>{s.label}</button>
      ))}
    </div>
  );
};
