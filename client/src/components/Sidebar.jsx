import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ unreadCount }) => {
  const { currentUser, logout, users, login, loading, error } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Mensajería</h2>
      </div>

      <div className="sidebar-user">
        <select
          id="current-user"
          name="currentUser"
          aria-label="Usuario actual"
          value={currentUser?.id || ''}
          disabled={loading || users.length === 0}
          onChange={(e) => {
            const user = users.find((u) => u.id === e.target.value);
            if (user) {
              login(user);
            }
          }}
          className="user-select"
        >
          <option value="">
            {loading
              ? 'Cargando usuarios...'
              : users.length === 0
                ? 'No hay usuarios activos'
                : 'Seleccionar usuario'}
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
        {currentUser && (
          <button onClick={logout} className="logout-btn">
            Cerrar sesión
          </button>
        )}
        {error && <p className="sidebar-error">{error}</p>}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          Bandeja de entrada
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </NavLink>
        <NavLink to="/sent" className={({ isActive }) => isActive ? 'active' : ''}>
          Enviados
        </NavLink>
        <NavLink to="/compose" className={({ isActive }) => isActive ? 'active' : ''}>
          Redactar
        </NavLink>
      </nav>

      {currentUser && (
        <div className="sidebar-footer">
          <p>{currentUser.name}</p>
          <small>{currentUser.role}</small>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
