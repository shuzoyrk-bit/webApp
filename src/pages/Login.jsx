import { useState } from 'react'; // 💡 Stateを追加
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api'; // 💡 API関数をインポート
import Button from '../components/Button';
import Layout from '../components/Layout';
import ui from '../components/CommonUI.module.css';

export default function Login() {
  const navigate = useNavigate();

  // 💡 1. フォームの入力値および状態管理用Stateを用意
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中フラグ
  const [errorMessage, setErrorMessage] = useState('');     // エラーメッセージ

  // 💡 2. ボタンが押されたときのログイン認証処理
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    try {
      setIsSubmitting(true);

      // API関数を呼び出し、入力されたIDとパスワードを渡す
      await login({
        userID: userID,
        password: password
      });

      // 💡 認証成功：ユーザーIDをブラウザのlocalStorageに一時保存
      localStorage.setItem('login_user_id', userID);
      
      // 成功ポップアップを表示してトップへ遷移
      alert('ログインに成功しました！');
      navigate('/top');

    } catch (err) {
      console.error(err);
      // バックエンドから返ってきたエラーメッセージ、またはデフォルト文を表示
      setErrorMessage(err.message || 'ユーザーIDまたはパスワードが間違っています。');
    } finally {
      setIsSubmitting(false);
    }
  }

  // エラーメッセージ要素の準備（if文での切り分け）
  let errorElement = null;
  if (errorMessage) {
    errorElement = (
      <p style={{ color: '#FF3B30', fontSize: '0.85rem', fontWeight: 'bold', margin: '0 0 15px', textAlign: 'left' }}>
        ⚠️ {errorMessage}
      </p>
    );
  }

  // ボタンのテキスト調整
  let loginButtonText = "ログイン";
  if (isSubmitting) {
    loginButtonText = "認証中...";
  }

  return (
    <Layout title="ログイン">
      {/* 💡 formタグで囲み、キーボードの「Enter」やスマホの「開く/確定」ボタンでも送信可能に */}
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        
        {/* エラーが発生している場合のみ表示 */}
        {errorElement}

        <div className={ui.card} style={{ textAlign: 'left' }}>
          <div className={ui.inputGroup} style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>ユーザーID</label>
            <input 
              type="text" 
              required
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              className={ui.input} 
              placeholder="ユーザーIDを入力" 
              style={{ marginBottom: 0 }}
            />
          </div>

          <div className={ui.inputGroup} style={{ marginBottom: '5px' }}>
            <label style={labelStyle}>パスワード</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={ui.input} 
              placeholder="パスワードを入力" 
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>

        <Button type="primary" disabled={isSubmitting} style={{ width: '100%', marginTop: '10px' }}>
          {loginButtonText}
        </Button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 10px' }}>
          まだアカウントをお持ちでない方は
        </p>
        <Button onClick={() => navigate('/signup')} type="outline">
          新規アカウント作成
        </Button>
      </div>

      <p style={{ marginTop: '30px', fontSize: '0.8rem', color: '#999', cursor: 'pointer' }}>
        パスワードを忘れた場合はこちら
      </p>
    </Layout>
  );
}

// ==========================================================================
// 🎨 スタイル定義（変更なし）
// ==========================================================================
const labelStyle = { 
  display: 'block', 
  fontSize: '0.8rem', 
  fontWeight: 'bold', 
  marginBottom: '5px', 
  color: '#555' 
};