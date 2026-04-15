import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LOCALHOST_API_URL = 'http://localhost:5000/api';
const ANDROID_EMULATOR_API_URL = 'http://10.0.2.2:5000/api';
const DEPLOYED_API_URL = process.env.EXPO_PUBLIC_API_URL;

function getDefaultApiUrl() {
  if (DEPLOYED_API_URL) return DEPLOYED_API_URL;
  if (__DEV__ && Platform.OS === 'android') return ANDROID_EMULATOR_API_URL;
  if (__DEV__) return LOCALHOST_API_URL;
  return LOCALHOST_API_URL;
}

const api = axios.create({ baseURL: getDefaultApiUrl() });

api.interceptors.request.use(async cfg => {
  cfg.baseURL = getDefaultApiUrl();
  const token = await AsyncStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
