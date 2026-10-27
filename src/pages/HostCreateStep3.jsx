import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createEvent } from '../services/api'; 
import Button from '../components/Button';
import Layout from '../components/Layout';
import ui from '../components/CommonUI.module.css';

export default function HostCreateStep3() {
  const navigate = useNavigate();
  const location = useLocation();

  const accumulatedData = location.state || {};

  const [searchId, setSearchId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedUsers, setSelectedUsers] = useState(() => {
    const saved = sessionStorage.getItem('draft_step3_users');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  useEffect(() => {
    sessionStorage.setItem('draft_step3_users', JSON.stringify(selectedUsers));
  }, [selectedUsers]);

  const handleAddUser = () => {
    const trimmedId = searchId.trim();
    if (!trimmedId) {
      alert('ユーザーIDを入力してください');
      return;
    }
    if (selectedUsers.includes(trimmedId)) {
      alert('既に一覧に追加されているユーザーです');
      return;
    }
    setSelectedUsers([...selectedUsers, trimmedId]);
    setSearchId('');
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userId));
  };

// 最終送信（イベント新規作成APIの呼び出し）
  const handleSubmit = async () => {
    if (!deadline) {
      alert('回答期限を設定してください');
      return;
    }
    if (selectedUsers.length === 0) {
      alert('招待するメンバーを1人以上追加してください');
      return;
    }

    const managerId = localStorage.getItem('login_user_id') || "";
    if (!managerId) {
      alert('ログインセッションが切れています。再度ログインしてください。');
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      // 1. candidate_areas の安全な抽出
      const finalCandidateAreas = [];
      const rawAreas = accumulatedData.areaCandidate || [];
      if (Array.isArray(rawAreas)) {
        for (let i = 0; i < rawAreas.length; i++) {
          if (rawAreas[i]) {
            finalCandidateAreas.push(String(rawAreas[i]).trim());
          }
        }
      }

      // 2. candidate_dates のフォーマット正常化（"〜" 以降の終了時間を綺麗にカット）
      const finalCandidateDates = [];
      const rawDates = accumulatedData.dateCandidates || [];
      if (Array.isArray(rawDates)) {
        for (let i = 0; i < rawDates.length; i++) {
          if (rawDates[i]) {
            let dateStr = String(rawDates[i]).trim();
            
            // 💡 "2026-07-21 18:00〜21:00" のような文字列から "〜" より前だけを抽出する
            if (dateStr.includes('〜')) {
              dateStr = dateStr.split('〜')[0].trim();
            } else if (dateStr.includes('~')) {
              dateStr = dateStr.split('~')[0].trim();
            }
            
            finalCandidateDates.push(dateStr);
          }
        }
      }

      // 3. response_deadline を "%Y-%m-%d %H:%M" フォーマットにビルド
      let finalResponseDeadline = String(deadline).trim();
      if (finalResponseDeadline.length === 10) {
        finalResponseDeadline = finalResponseDeadline + " 23:59";
      }

      // 4. desired_budget の数値変換 (0 または 1)
      let finalDesiredBudget = accumulatedData.budgetChoice === true ? 1 : 0;

      // バックエンドの要求スキーマに完全適合させたペイロード
      const eventPayload = {
        manager_id: String(managerId).trim(),
        event_name: String(accumulatedData.eventName || "無題のイベント").trim(),
        response_deadline: finalResponseDeadline,
        description: "", 
        candidate_dates: finalCandidateDates, 
        candidate_areas: finalCandidateAreas,
        desired_budget: finalDesiredBudget,
        participants: selectedUsers.map(id => String(id).trim())
      };

      console.log("バックエンド日時検証パス用ペイロード:", eventPayload);

      await createEvent(eventPayload);

      sessionStorage.removeItem('draft_step1_name');
      sessionStorage.removeItem('draft_step1_budget');
      sessionStorage.removeItem('draft_step1_areas');
      sessionStorage.removeItem('draft_step3_users');

      alert('🎉 イベントの新規作成が完了しました！');
      navigate('/host/list');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'イベントの作成処理に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout
      title={
        <>
          イベントの新規作成<br />
          期限・メンバー設定 (3/3)
        </>
      }
    >
      <div className={ui.header}>
        <h3>回答期限の設定</h3>
      </div>
      <div className={ui.card}>
        <label style={labelStyle}>📥 回答の締め切り日時</label>
        <input
          type="date"
          className={ui.input}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          onClick={(e) => e.target.showPicker?.()}
          style={{ cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      <div className={ui.header} style={{ marginTop: '24px' }}>
        <h3>招待メンバーの追加</h3>
      </div>
      <div className={ui.card}>
        <label style={labelStyle}>🔍 ユーザーIDで直接検索追加</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
          <input
            type="text"
            className={ui.input}
            placeholder="例: user123"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{ margin: 0, flex: 1 }}
          />
          <Button onClick={handleAddUser} type="outline" style={searchBtnStyle}>
            追加
          </Button>
        </div>

        <label style={labelStyle}>👥 選択された招待メンバー ({selectedUsers.length}人)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {selectedUsers.map((userId) => (
            <div key={userId} style={selectedUserBadgeStyle}>
              <span>{userId}</span>
              <span onClick={() => handleRemoveUser(userId)} style={removeIconStyle}>×</span>
            </div>
          ))}
          {selectedUsers.length === 0 && (
            <p style={{ color: '#999', fontSize: '0.85rem', width: '100%', textAlign: 'center', margin: '10px 0' }}>
              招待するメンバーが追加されていません
            </p>
          )}
        </div>
      </div>

      {errorMessage && (
        <p style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: '0.85rem', margin: '15px 0', textAlign: 'center' }}>
          ⚠️ {errorMessage}
        </p>
      )}

      <div style={{ marginTop: '30px' }}>
        <Button onClick={handleSubmit} type="primary" style={{ width: '100%' }} disabled={isSubmitting}>
          {isSubmitting ? 'イベントを作成中...' : '🚀 この内容でイベントを確定・作成'}
        </Button>
      </div>

      <div style={{ marginTop: '15px' }}>
        <Button
          onClick={() => navigate('/host/create/step2', { state: accumulatedData })}
          type="outline"
          disabled={isSubmitting}
        >
          前に戻る
        </Button>
      </div>
    </Layout>
  );
}

const labelStyle = { 
  display: 'block', 
  fontSize: '0.8rem', 
  fontWeight: 'bold', 
  marginBottom: '5px', 
  color: '#555',
  textAlign: 'left'
};

const searchBtnStyle = {
  padding: '0 16px',
  height: '42px',
  whiteSpace: 'nowrap',
  flexShrink: 0
};

const selectedUserBadgeStyle = {
  background: '#007AFF',
  color: 'white',
  borderRadius: '20px',
  padding: '6px 14px',
  fontSize: '0.85rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 'bold'
};

const removeIconStyle = {
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.3)',
  borderRadius: '50%',
  width: '16px',
  height: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem'
};