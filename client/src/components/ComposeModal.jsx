import { useState, useEffect } from 'react';
import { usersApi, subjectsApi, patientsApi } from '../services/api';
import './ComposeModal.css';

const ComposeModal = ({ isOpen, onClose, onSend, currentUser }) => {
  const [recipients, setRecipients] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    recipientIds: [],
    subjectId: '',
    patientId: '',
    title: '',
    body: '',
    subjectType: 'administrativo',
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, currentUser?.id]);

  const fetchData = async () => {
    setDataLoading(true);
    setError('');
    try {
      const [usersRes, subjectsRes, patientsRes] = await Promise.all([
        usersApi.getAll(),
        subjectsApi.getAll(),
        patientsApi.getAll(),
      ]);
      setRecipients(usersRes.data.filter(u => u.id !== currentUser?.id));
      setSubjects(subjectsRes.data);
      setPatients(patientsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('No se pudieron cargar destinatarios, asuntos o pacientes.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Seleccioná un usuario antes de redactar.');
      return;
    }

    if (!form.recipientIds.length) {
      setError('Seleccioná al menos un destinatario.');
      return;
    }

    const title = form.title.trim();
    const body = form.body.trim();

    if (!title || !body) {
      setError('Completá el asunto y el mensaje.');
      return;
    }

    if (form.subjectType === 'paciente' && !form.patientId) {
      setError('Seleccioná un paciente para usar el tipo de asunto Paciente.');
      return;
    }

    setLoading(true);
    try {
      let subjectId = form.subjectId;

      if (form.subjectType === 'paciente' && form.patientId) {
        const existing = subjects.find(
          s => s.patientId === form.patientId && s.type === 'paciente'
        );
        if (existing) {
          subjectId = existing.id;
        } else {
          const newSubject = await subjectsApi.create({
            name: `Paciente: ${patients.find(p => p.id === form.patientId)?.name}`,
            type: 'paciente',
            patientId: form.patientId,
          });
          subjectId = newSubject.data.id;
        }
      } else if (!subjectId && form.subjectType !== 'paciente') {
        const existing = subjects.find((s) => s.type === form.subjectType && !s.patientId);

        if (existing) {
          subjectId = existing.id;
        } else {
          const newSubject = await subjectsApi.create({
            name: form.subjectType.charAt(0).toUpperCase() + form.subjectType.slice(1),
            type: form.subjectType,
          });
          subjectId = newSubject.data.id;
        }
      }

      await onSend({
        senderId: currentUser.id,
        subjectId,
        title,
        body,
        recipientIds: form.recipientIds,
      });

      setForm({
        recipientIds: [],
        subjectId: '',
        patientId: '',
        title: '',
        body: '',
        subjectType: 'administrativo',
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.error || 'No se pudo enviar el mensaje.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nuevo mensaje</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {dataLoading && <p className="form-info">Cargando datos...</p>}
          {error && <p className="form-error">{error}</p>}

          <div className="form-group">
            <label htmlFor="recipientIds">Para:</label>
            <select
              id="recipientIds"
              name="recipientIds"
              multiple
              value={form.recipientIds}
              disabled={loading || dataLoading || recipients.length === 0}
              onChange={e => setForm({
                ...form,
                recipientIds: Array.from(e.target.selectedOptions, option => option.value)
              })}
              className="recipients-select"
            >
              {recipients.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            {recipients.length === 0 && !dataLoading && (
              <small>No hay otros usuarios activos para enviar mensajes.</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="subjectType">Tipo de asunto:</label>
            <select
              id="subjectType"
              name="subjectType"
              value={form.subjectType}
              disabled={loading || dataLoading}
              onChange={e => setForm({ ...form, subjectType: e.target.value, subjectId: '', patientId: '' })}
            >
              <option value="administrativo">Administrativo</option>
              <option value="consulta">Consulta</option>
              <option value="informe">Informe</option>
              <option value="paciente">Paciente</option>
            </select>
          </div>

          {form.subjectType === 'paciente' && (
            <div className="form-group">
              <label htmlFor="patientId">Paciente:</label>
              <select
                id="patientId"
                name="patientId"
                value={form.patientId}
                disabled={loading || dataLoading || patients.length === 0}
                onChange={e => setForm({ ...form, patientId: e.target.value })}
              >
                <option value="">Seleccionar paciente</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {patients.length === 0 && !dataLoading && (
                <small>No hay pacientes cargados. Usá otro tipo de asunto o cargá pacientes por API.</small>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Asunto:</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              disabled={loading}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Título del mensaje"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="body">Mensaje:</label>
            <textarea
              id="body"
              name="body"
              value={form.body}
              disabled={loading}
              onChange={e => setForm({ ...form, body: e.target.value })}
              placeholder="Escribe tu mensaje..."
              rows={6}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" disabled={loading || dataLoading || recipients.length === 0} className="send-btn">
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeModal;
