import { useAuthStore } from '../store/auth.store';
import api from '../services/api';

export function useAuth() {
  const { user, token, setAuth, logout } = useAuthStore();

  async function login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password });
    setAuth(data.user, data.token);
    return data.user;
  }

  async function register(email, password, phone) {
    const { data } = await api.post('/api/auth/register', { email, password, phone });
    setAuth(data.user, data.token);
    return data.user;
  }

  function signOut() {
    logout();
  }

  return { user, token, login, register, signOut, isAuthenticated: !!token };
}
