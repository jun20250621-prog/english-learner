import React, { useState } from 'react';

export function AdvancedLearning({ darkMode, onClose }) {
  const [currentTopic, setCurrentTopic] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const topics = [
    {
      type: 'business-letter',
      title: '📝 商業書信',
      items: [
        {
          title: '求職信 - Job Application',
          content: `Dear Hiring Manager,

I am writing to apply for the position of Marketing Manager at your company. With 5 years of experience in digital marketing and a proven track record of increasing brand awareness, I believe I am the ideal candidate for this role.

In my current position at ABC Corp, I successfully led campaigns that generated 200% ROI and increased social media engagement by 150%.

I would welcome the opportunity to discuss how my skills and experience align with your needs.

Best regards,
John Chen`,
          translation: `敬啟者：

我寫信應徵貴公司的行銷經理職位。我擁有 5 年數位行銷經驗，並有成功提升品牌知名度的記錄，相信我是此職位的理想人選。

在我目前任職的 ABC 公司，我成功領導的行銷活動帶來 200% 投資報酬率，並將社群媒體互動率提升 150%。

我很榮幸能有機會與您討論我的技能和經驗如何符合您的需求。

誠摯敬禮
陳約翰`,
          keyWords: ['Hiring Manager 招聘經理', 'proven track record 成功記錄', 'ROI 投資報酬率', 'brand awareness 品牌知名度']
        },
        {
          title: '商務 Email - Business Email',
          content: `Dear Mr. Smith,

Thank you for your inquiry regarding our products. I am pleased to provide you with the information you requested.

Regarding your question about pricing, we offer the following options:
- Standard: $100/unit
- Premium: $150/unit

For orders over 500 units, we can offer a 15% discount.

Please let me know if you need any further information.

Best regards,
Mary Lee
Sales Department`,
          translation: `親愛的史密斯先生：

感謝您詢問我們的產品。很高興能提供您所需的資訊。

關於您對價格的問題，我們提供以下選項：
- 標準版：每件 100 美元
- 高級版：每件 150 美元

訂購超過 500 件，我們可以提供 85 折優惠。

如需任何進一步資訊，請告訴我。

誠摯敬禮
業務部 李瑪麗`,
          keyWords: ['inquiry 詢問', 'pricing 價格', 'discount 折扣', 'order 訂單']
        }
      ]
    },
    {
      type: 'exam-tips',
      title: '🎯 多益/雅思高分技巧',
      items: [
        {
          title: '多益聽力技巧',
          content: `## TOEIC Listening Tips

1. **提前閱讀選項**
   - 在播放題目前提早瀏覽四個選項
   - 找出關鍵字：數字、日期、地點

2. **注意問句類型**
   - What/When/Where/Who/Why/How
   - 不同問句有不同答題重點

3. **聽關鍵轉折詞**
   - But, However, Although, However
   - 通常答案在轉折詞之後

4. **時間管理**
   - 每題約 5 秒作答時間
   - 不確定的題目先猜答案`,
          translation: `## 多益聽力技巧

1. 提前閱讀選項 - 在播放題目前提早瀏覽四個選項
2. 注意問句類型 - What/When/Where/Who/Why/How
3. 聽關鍵轉折詞 - But, However, Although
4. 時間管理 - 每題約 5 秒作答時間`,
          keyWords: ['提前閱讀', '關鍵字', '轉折詞', '時間管理']
        },
        {
          title: '雅思寫作技巧',
          content: `## IELTS Writing Tips

**Task 1 (圖表寫作)**
1. 開頭：概述圖表主要趨勢
2. 主體：描述主要特徵/數據
3. 結尾：簡短總結

**Task 2 (論說文)**
1. 開頭：明確表達立場
2. 主體：2-3 個論點，每個論點需舉例
3. 結尾：總結立場

**高分關鍵**
- 使用多樣化的句型
- 適當使用連接詞 (Furthermore, However, Consequently)
- 字數需達標 (Task 1: 150+, Task 2: 250+)`,
          translation: `## 雅思寫作技巧

圖表寫作：概述趨勢、描述特徵、簡短總結
論說文：明確立場、論點舉例、總結立場
高分關鍵：多樣句型、連接詞、字數達標`,
          keyWords: ['圖表趨勢', '論點', '連接詞', '字數']
        }
      ]
    }
  ];

  const current = topics[currentTopic];
  const currentItem = current?.items?.[0] || { title: '', content: '', translation: '', keyWords: [] };

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', accent: '#4CAF50', border: '#444' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', accent: '#2196F3', border: '#ddd' };

  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.7;
    speechSynthesis.speak(u);
  };

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: theme.bg, minHeight: '100vh', color: theme.text },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
    tab: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid ' + theme.border, backgroundColor: theme.cardBg, color: theme.text, cursor: 'pointer', textAlign: 'center' },
    activeTab: { backgroundColor: theme.accent, color: 'white', borderColor: theme.accent },
    card: { backgroundColor: theme.cardBg, borderRadius: '12px', padding: '20px', marginBottom: '15px' },
    itemTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' },
    content: { fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '15px' },
    translation: { fontSize: '13px', color: theme.text + '99', fontStyle: 'italic', padding: '12px', backgroundColor: theme.bg, borderRadius: '8px', marginBottom: '15px' },
    keywords: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    keyword: { fontSize: '12px', padding: '4px 10px', backgroundColor: theme.accent + '20', color: theme.accent, borderRadius: '12px' },
    buttons: { display: 'flex', gap: '10px', marginTop: '15px' },
    btn: { flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', fontSize: '14px' },
    secondaryBtn: { backgroundColor: theme.border, color: theme.text }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>📚 進階學習</div>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      <div style={styles.tabs}>
        {topics.map((t, idx) => (
          <button 
            key={idx}
            style={{...styles.tab, ...(currentTopic === idx ? styles.activeTab : {})}}
            onClick={() => { setCurrentTopic(idx); setShowAnswer(false); }}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.itemTitle}>{currentItem.title}</div>
        
        <div style={styles.content}>
          {currentItem.content.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        <button 
          style={{...styles.btn, ...styles.secondaryBtn, marginBottom: '15px'}}
          onClick={() => speak(currentItem.content)}
        >
          🔊 朗讀
        </button>

        <button 
          style={{...styles.btn, marginBottom: '15px'}}
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? '🙈 隱藏翻譯' : '👁️ 顯示翻譯'}
        </button>

        {showAnswer && (
          <div style={styles.translation}>
            {currentItem.translation}
          </div>
        )}

        {currentItem.keyWords && currentItem.keyWords.length > 0 && (
          <div style={styles.keywords}>
            {currentItem.keyWords.map((kw, i) => (
              <span key={i} style={styles.keyword}>{kw}</span>
            ))}
          </div>
        )}
      </div>

      <div style={styles.buttons}>
        <button style={{...styles.btn, ...styles.secondaryBtn}} onClick={onClose}>
          ← 返回
        </button>
      </div>
    </div>
  );
}

export default AdvancedLearning;
