import React, { useState, useEffect } from 'react';

// 成就徽章系統
const achievements = [
  { id: 'first_lesson', name: '初學者', desc: '完成第一堂課', icon: '🌟', requirement: 1 },
  { id: 'ten_lessons', name: '小試身手', desc: '完成 10 堂課', icon: '⭐', requirement: 10 },
  { id: 'fifty_lessons', name: '勤學不倦', desc: '完成 50 堂課', icon: '🏆', requirement: 50 },
  { id: 'hundred_lessons', name: '英語高手', desc: '完成 100 堂課', icon: '👑', requirement: 100 },
  { id: 'streak_3', name: '連續學習', desc: '連續學習 3 天', icon: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak_7', name: '一週堅持', desc: '連續學習 7 天', icon: '💪', requirement: 7, type: 'streak' },
  { id: 'streak_30', name: '一個月', desc: '連續學習 30 天', icon: '🎖️', requirement: 30, type: 'streak' },
  { id: 'perfect_quiz', name: '滿分達人', desc: '測驗全部正確', icon: '💯', requirement: 1, type: 'quiz' },
  { id: 'movie_fan', name: '影迷', desc: '完成 5 部電影', icon: '🎬', requirement: 5, type: 'movie' },
  { id: 'fairy_tale', name: '童話達人', desc: '完成 5 篇童話', icon: '📚', requirement: 5, type: 'fairy' },
  { id: 'speaking', name: '開口說', desc: '使用發音練習 10 次', icon: '🎤', requirement: 10, type: 'speak' },
  { id: 'grammar', name: '文法通', desc: '使用文法解析 10 次', icon: '📖', requirement: 10, type: 'grammar' },
];

// 社群功能组件
export function Community({ darkMode, onClose }) {
  const [userProfile, setUserProfile] = useState(() => {
    const stored = localStorage.getItem('userProfile');
    return stored ? JSON.parse(stored) : { name: '學習者', avatar: '👤', bio: '我正在學英文！', joinedDate: new Date().toISOString() };
  });
  const [achievementsData, setAchievementsData] = useState(() => {
    const stored = localStorage.getItem('achievements');
    return stored ? JSON.parse(stored) : { earned: [], stats: { totalLessons: 0, streak: 0, perfectQuizzes: 0, moviesCompleted: 0, fairyTalesCompleted: 0, pronunciationUsed: 0, grammarUsed: 0 } };
  });
  const [notes, setNotes] = useState(() => {
    const stored = localStorage.getItem('learningNotes');
    return stored ? JSON.parse(stored) : [];
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [newNote, setNewNote] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editBio, setEditBio] = useState(userProfile.bio);

  const theme = darkMode 
    ? { bg: '#1e1e1e', cardBg: '#2d2d2d', text: '#e0e0e0', accent: '#4CAF50', border: '#444' }
    : { bg: '#f5f5f5', cardBg: 'white', text: '#333', border: '#ddd' };

  // 計算已獲得的成就
  const earnedAchievements = achievements.filter(a => {
    const stats = achievementsData.stats;
    switch(a.type) {
      case 'streak': return stats.streak >= a.requirement;
      case 'quiz': return stats.perfectQuizzes >= a.requirement;
      case 'movie': return stats.moviesCompleted >= a.requirement;
      case 'fairy': return stats.fairyTalesCompleted >= a.requirement;
      case 'speak': return stats.pronunciationUsed >= a.requirement;
      case 'grammar': return stats.grammarUsed >= a.requirement;
      default: return stats.totalLessons >= a.requirement;
    }
  });

  const saveProfile = () => {
    const updated = { ...userProfile, name: editName, bio: editBio };
    setUserProfile(updated);
    localStorage.setItem('userProfile', JSON.stringify(updated));
    setEditingProfile(false);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note = { id: Date.now(), content: newNote, date: new Date().toISOString() };
    const updated = [note, ...notes];
    setNotes(updated);
    localStorage.setItem('learningNotes', JSON.stringify(updated));
    setNewNote('');
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('learningNotes', JSON.stringify(updated));
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    container: { backgroundColor: theme.cardBg, borderRadius: '16px', width: '90%', maxWidth: '500px', maxHeight: '85vh', overflow: 'auto', padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '20px', fontWeight: 'bold', color: theme.text },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text },
    tabs: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' },
    tab: { padding: '10px 15px', border: 'none', backgroundColor: 'transparent', color: theme.text + '80', cursor: 'pointer', fontSize: '14px', borderRadius: '8px' },
    activeTab: { backgroundColor: theme.accent, color: 'white' },
    profileSection: { textAlign: 'center', marginBottom: '20px' },
    avatar: { fontSize: '80px', marginBottom: '10px' },
    name: { fontSize: '24px', fontWeight: 'bold', color: theme.text, marginBottom: '5px' },
    bio: { fontSize: '14px', color: theme.text + '99', marginBottom: '10px' },
    editBtn: { padding: '8px 20px', borderRadius: '20px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.text, cursor: 'pointer' },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '20px' },
    statCard: { backgroundColor: theme.bg, padding: '15px', borderRadius: '12px', textAlign: 'center' },
    statNumber: { fontSize: '24px', fontWeight: 'bold', color: theme.accent },
    statLabel: { fontSize: '12px', color: theme.text + '99' },
    achievements: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '15px' },
    achievement: { backgroundColor: theme.bg, padding: '15px', borderRadius: '12px', textAlign: 'center', opacity: 0.5 },
    earnedAchievement: { opacity: 1, border: `2px solid ${theme.accent}` },
    achievementIcon: { fontSize: '30px', marginBottom: '5px' },
    achievementName: { fontSize: '12px', color: theme.text, fontWeight: 'bold' },
    achievementDesc: { fontSize: '10px', color: theme.text + '99' },
    notesList: { maxHeight: '300px', overflowY: 'auto' },
    noteCard: { backgroundColor: theme.bg, padding: '15px', borderRadius: '12px', marginBottom: '10px' },
    noteContent: { fontSize: '14px', color: theme.text, marginBottom: '8px' },
    noteDate: { fontSize: '12px', color: theme.text + '70' },
    noteInput: { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginBottom: '10px', minHeight: '80px' },
    addBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', fontWeight: 'bold' },
    editForm: { marginTop: '15px', padding: '15px', backgroundColor: theme.bg, borderRadius: '12px' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.cardBg, color: theme.text, marginBottom: '10px' },
    saveBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: theme.accent, color: 'white', cursor: 'pointer', marginRight: '10px' },
    cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.text, cursor: 'pointer' }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>👥 個人中心</div>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.tabs}>
          <button style={{...styles.tab, ...(activeTab === 'profile' ? styles.activeTab : {})}} onClick={() => setActiveTab('profile')}>👤 個人資料</button>
          <button style={{...styles.tab, ...(activeTab === 'achievements' ? styles.activeTab : {})}} onClick={() => setActiveTab('achievements')}>🏆 成就</button>
          <button style={{...styles.tab, ...(activeTab === 'notes' ? styles.activeTab : {})}} onClick={() => setActiveTab('notes')}>📝 筆記</button>
        </div>

        {activeTab === 'profile' && (
          <div>
            <div style={styles.profileSection}>
              <div style={styles.avatar}>{userProfile.avatar}</div>
              {!editingProfile ? (
                <>
                  <div style={styles.name}>{userProfile.name}</div>
                  <div style={styles.bio}>{userProfile.bio}</div>
                  <button style={styles.editBtn} onClick={() => setEditingProfile(true)}>編輯資料</button>
                </>
              ) : (
                <div style={styles.editForm}>
                  <input 
                    style={styles.input}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="你的名字"
                  />
                  <input 
                    style={styles.input}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="個人簡介"
                  />
                  <button style={styles.saveBtn} onClick={saveProfile}>儲存</button>
                  <button style={styles.cancelBtn} onClick={() => setEditingProfile(false)}>取消</button>
                </div>
              )}
            </div>

            <div style={styles.stats}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{achievementsData.stats.totalLessons}</div>
                <div style={styles.statLabel}>總學習堂數</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{achievementsData.stats.streak}</div>
                <div style={styles.statLabel}>連續天數</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{earnedAchievements.length}</div>
                <div style={styles.statLabel}>獲得成就</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{notes.length}</div>
                <div style={styles.statLabel}>學習筆記</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '15px', color: theme.text }}>
              已獲得 {earnedAchievements.length} / {achievements.length} 個成就
            </div>
            <div style={styles.achievements}>
              {achievements.map(achievement => {
                const isEarned = earnedAchievements.find(a => a.id === achievement.id);
                return (
                  <div key={achievement.id} style={{...styles.achievement, ...(isEarned ? styles.earnedAchievement : {})}}>
                    <div style={styles.achievementIcon}>{achievement.icon}</div>
                    <div style={styles.achievementName}>{achievement.name}</div>
                    <div style={styles.achievementDesc}>{achievement.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <textarea
              style={styles.noteInput}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="寫下你的學習筆記..."
            />
            <button style={styles.addBtn} onClick={addNote}>新增筆記</button>
            <div style={{ ...styles.notesList, marginTop: '20px' }}>
              {notes.length === 0 ? (
                <div style={{ textAlign: 'center', color: theme.text + '70', padding: '20px' }}>
                  還沒有筆記，開始記錄你的學習吧！
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} style={styles.noteCard}>
                    <div style={styles.noteContent}>{note.content}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={styles.noteDate}>{new Date(note.date).toLocaleDateString('zh-TW')}</div>
                      <button 
                        onClick={() => deleteNote(note.id)}
                        style={{ background: 'none', border: 'none', color: theme.text + '70', cursor: 'pointer', fontSize: '12px' }}
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Community;
