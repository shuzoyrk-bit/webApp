import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import Layout from '../components/Layout';
import DateInputModal from '../components/DateInputModal';
import ui from '../components/CommonUI.module.css';

export default function HostCreateStep2() {
  const navigate = useNavigate();
  const location = useLocation();

  // Step1 から渡ってきたデータを受け取る
  const step1Data = location.state || {};

  const [showModal, setShowModal] = useState(false);
  const [candidates, setCandidates] = useState([]);

  // 【ソート機能】追加時に、古い日付順（昇順）に並び替える処理
  const addCandidate = (newDate) => {
    if (!newDate) {
      setShowModal(false);
      return;
    }
    const updatedCandidates = [...candidates, newDate];
    updatedCandidates.sort();
    setCandidates(updatedCandidates);
    setShowModal(false); // 💡 保存（完了）時に確実にモーダルを閉じる
  };

  const removeCandidate = (index) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  // 次へ進む時の処理
  const handleNextStep = () => {
    if (candidates.length === 0) {
      alert("候補日時を1つ以上追加してください。");
      return;
    }
    const updatedData = {
      ...step1Data,
      dateCandidates: candidates
    };
    navigate('/host/create/step3', { state: updatedData });
  };

  return (
    <Layout
      title={
        <>
          イベントの新規作成<br />
          日時選択 (2/3)
        </>
      }
    >
      <div className={ui.header}>
        <h3>候補の日時を選択</h3>
      </div>

      <div className={ui.card}>
        <div style={{ marginBottom: '15px' }}>
          {candidates.map((item, index) => (
            <div key={index} style={flexRowStyle}>
              <div className={ui.input} style={dateItemStyle}>
                {item}
              </div>
              <Button onClick={() => removeCandidate(index)} type="danger" style={{ width: '40px', height: '40px', padding: 0 }}>
                ×
              </Button>
            </div>
          ))}
          {candidates.length === 0 && (
            <p style={{ color: '#999', textAlign: 'center' }}>”候補を増やす”ボタンで日時を設定してください</p>
          )}
        </div>

        <Button onClick={() => setShowModal(true)} type="outline">＋ 候補を増やす</Button>
      </div>

      <Button onClick={handleNextStep} type="primary" style={{ width: '100%', marginTop: '10px' }}>
        次へ（期限・詳細設定）
      </Button>

      <div style={{ marginTop: '20px' }}>
        <Button 
          onClick={() => navigate('/host/create/step1', { state: step1Data })} 
          type="outline"
        >
          前に戻る
        </Button>
      </div>

      {/* 💡 【修正】余分なバックスラッシュを除去し、正しく関数をバインド */}
      <DateInputModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={addCandidate}
      />
    </Layout>
  );
}

const flexRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  width: '100%'
};

const dateItemStyle = {
  margin: 0,
  flex: 1,
  background: '#f0f7ff',
  border: '1px solid #bce0ff',
  color: '#0056b3',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  padding: '10px',
  borderRadius: '6px',
  textAlign: 'left'
};