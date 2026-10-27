import styles from './Button.module.css';

export default function Button({ children, onClick, type = 'primary', className }) {
  const btnClass = `${styles.btn} ${styles[type]} ${className}`;
  return (
    <button className={btnClass} onClick={onClick}>
      {children}
    </button>
  );
}