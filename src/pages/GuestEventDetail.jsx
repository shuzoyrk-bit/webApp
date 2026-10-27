import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import Layout from '../components/Layout';
import ui from '../components/CommonUI.module.css';
import { fetchEventDetail, submitAnswer } from '../services/api';

export default function GuestEventDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [eventData, setEventData] = useState(null);
  const [dateResponses, setDateResponses] = useState({});
  const [selectedAreaId, setSelectedAreaId] = useState(""); 
  const [preferredBudget, setPreferredBudget] = useState("");
  const [overallComment, setOverallComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const participantId = localStorage.getItem('login_user_id') || "";

  // 文字化けを綺麗に直す関数
  const safeDecode = (str) => {
    if (!str) return "";
    try {
      return decodeURIComponent(escape(str));
    } catch (e) {
      return str;
    }
  };

  useEffect(() => {
    if (!participantId) return;

    async function loadGuestData() {
      try {
        const data = await fetchEventDetail(id, participantId);

        if (data) {
          console.log("★★★ ゲスト画面が取得した生データ:", data);
          setEventData(data);

          const rawResponses = data.participantResponses || [];
          const myResponse = rawResponses.find(p => (p.userId || p.user_id) === participantId);
          
          if (myResponse) {
            if (myResponse.preferredAreaId) {
              setSelectedAreaId(String(myResponse.preferredAreaId));
            } else if (myResponse.preferredArea) {
              const matched = (data.areaPreferences || []).find(ap => ap.area === myResponse.preferredArea);
              if (matched) setSelectedAreaId(String(matched.area_id || matched.areaId || ""));
            }
            
            setPreferredBudget(myResponse.preferredBudget || "");
            setOverallComment(safeDecode(myResponse.overallComment));
            
            const initialDateRes = {};
            const rawDateResponses = myResponse.dateResponses || [];
            rawDateResponses.forEach(dr => {
              initialDateRes[dr.dateCandidateId] = { 
                score: dr.score,
                status: dr.status || (dr.score === 5 ? "○" : dr.score === 3 ? "△" : "×"),
                comment: safeDecode(dr.comment)
              };
            });
            setDateResponses(initialDateRes);
          } else {
            const initialDateRes = {};
            const rawDateSummaries = data.dateSummaries || [];
            rawDateSummaries.forEach(item => {
              initialDateRes[item.dateCandidateId] = { score: 5, status: "○", comment: "" };
            });
            setDateResponses(initialDateRes);
          }
        }
      } catch (err) {
        console.error("データ取得エラー:", err);
      }
    }
    loadGuestData();
  }, [id, participantId]);

  const handleStatusChange = (candidateId, statusValue) => {
    let score = 5;
    if (statusValue === "○") score = 5;
    if (statusValue === "△") score = 3;
    if (statusValue === "×") score = 0;

    setDateResponses(prev => ({
      ...prev,
      [candidateId]: { ...(prev[candidateId] || { comment: '' }), score: score, status: statusValue }
    }));
  };

  const handleMemoChange = (candidateId, memo) => {
    setDateResponses(prev => ({
      ...prev,
      [candidateId]: { ...(prev[candidateId] || { status: '○', score: 5 }), comment: memo }
    }));
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!participantId) {
      alert("ログイン情報が見つかりません。再度ログインしてください。");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        event_id: Number(id),
        user_id: participantId,
        date_responses: Object.entries(dateResponses).map(([candidateId, val]) => ({
          date_candidate_id: Number(candidateId),
          score: val.score !== undefined ? val.score : 5,
          comment: val.comment || ""
        })),
        preferred_budget: Number(preferredBudget) || 0,
        preferred_area_id: selectedAreaId ? Number(selectedAreaId) : 0, 
        overall_comment: overallComment
      };
      
      console.log("🚀 バックエンドの型に100%合わせた送信データ:", payload);
      
      await submitAnswer(payload);
      alert("回答を送信しました！");
      navigate('/guest/list');
    } catch (err) {
      console.error(err);
      alert("送信に失敗しました: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!participantId) {
    return (
      <Layout title="エラー">
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          ログイン情報が見つかりません。再度ログインしてください。
        </div>
      </Layout>
    );
  }

  if (!eventData) {
    return (
      <Layout title="読み込み中...">
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>イベント詳細を読み込み中...</div>
      </Layout>
    );
  }

  const managerName = eventData.managerName || eventData.hostName || "このイベントの主催者";
  const areaOptions = Array.isArray(eventData.areaPreferences) ? eventData.areaPreferences : [];
  const hasAreaAndBudgetSettings = areaOptions.length > 0 || !!eventData.budgetSummary;
  const isConfirmed = !!(eventData.confirmedDetails);
  const rawDateSummaries = eventData.dateSummaries || [];

  return (
    <Layout title={isConfirmed ? "確定内容" : "イベント回答"}>
      <div className={ui.header}></div>

      {/* イベント基本情報 */}
      <div className={ui.card}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', textAlign: 'left' }}>{safeDecode(eventData.eventName)}</h2>
        <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'left' }}>幹事: {managerName}</p>
        <div style={descBox}>
          期限: {eventData.deadlineForResponses ? eventData.deadlineForResponses.replace('T', ' ').substring(0, 16) : ""}
        </div>
      </div>

      {!isConfirmed ? (
        <form onSubmit={handleSubmitAnswer}>
          {/* 記号の意味（凡例）の説明 */}
          <div className={ui.card} style={{ background: '#f0f7ff', border: '1px solid #bcd7ff' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#0056b3', textAlign: 'left' }}>💡 回答記号の目安</h4>
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', color: '#333' }}>
              <span><strong>○</strong> : いつでも可</span>
              <span><strong>△</strong> : 微妙</span>
              <span><strong>×</strong> : 参加不可</span>
            </div>
          </div>

          {/* 日程候補の回答 */}
          <div className={ui.card}>
            <h4 style={sectionTitle}>日程候補の回答</h4>
            {Array.isArray(rawDateSummaries) && rawDateSummaries.map((item, idx) => {
              const cid = item.dateCandidateId || item.id;
              const res = dateResponses[cid] || { status: '○', comment: '' };
              return (
                <div key={cid} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: idx !== rawDateSummaries.length - 1 ? '1px dashed #eee' : 'none' }}>
                  <div style={dateRowStyle}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 'bold', flex: 1, textAlign: 'left' }}>
                      {item.datetime ? item.datetime.replace('T', ' ').substring(0, 16) : "日時未定"}
                    </span>
                    <select 
                      className={ui.input} 
                      style={selectStyle} 
                      value={res.status} 
                      onChange={(e) => handleStatusChange(cid, e.target.value)}
                    >
                      <option value="○">○</option>
                      <option value="△">△</option>
                      <option value="×">×</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <input 
                      type="text" 
                      className={ui.input} 
                      placeholder="補足事項・メモ（例: 20時以降なら可）" 
                      style={{ marginBottom: 0, fontSize: '0.85rem' }} 
                      value={res.comment} 
                      onChange={(e) => handleMemoChange(cid, e.target.value)} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 希望・アンケート */}
          {hasAreaAndBudgetSettings && (
            <div className={ui.card}>
              <h4 style={sectionTitle}>希望・アンケート</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                {areaOptions.length > 0 && (
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>希望エリア</label>
                    <select 
                      className={ui.input} 
                      value={selectedAreaId} 
                      onChange={(e) => setSelectedAreaId(e.target.value)}
                    >
                      <option value="">選択...</option>
                      {areaOptions.map((ap) => {
                        const aId = ap.area_id || ap.areaId;
                        return (
                          <option key={aId} value={aId}>
                            {safeDecode(ap.area)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {!!eventData.budgetSummary && (
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>予算目安</label>
                    <input 
                      type="number" min="0" step="100" className={ui.input} placeholder="5000" 
                      value={preferredBudget} 
                      onChange={(e) => setPreferredBudget(e.target.value)} 
                    />
                  </div>
                )}
              </div>

              {/* 全体コメント */}
              <label style={labelStyle}>全体コメント</label>
              <textarea 
                className={ui.input} placeholder="幹事へのメッセージ" rows="2" 
                value={overallComment} 
                onChange={(e) => setOverallComment(e.target.value)} 
              />
            </div>
          )}

          <Button type="success" disabled={isSubmitting} style={{ width: '100%' }}>
            {isSubmitting ? "送信中..." : "回答を送信する"}
          </Button>
        </form>
      ) : (
        <div className={ui.card} style={{ border: '2px solid #28a745', textAlign: 'left' }}>
          <h4 style={{ color: '#28a745', marginBottom: '15px' }}>確定内容</h4>
          <p style={finalP}><strong>日時:</strong> {eventData.confirmedDetails.datetime || "未定"}</p>
          <p style={finalP}><strong>場所:</strong> {eventData.confirmedDetails.shopName || "未定"}</p>
          <p style={finalP}><strong>予算:</strong> {eventData.confirmedDetails.budget ? `${eventData.confirmedDetails.budget}円` : "未定"}</p>
        </div>
      )}

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <Button onClick={() => navigate('/guest/list')} type="outline">イベント一覧へ戻る</Button>
      </div>
    </Layout>
  );
}

const sectionTitle = { fontSize: '0.9rem', color: '#333', marginBottom: '12px', borderLeft: '3px solid #007AFF', paddingLeft: '8px', textAlign: 'left' };
const dateRowStyle = { display: 'flex', alignItems: 'center', gap: '8px' };
const selectStyle = { width: '75px', padding: '12px 8px', textAlign: 'center', fontSize: '1rem', height: 'auto', lineHeight: '1.2', boxSizing: 'border-box', margin: 0 };
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#666', marginBottom: '4px', textAlign: 'left' };
const descBox = { background: '#f9f9f9', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#666', marginTop: '5px', textAlign: 'left' };
const finalP = { margin: '0 0 10px 0', fontSize: '1rem' };