import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { messagesApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import MessageList from '../components/MessageList';
import MessageDetail from '../components/MessageDetail';
import '../components/Inbox.css';

const SentPage = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list');

  useEffect(() => {
    if (currentUser) {
      setSelectedMessage(null);
      setView('list');
      fetchMessages();
    } else {
      setMessages([]);
      setSelectedMessage(null);
      setView('list');
    }
  }, [currentUser]);

  const fetchMessages = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await messagesApi.getAll(currentUser.id, 'sent');
      const sentMessages = response.data;
      const messagesWithRecipients = await Promise.all(
        sentMessages.map((message) =>
          message.recipients
            ? message
            : messagesApi.getById(message.id).then((detail) => detail.data).catch(() => message)
        )
      );
      setMessages(messagesWithRecipients);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (message) => {
    setSelectedMessage(message);
    setView('detail');
  };

  const unreadCount = 0;

  return (
    <div className="inbox-container">
      <Sidebar unreadCount={unreadCount} />
      
      <main className="inbox-main">
        {!currentUser && (
          <div className="inbox-login-required">
            <h2>Selecciona un usuario para ver enviados</h2>
            <p>Usa el selector en el sidebar para identificarte</p>
          </div>
        )}

        {loading && <div className="inbox-loading">Cargando...</div>}
        
        {currentUser && view === 'list' && (
          <MessageList
            messages={messages}
            onSelect={handleSelect}
            selectedId={selectedMessage?.id}
            type="sent"
          />
        )}
        
        {currentUser && view === 'detail' && selectedMessage && (
          <MessageDetail
            message={selectedMessage}
            onClose={() => setView('list')}
          />
        )}
      </main>
    </div>
  );
};

export default SentPage;
