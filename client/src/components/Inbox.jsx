import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { messagesApi } from '../services/api';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import MessageDetail from './MessageDetail';
import './Inbox.css';

const Inbox = () => {
  const { currentUser } = useAuth();
  const { messages: socketMessages } = useSocket(currentUser?.id);
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

  useEffect(() => {
    if (socketMessages.length > 0) {
      setMessages(prev => {
        const newIds = new Set(socketMessages.map(m => m.id));
        const filtered = prev.filter(m => !newIds.has(m.id));
        return [...socketMessages, ...filtered];
      });
    }
  }, [socketMessages]);

  const fetchMessages = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await messagesApi.getAll(currentUser.id, 'inbox');
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (message) => {
    setSelectedMessage(message);
    setView('detail');
    if (message.senderId !== currentUser?.id) {
      const recipient = message.recipients?.find(r => r.recipientId === currentUser?.id);
      if (!recipient?.readAt) {
        messagesApi.markRead(message.id, currentUser.id)
          .then((response) => {
            const readRecipient = response.data;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === message.id
                  ? {
                      ...msg,
                      recipients: msg.recipients?.map((item) =>
                        item.recipientId === currentUser.id
                          ? { ...item, ...readRecipient, recipient: readRecipient.recipient || item.recipient }
                          : item
                      ),
                    }
                  : msg
              )
            );
            setSelectedMessage((prev) =>
              prev?.id === message.id
                ? {
                    ...prev,
                    recipients: prev.recipients?.map((item) =>
                      item.recipientId === currentUser.id
                        ? { ...item, ...readRecipient, recipient: readRecipient.recipient || item.recipient }
                        : item
                    ),
                  }
                : prev
            );
          })
          .catch((err) => console.error('Error marking message as read:', err));
      }
    }
  };

  const unreadCount = messages.filter(m => 
    m.senderId !== currentUser?.id &&
    !m.recipients?.some(r => r.recipientId === currentUser?.id && r.readAt)
  ).length;

  return (
    <div className="inbox-container">
      <Sidebar unreadCount={unreadCount} />
      
      <main className="inbox-main">
        {!currentUser && (
          <div className="inbox-login-required">
            <h2>Selecciona un usuario para comenzar</h2>
            <p>Usa el selector en el sidebar para identificarte</p>
          </div>
        )}

        {loading && <div className="inbox-loading">Cargando...</div>}
        
        {currentUser && view === 'list' && (
          <MessageList
            messages={messages}
            onSelect={handleSelect}
            selectedId={selectedMessage?.id}
            type="inbox"
          />
        )}
        
        {currentUser && view === 'detail' && selectedMessage && (
          <MessageDetail
            message={selectedMessage}
            onClose={() => setView('list')}
            onMarkRead={(messageId, userId) => messagesApi.markRead(messageId, userId)}
            currentUserId={currentUser?.id}
          />
        )}
      </main>
    </div>
  );
};

export default Inbox;
