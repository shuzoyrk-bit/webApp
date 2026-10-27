import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGuestEvents } from '../services/api';
import Button from '../components/Button';
import Layout from '../components/Layout';
import ui from '../components/CommonUI.module.css';
import { formatDateTime } from '../utils/datetime';

// スネークケース／キャメルケース両対応でイベントを正規化
function normalizeEvent(event) {
  if (!event) return null;
  return {
    eventId: event.eventId || event.event_id,
    eventName: event.eventName || event.event_name,
    deadlineForResponses: event.deadlineForResponses || event.deadline_for_responses,
    managerName: event.managerName || event.manager_name
  };
}

// セクションごとの見た目定義（未回答／回答済み／開催済み）
const SECTIONS = [
  {
    key: 'unanswered',
    title: '未回答',
    badgeText: '未回答',
    badgeBgColor: '#FF9500',
    borderStyle: '1px solid #FF9500'
  },
  {
    key: 'answered',
    title: '回答済み',
    badgeText: '回答済み',
    badgeBgColor: '#007AFF',
    borderStyle: '1px solid #e4e5e0'
  },
  {
    key: 'held',
    title: '開催済み',
    badgeText: '開催済み',
    badgeBgColor: '#8e8e93',
    borderStyle: '1px solid #e4e5e0'
  }
];

export default function GuestEventList() {
  const navigate = useNavigate();

  // セクションキーごとにイベント配列を保持する
  const [grouped, setGrouped] = useState({ unanswered: [], answered: [], held: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const participantId = localStorage.getItem('login_user_id') || "";

  useEffect(() => {
    if (!participantId) {
      setError("ログイン情報が見つかりません。再度ログインしてください。");
      setLoading(false);
      return;
    }

    async function loadEvents() {
      try {
        setLoading(true);
        const rawData = await fetchGuestEvents(participantId);

        // 配列でそのまま返ってきた場合は「未回答」扱いのフォールバック
        if (Array.isArray(rawData)) {
          setGrouped({
            unanswered: rawData.map(normalizeEvent).filter(Boolean),
            answered: [],
            held: []
          });
          return;
        }

        // { status, data: {...} } の入れ子にも、data 直下にも対応
        const targetData =
          rawData && rawData.data ? rawData.data : (rawData || {});

        const nextGrouped = {};
        for (const section of SECTIONS) {
          nextGrouped[section.key] = (targetData[section.key] || [])
            .map(normalizeEvent)
            .filter(Boolean);
        }
        setGrouped(nextGrouped);
      } catch (err) {
        console.error(err);
        setError(err.message || '参加イベント一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [participantId]);

  // 1件分のカード描画（セクションごとのバッジ設定を受け取る）
  function renderCard(event, section) {
    return (
      <div
        key={event.eventId}
        className={ui.card}
        onClick={() => navigate(`/guest/detail/${event.eventId}`)}
        style={{ cursor: 'pointer', border: section.borderStyle }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 'bold', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {event.eventName}
          </span>
          <span style={{ ...badgeStyle, backgroundColor: section.badgeBgColor }}>
            {section.badgeText}
          </span>
        </div>
        {event.managerName && (
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666', textAlign: 'left' }}>
            👤 幹事: {event.managerName}
          </p>
        )}
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666', textAlign: 'left' }}>
          ⏳ 回答期限: {formatDateTime(event.deadlineForResponses, "未設定")}
        </p>
      </div>
    );
  }

  // 見出しつきセクション（中身が空なら描画しない）
  function renderSection(section) {
    const list = grouped[section.key] || [];
    if (list.length === 0) return null;
    return (
      <div key={section.key} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        <h3 style={sectionTitleStyle}>{section.title}（{list.length}）</h3>
        {list.map((event) => renderCard(event, section))}
      </div>
    );
  }

  if (loading) {
    return (
      <Layout title="参加者メニュー">
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>イベント一覧を読み込み中...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="参加者メニュー">
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#FF3B30', fontWeight: 'bold' }}>⚠️ {error}</p>
        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Button onClick={() => navigate('/login')} type="primary">ログイン画面へ</Button>
          <Button onClick={() => window.location.reload()} type="outline">再試行</Button>
        </div>
      </Layout>
    );
  }

  const isEmpty = SECTIONS.every((section) => (grouped[section.key] || []).length === 0);

  return (
    <Layout title="参加者メニュー（招待されたイベント一覧）">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
        {SECTIONS.map(renderSection)}

        {isEmpty && (
          <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
            招待されているイベントはありません
          </p>
        )}
      </div>

      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <Button onClick={() => navigate('/top')} type="outline">
          トップメニューへ戻る
        </Button>
      </div>
    </Layout>
  );
}

const badgeStyle = {
  color: 'white',
  fontSize: '0.65rem',
  padding: '3px 6px',
  borderRadius: '4px',
  fontWeight: 'bold',
  whiteSpace: 'nowrap'
};

const sectionTitleStyle = {
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: '#333',
  margin: '0 0 4px',
  paddingBottom: '6px',
  borderBottom: '2px solid #eee',
  textAlign: 'left'
};
