import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Inbox from './components/Inbox';
import SentPage from './pages/SentPage';
import ComposePage from './pages/ComposePage';
import './style.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Inbox />} />
          <Route path="/sent" element={<SentPage />} />
          <Route path="/compose" element={<ComposePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
