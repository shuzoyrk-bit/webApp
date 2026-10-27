import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHostEvents } from '../services/api'; 
import Button from '../components/Button';
import Layout from '../components/Layout';
import ui from '../components/CommonUI.module.css';
import { formatDateTime } from '../utils/datetime';

export default function HostEventList() {
  const navigate = useNavigate();

  const [underConsideration, setUnderConsideration] = useState([]); /* 1. 検討中 */
  const [confirmed, setConfirmed] = useState([]);                   /* 2. 確定済み */
  const [alreadyHeld, setAlreadyHeld] = useState([]);               /* 3. 開催済み */
  
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);     

  // 💡 【修正】localStorage から本物のログイン中ユーザーIDを取得。未ログイン時は空文字にする防御策
  const managerId = localStorage.getItem('login_user_id') || ""; 

  useEffect(() => {
    // 💡 防御ガード: もしユーザーIDが取得できない場合は、ログイン画面等へリダイレクトするかエラーにする
    if (!managerId) {
      setError("ログイン情報が見つかりません。再度ログインしてください。");
      setLoading(false);
      return;
    }

async function loadEvents() {
      try {
        setLoading(true);
        const data = await fetchHostEvents(managerId);
        
        // ⭕ バックエンドのデータキー（planning, confirmed, completed）に合わせて受け取る
        // かつ、内部のプロパティ名（event_id などのスネークケース）もキャメルケースに安全ガードする変換を挟みます
        const normalize = (list) => (list || []).map(event => ({
          eventId: event.eventId || event.event_id,
          eventName: event.eventName || event.event_name,
          deadlineForResponses: event.deadlineForResponses || event.deadline_for_responses,
          datetime: event.datetime,
          status: event.status
        }));

        setUnderConsideration(normalize(data.planning || data.underConsideration));
        setConfirmed(normalize(data.confirmed));
        setAlreadyHeld(normalize(data.completed || data.alreadyHeld));

      } catch (err) {
        console.error(err);
        setError(err.message || '幹事イベント一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [managerId]); // managerId を依存配列に追加

  if (loading) {
    return (
      <Layout title="幹事メニュー">
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>イベント一覧を読み込み中...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="幹事メニュー">
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#FF3B30', fontWeight: 'bold' }}>⚠️ {error}</p>
        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Button onClick={() => navigate('/login')} type="primary">ログイン画面へ</Button>
          <Button onClick={() => window.location.reload()} type="outline">再試行</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="幹事メニュー（主催イベント一覧）">
      
      {/* 1. 投票回答・検討中のイベント一覧 */}
      <h3 style={sectionTitleStyle}>📊 回答受付・調整中</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {underConsideration.map((event) => (
          <div key={event.eventId} className={ui.card} onClick={() => navigate(`/host/manage/${event.eventId}`)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={eventNameStyle}>{event.eventName}</span>
              <span style={badgeStyle}>回答待ち</span>
            </div>
            <p style={dateTextStyle}>⏳ 回答期限: {formatDateTime(event.deadlineForResponses, "未設定")}</p>
          </div>
        ))}
        {underConsideration.length === 0 && (
          <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', padding: '10px 0' }}>調整中のイベントはありません</p>
        )}
      </div>

      {/* 2. 開催日時が決定したイベント一覧 */}
      <h3 style={sectionTitleStyle}>🎉 開催確定（案内済み）</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {confirmed.map((event) => (
          <div key={event.eventId} className={ui.card} onClick={() => navigate(`/host/manage/${event.eventId}`)} style={{ cursor: 'pointer', borderColor: '#28a745' }}>
            <span style={eventNameStyle}>{event.eventName}</span>
            <p style={{ ...dateTextStyle, color: '#28a745', fontWeight: 'bold' }}>📅 確定日時: {formatDateTime(event.datetime, "未定")}</p>
          </div>
        ))}
        {confirmed.length === 0 && (
          <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', padding: '10px 0' }}>確定済みのイベントはありません</p>
        )}
      </div>

      {/* 3. 過去に終了したイベント一覧 */}
      <h3 style={sectionTitleStyle}>✅ 終了したイベント</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alreadyHeld.map((event) => (
          <div key={event.eventId} className={ui.card} style={{ background: '#f8fafc', opacity: 0.7 }}>
            <span style={{ ...eventNameStyle, color: '#64748b' }}>{event.eventName}</span>
            <p style={dateTextStyle}>開催日: {formatDateTime(event.datetime, "不明")}</p>
          </div>
        ))}
        {alreadyHeld.length === 0 && (
          <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', padding: '10px 0' }}>終了したイベントはありません</p>
        )}
      </div>

      {/* 新規作成ボタンエリア */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Button onClick={() => navigate('/host/create/step1')} type="primary" style={{ width: 'auto' }}>
          ＋ 新規作成
        </Button>
      </div>

      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <Button onClick={() => navigate('/top')} type="outline">
          トップメニューへ戻る
        </Button>
      </div>
    </Layout>
  );
}

const sectionTitleStyle = {
  fontSize: '1rem',
  margin: '20px 0 10px',
  borderLeft: '4px solid #007AFF',
  paddingLeft: '10px',
  fontWeight: 'bold'
};

const badgeStyle = {
  backgroundColor: '#FF3B30',
  color: 'white',
  fontSize: '0.65rem',
  padding: '3px 6px',
  borderRadius: '4px',
  fontWeight: 'bold',
  whiteSpace: 'nowrap'
};

const eventNameStyle = {
  fontSize: '1.05rem',
  fontWeight: 'bold',
  display: 'block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const dateTextStyle = {
  margin: '4px 0 0',
  fontSize: '0.8rem',
  color: '#666',
  textAlign: 'left'
};