import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 各ページをインポート（パスが ./pages/... になっているか確認）
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import Login from './pages/Login';
import TopMenu from './pages/TopMenu';
import GuestEventList from './pages/GuestEventList';
import GuestEventDetail from './pages/GuestEventDetail';
import HostEventList from './pages/HostEventList';
import HostCreateStep1 from './pages/HostCreateStep1';
import HostCreateStep2 from './pages/HostCreateStep2';
import HostCreateStep3 from './pages/HostCreateStep3';
import HostEventManage from './pages/HostEventManage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/top" element={<TopMenu />} />
        <Route path="/guest/list" element={<GuestEventList />} />
        <Route path="/guest/detail/:id" element={<GuestEventDetail />} />
        <Route path="/host/list" element={<HostEventList />} />
        <Route path="/host/create/step1" element={<HostCreateStep1 />} />
        <Route path="/host/create/step2" element={<HostCreateStep2 />} />
        <Route path="/host/create/step3" element={<HostCreateStep3 />} />
        <Route path="/host/manage/:id" element={<HostEventManage />} />
      </Routes>
    </Router>
  );
}

export default App;