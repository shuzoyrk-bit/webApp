import { useNavigate } from 'react-router-dom';
import styles from './Layout.module.css';

export default function Layout({ children, title }) {
  const navigate = useNavigate();

  // ログイン中のときだけログアウトボタンを表示する
  const isLoggedIn = !!localStorage.getItem('login_user_id');

  function handleLogout() {
    if (!window.confirm('ログアウトしますか？')) return;
    localStorage.removeItem('login_user_id');
    navigate('/login');
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {isLoggedIn && (
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            ログアウト
          </button>
        )}
        {title && <h2 className={styles.logo}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
