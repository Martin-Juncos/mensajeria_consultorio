import { createContext, useContext, useState, useEffect } from 'react';
import { usersApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getAll();
      const activeUsers = response.data;
      const savedUser = localStorage.getItem('currentUser');

      setUsers(activeUsers);
      setError(null);

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        const stillActiveUser = activeUsers.find((user) => user.id === parsedUser.id);

        if (stillActiveUser) {
          setCurrentUser(stillActiveUser);
        } else {
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, loading, error, login, logout, refreshUsers: fetchUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
