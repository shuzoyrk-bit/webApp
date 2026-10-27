import { useState } from 'react';
import TimePicker from './TimePicker';
import Button from './Button';
import ui from './CommonUI.module.css';
import styles from './DateInputModal.module.css';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

export default function DateInputModal({ isOpen, onSave, onClose }) {
  const [date, setDate] = useState('');
  const [startH, setStartH] = useState('19');
  const [startM, setStartM] = useState('30');
  const [endH, setEndH] = useState('21');
  const [endM, setEndM] = useState('00');

  // 💡 【防御ガード】isOpenがfalse、または未指定の場合は一切表示しない（画面を邪魔しない）
  if (!isOpen) {
    return null;
  }

  const handleComplete = () => {
    if (!date) {
      alert('日付を選択してください');
      return;
    }
    // 親コンポーネントに選んだ日時を渡す
    onSave(`${date} ${startH}:${startM}〜${endH}:${endM}`);
    // 💡 【修正】保存が完了したらモーダルを閉じる
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContent}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', textAlign: 'center' }}>候補日の設定</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px', textAlign: 'left' }}>日付</label>
          <input 
            type="date" 
            className={ui.input} 
            onChange={(e) => setDate(e.target.value)} 
            onClick={(e) => e.target.showPicker?.()} 
            style={{ cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
          <TimePicker label="開始(時)" value={startH} onChange={setStartH} options={HOURS} />
          <TimePicker label="開始(分)" value={startM} onChange={setStartM} options={MINUTES} />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <TimePicker label="終了(時)" value={endH} onChange={setEndH} options={HOURS} />
          <TimePicker label="終了(分)" value={endM} onChange={setEndM} options={MINUTES} />
        </div>

        {/* 💡 ボタンエリアの安全配置 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <Button onClick={handleComplete} type="primary" style={{ width: '100%' }}>
            完了
          </Button>
          <Button onClick={onClose} type="outline" style={{ width: '100%' }}>
            キャンセル（戻る）
          </Button>
        </div>
      </div>
    </div>
  );
}