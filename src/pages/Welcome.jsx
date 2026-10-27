import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Layout from '../components/Layout';

export default function Welcome() {
  const navigate = useNavigate();

  const customTitle = (
    <div style={{
      textAlign: 'center',
      width: '100%',
      whiteSpace: 'nowrap',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        fontSize: '2.2rem',
        fontWeight: 'bold',
        color: '#002971',
        letterSpacing: '-2px',
        lineHeight: '1.2',
        textShadow: '1px 1px 0 #fff, -1px 1px 0 #fff, 1px -1px 0 #fff, -1px -1px 0 #fff'
      }}>
        スケジュール調整くん
      </div>
      <div style={{
        fontSize: '0.9rem',
        color: '#4c4c4c',
        marginTop: '8px',
        fontWeight: 'normal',
        letterSpacing: '0'
      }}>
        カンタンにスケジュールを調整！
      </div>
    </div>
  );

  return (
    <Layout title={customTitle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '40px' }}>
        <Button onClick={() => navigate('/signup')} type="primary">
          新しくはじめる
        </Button>
        <Button onClick={() => navigate('/login')} type="ghost">
          → ログイン
        </Button>
      </div>
    </Layout>
  );
}