import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Layout from '../components/Layout';
import ui from '../components/CommonUI.module.css';

export default function HostCreateStep1() {
  const navigate = useNavigate();

  //  1. 仕様書のパラメータに合わせたState管理
  const [eventName, setEventName] = useState('');
  const [useArea, setUseArea] = useState(false);
  const [areaOptions, setAreaOptions] = useState(["", "", ""]);
  const [budgetChoice, setBudgetChoice] = useState(false); /* 仕様書: budgetChoice */

  // エリア入力の変更ハンドラー
  const handleAreaChange = (index, value) => {
    const newOptions = [...areaOptions];
    newOptions[index] = value;
    setAreaOptions(newOptions);
  };

  // エリア候補の追加
  const addAreaOption = () => {
    setAreaOptions([...areaOptions, ""]);
  };

  // エリア候補の削除
  const removeAreaOption = (index) => {
    if (areaOptions.length > 1) {
      const newOptions = areaOptions.filter((_, i) => i !== index);
      setAreaOptions(newOptions);
    }
  };

  //  次へ進む時の処理（入力値をまとめてStep2へ引き渡す）
  const handleNextStep = (e) => {
    e.preventDefault(); // フォームのデフォルト送信を防止

    // 空白のエリア候補を除外した綺麗な配列を作成
    let filteredAreas = [];
    if (useArea) {
      filteredAreas = areaOptions.filter(area => area.trim() !== "");
    }

    //  次の画面（Step2）へ、現在の入力データをstateとして引き継ぐ
    navigate('/host/create/step2', {
      state: {
        eventName: eventName,
        areaCandidate: filteredAreas, /* 仕様書: areaCandidate */
        budgetChoice: budgetChoice    /* 仕様書: budgetChoice */
      }
    });
  };

  //  エリア候補入力欄エリアの準備（if文での切り分け）
  let areaFieldsElement = null;
  if (useArea) {
    areaFieldsElement = (
      <div style={{ marginTop: '15px' }}>
        <label style={labelStyle}>エリア候補</label>
        {areaOptions.map((option, index) => (
          <div key={index} style={flexRowStyle}>
            <input
              className={ui.input}
              type="text"
              value={option}
              onChange={(e) => handleAreaChange(index, e.target.value)}
              placeholder={`候補 ${index + 1} (例: 新宿)`}
              style={{ marginBottom: 0, flex: 1 }}
            />
            <button
              type="button"
              onClick={() => removeAreaOption(index)}
              style={removeBtnStyle}
              disabled={areaOptions.length <= 1}
            >
              削除
            </button>
          </div>
        ))}
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button
            type="button"
            onClick={addAreaOption}
            style={addBtnStyle}
          >
            ＋ 候補を追加
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout
      title={
        <>
          イベントの新規作成<br />
          概要設定 (1/3)
        </>
      }
    >
      <div className={ui.header}>
        <h3>イベント概要の設定</h3>
      </div>

      {/*  フォームタグで包み、キーボードの「次へ」操作に対応 */}
      <form onSubmit={handleNextStep} style={{ width: '100%' }}>
        
        <div className={ui.card}>
          <label style={labelStyle}>イベント名</label>
          <input
            className={ui.input}
            type="text"
            required
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="例: 新年会2026"
          />
        </div>

        {/* エリア選択の有無 */}
        <div className={ui.card}>
          {/*  スマホでタップしやすいように全体をlabelタグに */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useArea}
              onChange={(e) => setUseArea(e.target.checked)}
              style={checkboxStyle}
            />
            <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>希望エリアを選択させる</span>
          </label>
          {areaFieldsElement}
        </div>

        {/* 予算選択の有無 */}
        <div className={ui.card}>
          {/*  スマホでタップしやすいように全体をlabelタグに */}
          <label htmlFor="budgetCheck" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              id="budgetCheck"
              checked={budgetChoice}
              onChange={(e) => setBudgetChoice(e.target.checked)}
              style={checkboxStyle}
            />
            <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>希望予算を選択させる</span>
          </label>
        </div>

        <Button type="primary" style={{ width: '100%', marginTop: '10px' }}>
          次へ（日時選択）
        </Button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <Button onClick={() => navigate('/host/list')} type="outline">
          一覧へ戻る
        </Button>
      </div>
    </Layout>
  );
}

// ==========================================================================
//  スタイル定義（スマホ最適化・はみ出し防止）
// ==========================================================================
const labelStyle = { 
  display: 'block', 
  fontSize: '0.8rem', 
  fontWeight: 'bold', 
  marginBottom: '5px', 
  color: '#555', 
  textAlign: 'left' 
};

const flexRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  width: '100%'
};

const checkboxStyle = { 
  width: '22px', 
  height: '22px', 
  flexShrink: 0,
  cursor: 'pointer'
};

const removeBtnStyle = {
  background: '#ff4d4f',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  padding: '0 12px',
  height: '42px',
  fontSize: '0.85rem',
  cursor: 'pointer',
  flexShrink: 0
};

const addBtnStyle = {
  background: 'none',
  border: '1px solid #007AFF',
  color: '#007AFF',
  borderRadius: '6px',
  padding: '6px 12px',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  cursor: 'pointer'
};