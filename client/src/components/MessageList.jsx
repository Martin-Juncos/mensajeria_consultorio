import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './MessageList.css';

const MessageList = ({ messages, onSelect, selectedId, type = 'inbox' }) => {
  const isUnread = (message) => {
    if (type === 'sent') return false;
    return !message.recipients?.some(r => r.readAt);
  };

  const getRecipientNames = (message) => {
    if (!message.recipients) return '';
    return message.recipients.map(r => r.recipient?.name || r.recipientId).join(', ');
  };

  if (!messages.length) {
    return (
      <div className="message-list-empty">
        <p>No hay mensajes</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message-item ${isUnread(message) ? 'unread' : ''} ${selectedId === message.id ? 'selected' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(message)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(message);
            }
          }}
        >
          <div className="message-item-header">
            <span className="message-sender">
              {type === 'sent' ? 'Para:' : message.sender?.name}
            </span>
            <span className="message-date">
              {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
            </span>
          </div>

          <div className="message-subject">
            <span className="message-type-badge">{message.subject?.type}</span>
            {message.subject?.patient && (
              <span className="message-patient">
                {message.subject.patient.name}
              </span>
            )}
            {message.title}
          </div>

          {type === 'sent' && (
            <div className="message-recipients">
              Para: {getRecipientNames(message) || 'Sin destinatarios'}
            </div>
          )}

          <div className="message-preview">
            {message.body.length > 100 ? `${message.body.substring(0, 100)}...` : message.body}
          </div>

          {type === 'inbox' && (
            <div className="message-recipients">
              Para: {getRecipientNames(message)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
