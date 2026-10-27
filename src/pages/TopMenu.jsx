import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Layout from '../components/Layout';

export default function TopMenu() {
  const navigate = useNavigate();
  const buttonWrapperStyle = {
    transform: 'scale(1.3)',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    margin: '10px 0'
  };

  return (
    <Layout title="トップメニュー">
      <h3 style={{ color: '#000000', marginBottom: '20px' }}>イベントのポジション選択</h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        marginTop: '60px',
        alignItems: 'center'
      }}>

        <div style={buttonWrapperStyle}>
          <Button onClick={() => navigate('/host/list')} type="primary">
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>📢 作成メニュー</span>
          </Button>
        </div>

        <div style={buttonWrapperStyle}>
          <Button onClick={() => navigate('/guest/list')} type="primary">
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>👥 参加メニュー</span>
          </Button>
        </div>

      </div>
    </Layout>
  );
}