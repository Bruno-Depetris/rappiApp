// Configuración de la aplicación
export const APP_CONFIG = {
  // Controla si usar datos mock o la API real
  USE_MOCK_DATA: false, // FORZADO A FALSE - SOLO API REAL
  
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
  },

  // Nuevas funciones para manejo de errores de API
  handleApiError: (error, context = '') => {
    const errorMessage = error.message || 'Error de conexión con la API';
    const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;
    
    console.error('❌ Error de API:', {
      message: fullMessage,
      error: error,
      context: context,
      timestamp: new Date().toISOString()
    });

    // Si tenemos acceso a las notificaciones, mostrar error
    if (typeof window !== 'undefined' && window.Notificar) {
      window.Notificar.error(`Error de conexión: ${errorMessage}`, 6000);
    }

    return {
      success: false,
      error: true,
      message: fullMessage,
      originalError: error
    };
  },

  showApiSuccess: (message) => {
    if (typeof window !== 'undefined' && window.Notificar) {
      window.Notificar.exito(message);
    }
    ConfigUtils.showDebugLog('✅ API Success:', message);
  },

  validateApiResponse: (response, expectedFields = []) => {
    if (!response) {
      throw new Error('Respuesta de API vacía');
    }

    // Verificar campos esperados si se especifican
    for (const field of expectedFields) {
      if (!(field in response)) {
        throw new Error(`Campo requerido '${field}' no encontrado en la respuesta de la API`);
      }
    }

    return true;
  }
};