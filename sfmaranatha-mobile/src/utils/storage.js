import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves para el almacenamiento local
const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  APP_SETTINGS: 'appSettings'
};

export const storageService = {

  // Guardar información del usuario
  saveUserInfo: async (userInfo) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error saving user info:', error);
      throw error;
    }
  },

  // Obtener información del usuario
  getUserInfo: async () => {
    try {
      const userInfo = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  },

  // Limpiar datos de autenticación
  clearAuthData: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_INFO);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: async () => {
    try {
      const userInfo = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
      return !!userInfo;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
};

export default storageService;