// Configuración de la API del backend Spring Boot
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.5:8080', // IP de tu PC para emulador/dispositivo físico
  ENDPOINTS: {
    // Autenticación
    LOGIN: '/api/usuarios/validar',
    
    // Mesas
    MESAS: '/api/mesas',
    MESA_BY_ID: (id) => `/api/mesas/${id}`,
    MESA_DISPONIBLES: '/api/mesas/disponibles',
    
    // Pedidos
    PEDIDOS: '/api/pedidos',
    PEDIDO_BY_ID: (id) => `/api/pedidos/${id}`,
    PEDIDOS_PENDIENTES: '/api/pedidos', // No hay endpoint específico para pendientes
    ACTUALIZAR_ESTADO_PEDIDO: (id) => `/api/pedidos/actualizar-estado/${id}`,
    
    // Reservas  
    RESERVAS: '/api/reservas/mis-reservas', // Usar endpoint que existe
    RESERVA_BY_ID: (id) => `/api/reservas/${id}`,
    RESERVAS_HOY: '/api/reservas/mis-reservas', // No hay endpoint específico para hoy
    
    // Platos
    PLATOS: '/api/platos',
    PLATOS_DISPONIBLES: '/api/platos/disponibles',
    
    // Reportes
    REPORTES_VENTAS: '/api/reportes/ventas'
  }
};

// Headers por defecto para las peticiones
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};