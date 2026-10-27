import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAdminEventDetail, confirmEvent } from '../services/api'; // API関数をインポート
import Button from '../components/Button';
import Layout from '../components/Layout';
import ui from '../components/CommonUI.module.css';

export default function HostEventManage() {
  const navigate = useNavigate();
  const { id } = useParams(); // イベントID

  // 現在の表示タブを管理するState
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'detail' | 'confirm'

  //  APIから取得する集計・詳細データを管理するState
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  【最終確定フォーム用】入力値を管理するState
  const [finalDatetime, setFinalDatetime] = useState('');
  const [finalShopName, setFinalShopName] = useState('');
  const [finalBudget, setFinalBudget] = useState('');
  const [finalComment, setFinalComment] = useState('');

  // 送信中の多重タップ防止
  const [isSubmitting, setIsSubmitting] = useState(false);

  //  1. 画面起動時にAPIから集計結果・参加者回答データを一括取得
  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const apiResponse = await fetchAdminEventDetail(id);

        if (apiResponse) {
          const data = apiResponse; 
          const participantResponses = data.participantResponses || [];

          // 名前デコード関数
          const decodeName = (str, userId) => {
            if (!str) return userId;
            try {
              return decodeURIComponent(escape(str));
            } catch (e) { return str; }
          };

          // 回答者ごとの詳細データ変換
          const guestResponses = participantResponses.map(p => ({
            name: decodeName(p.userName, p.userId),
            dateAnswers: (p.dateResponses || []).map(dr => ({
              datetime: dr.datetime || "日時未定",
              status: dr.status || (dr.score === 5 ? "○" : dr.score === 3 ? "△" : "×"),
              comment: dr.comment || ""
            })),
            wishArea: p.preferredArea || "未設定",
            wishBudget: p.preferredBudget || 0,
            generalComment: p.overallComment || ""
          }));

          // 回答済みのメンバー一覧を生成
          const repliedNames = participantResponses
            .filter(p => p.dateResponses && p.dateResponses.length > 0)
            .map(p => decodeName(p.userName, p.userId));

          // 集計データの記号別カウントを生成
          const dateSummaries = (data.dateSummaries || []).map(d => ({
            ...d,
            counts: participantResponses.reduce((acc, p) => {
              const ans = p.dateResponses?.find(r => r.dateCandidateId === d.dateCandidateId);
              if (ans) {
                const statusStr = ans.score === 5 ? "○" : ans.score === 3 ? "△" : "×";
                acc[statusStr] = (acc[statusStr] || 0) + 1;
              }
              return acc;
            }, { "○": 0, "△": 0, "×": 0 })
          }));

          setEventData({
            ...data,
            dateSummaries,
            guestResponses,
            repliedNames,
            invitedCount: data.totalParticipants || participantResponses.length,
            answeredCount: data.replyCount || 0
          });
        } else {
          setError('イベントデータが見つかりませんでした');
        }
      } catch (err) {
        console.error(err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [id]);

  //  2. 最終確定内容を本物のAPIへ送信する処理
  async function handleConfirmSubmit(e) {
    e.preventDefault();

    if (!finalDatetime) {
      alert('確定日時を選択してください。');
      return;
    }

    const isReady = window.confirm("この内容でイベントを最終確定し、参加者全員へ通知してよろしいですか？");
    if (!isReady) return;

    try {
      setIsSubmitting(true);

      const summaries = eventData?.dateSummaries || [];
      const selectedChoice = summaries.find(d => d.datetime === finalDatetime);
      const confirmedDatetimeId = selectedChoice ? (selectedChoice.dateCandidateId || selectedChoice.id) : 1;

      const areaPrefs = eventData?.areaPreferences || [];
      const confirmedAreaId = areaPrefs.length > 0 ? (areaPrefs[0].area_id || areaPrefs[0].id) : 1;

      const requestPayload = {
        event_id: Number(id),
        confirmed_datetime_id: Number(confirmedDatetimeId),
        confirmed_area_id: Number(confirmedAreaId),
        confirmed_shop_name: finalShopName || "未定",
        confirmed_budget: Number(finalBudget.replace(/[^0-9]/g, '')) || 0, 
        payment_destination: "当日集金、または別途連絡",
        paypay_link: null
      };

      await confirmEvent(requestPayload);

      alert("イベントの開催内容を確定しました！参加者へ通知が送信されます。");
      navigate('/host/list');

    } catch (err) {
      console.error(err);
      alert(err.message || 'イベントの確定処理に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  }

  // 💡 ロード中画面
  if (loading) {
    return (
      <Layout title="回答集計・確定">
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>集計データを読み込み中...</p>
      </Layout>
    );
  }

  // 💡 エラー画面
  if (error) {
    return (
      <Layout title="回答集計・確定">
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#FF3B30', fontWeight: 'bold' }}>⚠️ {error}</p>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button onClick={() => window.location.reload()} type="primary">再試行</Button>
        </div>
      </Layout>
    );
  }

  // 💡 安全対策ガード：データがまだ無い場合は何も描画しない（エラーで落とさない）
  if (!eventData) return null;

  // APIデータから値を抽出
  const invitedCount = eventData.invitedCount || 0;
  const answeredCount = eventData.answeredCount || 0;
  const unrepliedCount = invitedCount - answeredCount;

  // 各タブの内容を管理する要素オブジェクト
  let tabContentElement = null;

  //  【タブ1：集計状況】
  if (activeTab === 'summary') {
    tabContentElement = (
      <div style={{ width: '100%' }}>
        {/* 回答ステータスサマリー */}
        <div className={ui.card} style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', background: '#f8fafc' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>招待数</p>
            <strong style={{ fontSize: '1.2rem', color: '#334155' }}>{invitedCount}人</strong>
          </div>
          <div style={{ borderLeft: '1px solid #e2e8f0' }}></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#16a34a' }}>回答済</p>
            <strong style={{ fontSize: '1.2rem', color: '#16a34a' }}>{answeredCount}人</strong>
          </div>
          <div style={{ borderLeft: '1px solid #e2e8f0' }}></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#dc2626' }}>未回答</p>
            <strong style={{ fontSize: '1.2rem', color: '#dc2626' }}>{unrepliedCount}人</strong>
          </div>
        </div>

        {/* メンバー内訳 */}
        <div className={ui.card}>
          <h4 style={sectionLabel}>現在の回答回収ステータス</h4>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#16a34a', display: 'block', marginBottom: '6px' }}>✅ 回答完了メンバー</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {Array.isArray(eventData.repliedNames) && eventData.repliedNames.length > 0 ? (
                eventData.repliedNames.map((name, i) => (
                  <span key={i} style={badgeStyle('#f0fdf4', '#bbf7d0', '#16a34a')}>{name}</span>
                ))
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>まだ回答者は存在しません</span>
              )}
            </div>
          </div>
        </div>

        {/* 日程集計結果 */}
        <div className={ui.card}>
          <h4 style={sectionLabel}>⏰ 候補日スコア（おすすめ順）</h4>
          {Array.isArray(eventData.dateSummaries) && [...eventData.dateSummaries].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)).map((d, i) => (
            <div key={i} style={resultRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontStyle: 'normal', fontWeight: 'bold', fontSize: '0.9rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.datetime ? d.datetime.replace('T', ' ') : "日時未定"}
                </span>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                  内訳: ○:{d.counts?.['○'] || 0}人, △:{d.counts?.['△'] || 0}人, ×:{d.counts?.['×'] || 0}人
                </p>
              </div>
              <div style={scoreBadge}>{d.totalScore || 0}点</div>
            </div>
          ))}
        </div>

        {/* 希望エリア・予算集計 */}
        <div className={ui.card}>
          <h4 style={sectionLabel}>🗺️ 希望エリア・予算の傾向</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#007AFF', display: 'block', marginBottom: '6px' }}>📍 希望エリア一覧</span>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#334155' }}>
                {Array.isArray(eventData.areaPreferences) && eventData.areaPreferences.length > 0 ? (
                  eventData.areaPreferences.map((item, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>
                      <strong>{item.area || "未設定"}</strong> ({item.count || 0}票)
                    </li>
                  ))
                ) : (
                  <li style={{ color: '#64748b' }}>エリア希望はありません</li>
                )}
              </ul>
            </div>
            <div style={{ background: '#fef9c3', padding: '12px', borderRadius: '8px', border: '1px solid #fef08a', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ca8a04', display: 'block', marginBottom: '4px' }}>💰 希望予算の平均値</span>
              <strong style={{ fontSize: '1.3rem', color: '#a16207' }}>
                {eventData.budgetSummary?.average ? `${Math.round(eventData.budgetSummary.average).toLocaleString()} 円` : '選択なし'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 【タブ2：参加者ごとの回答詳細】
  if (activeTab === 'detail') {
    tabContentElement = (
      <div className={ui.card} style={{ width: '100%' }}>
        <h4 style={sectionLabel}>参加者ごとの個別回答データ</h4>
        {Array.isArray(eventData.guestResponses) && eventData.guestResponses.map((guest, idx) => (
          <div key={idx} style={guestCardStyle}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>👤 {guest.name}</div>

            {/* 日程ごとの記号表示 */}
            {guest.dateAnswers && guest.dateAnswers.length > 0 ? (
              guest.dateAnswers.map((ans, i) => (
                <div key={i} style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '4px' }}>
                  <strong>{ans.datetime ? ans.datetime.replace('T', ' ') : "未定"}:</strong>
                  <span style={{ fontWeight: 'bold', color: '#007AFF', marginLeft: '5px' }}>{ans.status}</span>
                  {ans.comment && <span style={commentBubble}>{ans.comment}</span>}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#dc2626', fontStyle: 'italic' }}>⚠️ 未回答のユーザーです</div>
            )}

            {/* 場所と予算の表示 */}
            <div style={{ marginTop: '10px', fontSize: '0.75rem', background: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
              <div>📍 希望場所: {guest.wishArea || "未設定"}</div>
              <div>💰 希望予算: {guest.wishBudget > 0 ? `${guest.wishBudget.toLocaleString()}円` : '未設定'}</div>
              {guest.generalComment && <div style={{ marginTop: '4px', color: '#64748b' }}>💬 一言: {guest.generalComment}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  //  【タブ3：最終内容の確定】
  if (activeTab === 'confirm') {
    tabContentElement = (
      <form onSubmit={handleConfirmSubmit} style={{ width: '100%' }}>
        <div className={ui.card} style={{ border: '2px solid #28a745', textAlign: 'left' }}>
          <h4 style={sectionLabel}>イベントスケジュール・開催決定</h4>

          <label style={inputLabel}>開催日時の決定 <span style={{ color: '#dc2626' }}>*</span></label>
          <select
            className={ui.input}
            value={finalDatetime}
            onChange={(e) => setFinalDatetime(e.target.value)}
            required
          >
            <option value="">選択してください</option>
            {(() => {
              const summaries = eventData.dateSummaries || [];
              return summaries.map((d, i) => (
                <option key={i} value={d.datetime}>
                  {d.datetime ? d.datetime.replace('T', ' ') : ""} ({d.totalScore || 0}点)
                </option>
              ));
            })()}
          </select>

          <label style={inputLabel}>決定した店名・場所</label>
          <input
            type="text"
            className={ui.input}
            placeholder="例：そばの木 池袋店"
            value={finalShopName}
            onChange={(e) => setFinalShopName(e.target.value)}
          />

          <label style={inputLabel}>会費・予算（目安）</label>
          <input
            type="text"
            className={ui.input}
            placeholder="例：5,000円"
            value={finalBudget}
            onChange={(e) => setFinalBudget(e.target.value)}
          />

          <label style={inputLabel}>参加者への伝言・連絡事項（備考）</label>
          <textarea
            className={ui.input}
            placeholder="集合場所や、遅れる場合の連絡方法など"
            rows="3"
            value={finalComment}
            onChange={(e) => setFinalComment(e.target.value)}
            style={{ height: 'auto', padding: '10px' }}
          />
        </div>

        <Button type="primary" disabled={isSubmitting} style={{ width: '100%', marginTop: '15px' }}>
          {isSubmitting ? "確定処理中..." : "この内容でイベントを確定・通知する"}
        </Button>
      </form>
    );
  }

  return (
    <Layout title="回答集計・最終確定">
      <div className={ui.header} style={{ textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{eventData.eventName || 'イベント管理'}</h2>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
          🗓️ アンケート回答期限: {eventData.deadlineForResponses ? eventData.deadlineForResponses.replace('T', ' ') : '設定なし'}
        </p>
      </div>

      {/* スマホ対応：3つのタブメニュー */}
      <div style={tabContainerStyle}>
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          style={{ ...tabItemStyle, ...(activeTab === 'summary' ? activeTabStyle : {}) }}
        >
          📊 集計
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('detail')}
          style={{ ...tabItemStyle, ...(activeTab === 'detail' ? activeTabStyle : {}) }}
        >
          👤 詳細
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('confirm')}
          style={{ ...tabItemStyle, ...(activeTab === 'confirm' ? activeTabStyle : {}) }}
        >
          ✨ 確定
        </button>
      </div>

      {/* 選択されているタブの中身を表示 */}
      {tabContentElement}

      {/* 戻るボタン */}
      <div style={{ marginTop: '25px' }}>
        <Button onClick={() => navigate('/host/list')} type="outline">管理一覧へ戻る</Button>
      </div>
    </Layout>
  );
}

// ==========================================================================
// スタイル定義（スマホファースト・レスポンシブ）
// ==========================================================================
const tabContainerStyle = { display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px', marginBottom: '20px' };
const tabItemStyle = { flex: 1, padding: '10px 0', border: 'none', background: 'none', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' };
const activeTabStyle = { background: '#ffffff', color: '#007AFF', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' };
const badgeStyle = (bg, border, color) => ({ fontSize: '0.75rem', padding: '4px 10px', background: bg, border: `1px solid ${border}`, color: color, borderRadius: '20px', fontWeight: '500' });
const sectionLabel = { margin: '0 0 12px 0', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', textAlign: 'left', fontSize: '0.9rem', fontWeight: 'bold' };
const resultRow = { display: 'flex', alignItems: 'center', padding: '10px 12px', background: '#f0f7ff', borderRadius: '8px', marginBottom: '8px', textAlign: 'left', border: '1px solid #d0e7ff' };
const scoreBadge = { background: '#007AFF', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 };
const guestCardStyle = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '12px', textAlign: 'left' };
const commentBubble = { marginLeft: '6px', color: '#007AFF', background: '#e0f0ff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' };
const inputLabel = { display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '12px', marginBottom: '4px', color: '#334155', textAlign: 'left' };