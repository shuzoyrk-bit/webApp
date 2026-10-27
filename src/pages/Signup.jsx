import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerAccount } from '../services/api'; // 💡 API関数をインポート
import Button from '../components/Button';
import Layout from '../components/Layout';
import ui from '../components/CommonUI.module.css';

export default function Signup() {
  const navigate = useNavigate();

  // 💡 1. フォームの入力値を管理するStateを用意
  const [nickname, setNickname] = useState('');
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // パスワード可視化切り替え用のState
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 送信中やエラー表示のためのState
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. パスワード入力欄用の設定（if文による切り分け）
  let passwordInputType = "password";
  let passwordIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  if (showPassword) {
    passwordInputType = "text";
    passwordIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
    );
  }

  // 2. 確認用パスワード入力欄用の設定（if文による切り分け）
  let confirmInputType = "password";
  let confirmIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  if (showConfirmPassword) {
    confirmInputType = "text";
    confirmIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
    );
  }

  // 💡 3. ボタンが押されたときのアカウント登録処理
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    // バリデーション（簡易チェック）
    if (password !== confirmPassword) {
      setErrorMessage('パスワードと確認用パスワードが一致しません。');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // API関数を呼び出し、Stateの値を渡す
      await registerAccount({
        nickname: nickname,
        userID: userID,
        password: password,
        confirmationPassword: confirmPassword
      });

      // 💡 登録成功：ログイン情報を一時保存してトップメニュー等に遷移
      localStorage.setItem('login_user_id', userID);
      alert('ユーザー登録が完了しました！');
      navigate('/top');

    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || '登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  }

  // エラーメッセージ用要素の準備
  let errorElement = null;
  if (errorMessage) {
    errorElement = (
      <p style={{ color: '#FF3B30', fontSize: '0.85rem', fontWeight: 'bold', margin: '0 0 15px', textAlign: 'left' }}>
        ⚠️ {errorMessage}
      </p>
    );
  }

  // ボタンの文字調整
  let submitButtonText = "登録してはじめる";
  if (isSubmitting) {
    submitButtonText = "登録中...";
  }

  return (
    <Layout title="新しくアカウントを作る">
      <p style={guideText}>
        幹事としてイベントを企画したり、お誘いを受け取って回答したりするために、まずはあなたのアカウントを登録しましょう！
      </p>

      {/* 💡 formタグで囲み、入力送信に対応させます */}
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        
        {/* エラー表示 */}
        {errorElement}

        <div className={ui.inputGroup}>
          <label style={labelStyle}>ニックネーム</label>
          <input
            type="text"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={ui.input}
            placeholder="例: たろう"
          />
        </div>

        <div className={ui.inputGroup}>
          <label style={labelStyle}>ユーザーID</label>
          <input
            type="text"
            required
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
            className={ui.input}
            placeholder="半角英数字（ログイン時に使用）"
          />
        </div>

        <div className={ui.inputGroup}>
          <label style={labelStyle}>パスワード</label>
          <div style={passwordWrapperStyle}>
            <input
              type={passwordInputType}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={ui.input}
              placeholder="6文字以上の半角英数字"
              style={{ paddingRight: '45px', marginBottom: 0 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={eyeButtonStyle}
              aria-label={showPassword ? "パスワードを非表示にする" : "パスワードを表示する"}
            >
              {passwordIcon}
            </button>
          </div>
        </div>

        <div className={ui.inputGroup}>
          <label style={labelStyle}>確認用パスワード</label>
          <div style={passwordWrapperStyle}>
            <input
              type={confirmInputType}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={ui.input}
              placeholder="もう一度入力してください"
              style={{ paddingRight: '45px', marginBottom: 0 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={eyeButtonStyle}
              aria-label={showConfirmPassword ? "パスワードを非表示にする" : "パスワードを表示する"}
            >
              {confirmIcon}
            </button>
          </div>
        </div>

        <Button type="primary" disabled={isSubmitting} style={{ width: '100%', marginTop: '10px' }}>
          {submitButtonText}
        </Button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 10px' }}>
          すでにアカウントをお持ちの方は
        </p>
        <Button onClick={() => navigate('/login')} type="outline">
          ログイン画面へ
        </Button>
      </div>
    </Layout>
  );
}

// ==========================================================================
// 🎨 スタイル定義（変更なし）
// ==========================================================================
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px', color: '#555', textAlign: 'left' };
const guideText = { fontSize: '0.9rem', color: '#666', marginBottom: '20px', lineHeight: '1.5', textAlign: 'left' };
const passwordWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '15px',
  width: '100%'
};

const eyeButtonStyle = {
  position: 'absolute',
  right: '12px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
};