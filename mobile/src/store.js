import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStore = create((set) => ({
  user: null,
  token: null,

  login: async (user, token) => {
    await AsyncStorage.setItem('token', token);
    set({ user, token });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));