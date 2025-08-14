import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, DEFAULT_HEADERS } from '../constants/api';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: DEFAULT_HEADERS,
  timeout: 10000
});

// Interceptor para configurar cookies/sesiones (el backend usa sesiones de Spring Security)
apiClient.interceptors.request.use(
  async (config) => {
    // El backend usa sesiones HTTP, no tokens JWT
    // Las cookies se manejan automáticamente por el navegador/axios
    config.withCredentials = true; // Importante para cookies de sesión
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Sesión expirada o inválida
      await AsyncStorage.removeItem('userInfo');
    }
    return Promise.reject(error);
  }
);

// Servicios de API
export const apiService = {
  // Autenticación
  login: async (credentials) => {
    const fullUrl = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LOGIN;
    console.log('🚀 Intentando login a:', fullUrl);
    console.log('📦 Datos enviados:', credentials);
    
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
    console.log('✅ Respuesta recibida:', response.data);
    return response.data;
  },

  // Mesas
  getMesas: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.MESAS);
    return response.data;
  },

  getMesasDisponibles: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.MESA_DISPONIBLES);
    return response.data;
  },

  updateEstadoMesa: async (mesaId, estado) => {
    // El backend usa ID y espera un RequestParam
    const response = await apiClient.put(`/api/mesas/${mesaId}/estado?nuevoEstado=${estado}`);
    return response.data;
  },

  // Pedidos
  getPedidos: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PEDIDOS);
    return response.data;
  },

  getPedidosPendientes: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PEDIDOS_PENDIENTES);
    return response.data;
  },

  createPedido: async (pedidoData) => {
    const response = await apiClient.post('/api/pedidos/nuevo', pedidoData);
    return response.data;
  },

  updateEstadoPedido: async (pedidoId, estado) => {
    const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACTUALIZAR_ESTADO_PEDIDO(pedidoId)}?nuevoEstado=${estado}`;
    console.log('🔄 Actualizando pedido a:', fullUrl);
    console.log('📊 Estado a actualizar:', estado);
    
    try {
      const response = await apiClient.put(
        `${API_CONFIG.ENDPOINTS.ACTUALIZAR_ESTADO_PEDIDO(pedidoId)}?nuevoEstado=${estado}`,
        {}, // Body vacío para PUT request
        {
          withCredentials: true, // Asegurar que se envíen cookies de sesión
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      console.log('✅ Pedido actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error completo actualizando pedido:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  cancelarPedido: async (pedidoId) => {
    console.log('🚫 Cancelando pedido:', pedidoId);
    
    try {
      const response = await apiClient.put(
        `/api/pedidos/cancelar/${pedidoId}`,
        {}, // Body vacío
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      console.log('✅ Pedido cancelado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error cancelando pedido:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Subir imagen
  uploadImage: async (imageUri, fileName) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: fileName
    });

    const response = await apiClient.post('/api/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Reservas
  getReservas: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.RESERVAS);
    return response.data;
  },

  getReservasHoy: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.RESERVAS_HOY);
    return response.data;
  },

  // Platos
  getPlatos: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PLATOS);
    return response.data;
  },

  getPlatosDisponibles: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PLATOS_DISPONIBLES);
    return response.data;
  }
};

export default apiService;