import { useRef, useEffect } from 'react';
import styles from './TimePicker.module.css';

export default function TimePicker({ label, value, onChange, options }) {
  const scrollRef = useRef(null);

  // スクロール停止時に値を親コンポーネントに渡す
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const index = Math.round(scrollRef.current.scrollTop / 34);
    if (options[index] !== value) {
      onChange(options[index]);
    }
  };

  return (
    <div className={styles.pickerContainer}>
      <div className={styles.row}>
        <span>{label}</span>
        <span style={{ fontWeight: 'bold' }}>{value}</span>
      </div>
      <div className={styles.wheelWrapper}>
        <div className={styles.selectionOverlay} />
        <div className={styles.column} ref={scrollRef} onScroll={handleScroll}>
          <div className={styles.spacer} />
          {options.map((opt) => (
            <div key={opt} className={styles.timeItem} style={value === opt ? { color: '#000', fontWeight: 'bold' } : {}}>
              {opt}
            </div>
          ))}
          <div className={styles.spacer} />
        </div>
      </div>
    </div>
  );
}