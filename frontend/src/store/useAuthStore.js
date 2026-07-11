import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post(`http://localhost:5000/api/auth/login`, { email, password });
      set({ userInfo: data, loading: false });
      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
      const msg = error.response && error.response.data.message ? error.response.data.message : error.message;
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  setUserInfo: (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    set({ userInfo: data });
  },

  logout: () => {
    localStorage.removeItem('userInfo');
    set({ userInfo: null });
  }
}));

export default useAuthStore;
