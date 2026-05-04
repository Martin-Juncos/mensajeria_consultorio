import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './MessageDetail.css';

const MessageDetail = ({ message, onClose, onMarkRead, currentUserId }) => {
  if (!message) return null;

  const isUnread = currentUserId
    ? !message.recipients?.some(r => r.recipientId === currentUserId && r.readAt)
    : false;

  const handleMarkRead = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(message.id, currentUserId);
    }
  };

  return (
    <div className="message-detail">
      <div className="message-detail-header">
        <button onClick={onClose} className="back-btn">← Volver</button>
        {isUnread && currentUserId && (
          <button onClick={handleMarkRead} className="mark-read-btn">
            Marcar como leído
          </button>
        )}
      </div>

      <div className="message-detail-content">
        <div className="message-meta">
          <div className="message-meta-row">
            <strong>De:</strong>
            <span>{message.sender?.name}</span>
          </div>
          <div className="message-meta-row">
            <strong>Para:</strong>
            <span>
              {message.recipients?.map(r => r.recipient?.name || r.recipientId).join(', ')}
            </span>
          </div>
          <div className="message-meta-row">
            <strong>Fecha:</strong>
            <span>
              {format(new Date(message.createdAt), 'dd MMMM yyyy HH:mm', { locale: es })}
            </span>
          </div>
          <div className="message-meta-row">
            <strong>Asunto:</strong>
            <span>
              {message.subject?.type === 'paciente' && message.subject?.patient && (
                <span className="patient-badge">
                  {message.subject.patient.name}
                </span>
              )}
              {message.title}
            </span>
          </div>
        </div>

        <div className="message-body">
          {message.body}
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
