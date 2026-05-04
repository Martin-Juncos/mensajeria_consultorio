import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messagesApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import ComposeModal from '../components/ComposeModal';
import '../components/Inbox.css';

const ComposePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleClose = () => {
    navigate('/');
  };

  const handleSend = async (data) => {
    await messagesApi.create(data);
    navigate('/sent');
  };

  return (
    <div className="inbox-container">
      <Sidebar unreadCount={0} />

      <main className="inbox-main">
        {!currentUser && (
          <div className="inbox-login-required">
            <h2>Selecciona un usuario para redactar</h2>
            <p>Usa el selector en el sidebar para identificarte</p>
          </div>
        )}

        {currentUser && (
          <ComposeModal
            isOpen
            onClose={handleClose}
            onSend={handleSend}
            currentUser={currentUser}
          />
        )}
      </main>
    </div>
  );
};

export default ComposePage;
