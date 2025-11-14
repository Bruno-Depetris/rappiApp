// Configuración de la aplicación
export const APP_CONFIG = {
  // Controla si usar datos mock o la API real
  USE_MOCK_DATA: true, // Cambiar a false cuando la API esté completa
  
  // URL de la API
  API_BASE_URL: "https://rapi-api-rest-production.up.railway.app/api",
  
  // Configuración de autenticación
  AUTH: {
    TOKEN_KEY: 'rappi_token',
    USER_KEY: 'rappi_user',
    REMEMBER_KEY: 'rappi_remember'
  },
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    DURATION: 3000, // 3 segundos
    MAX_NOTIFICATIONS: 5
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50
  },
  
  // Configuración de desarrollo
  DEV: {
    SHOW_DEBUG_LOGS: true,
    SHOW_MOCK_NOTIFICATIONS: true,
    SIMULATE_NETWORK_DELAY: true
  },
  
  // Estados de pedidos
  ESTADOS_PEDIDO: [
    'Pendiente',
    'Confirmado', 
    'EnPreparacion',
    'Listo',
    'EnCamino',
    'Entregado',
    'Cancelado'
  ],
  
  // Roles de usuario
  ROLES_USUARIO: [
    'Cliente',
    'Vendedor', 
    'Repartidor',
    'Administrador'
  ],
  
  // Estados de negocio
  ESTADOS_NEGOCIO: [
    'Pendiente',
    'Aprobado',
    'Rechazado',
    'Suspendido'
  ]
};

// Funciones de utilidad para la configuración
export const ConfigUtils = {
  isUsingMockData: () => APP_CONFIG.USE_MOCK_DATA,
  
  getApiUrl: (endpoint = '') => {
    return `${APP_CONFIG.API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  },
  
  getAuthToken: () => {
    return localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
  },
  
  setAuthToken: (token) => {
    localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, token);
  },
  
  clearAuth: () => {
    localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.REMEMBER_KEY);
  },
  
  isValidEstadoPedido: (estado) => {
    return APP_CONFIG.ESTADOS_PEDIDO.includes(estado);
  },
  
  isValidRolUsuario: (rol) => {
    return APP_CONFIG.ROLES_USUARIO.includes(rol);
  },
  
  showDebugLog: (...args) => {
    if (APP_CONFIG.DEV.SHOW_DEBUG_LOGS) {
      console.log('[DEBUG]', ...args);
    }
  }
};