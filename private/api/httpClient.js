import { APP_CONFIG, ConfigUtils } from '../config/appConfig.js';

const API_BASE = APP_CONFIG.API_BASE_URL;

function buildHeaders(key) {
  const headers = { "Content-Type": "application/json" };
  if (key) {
    headers["Authorization"] = `Bearer ${key}`;
  }
  return headers;
}

// Función para manejar errores de API de manera consistente
function handleApiError(endpoint, method, error) {
  console.error(`❌ Error en ${method} ${endpoint}:`, error);
  
  // Crear un error más descriptivo
  const apiError = new Error(`Error de API: ${method} ${endpoint} falló`);
  apiError.originalError = error;
  apiError.endpoint = endpoint;
  apiError.method = method;
  
  throw apiError;
}

export async function get(endpoint, key = null) {
  ConfigUtils.showDebugLog(`🌐 Llamando API GET ${endpoint}`);
  
  try {
    const headers = key ? buildHeaders(key) : {};
    const response = await fetch(`${API_BASE}/${endpoint}`, { 
      headers,
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    ConfigUtils.showDebugLog(`✅ GET ${endpoint} exitoso`, data);
    return data;
    
  } catch (error) {
    handleApiError(endpoint, 'GET', error);
  }
}

export async function post(endpoint, data, key = null) {
  ConfigUtils.showDebugLog(`🌐 Llamando API POST ${endpoint}`, data);
  
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: buildHeaders(key),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Si la respuesta no tiene contenido (204), retornar null
    if (response.status === 204) {
      ConfigUtils.showDebugLog(`✅ POST ${endpoint} exitoso (sin contenido)`);
      return null;
    }

    const responseData = await response.json();
    ConfigUtils.showDebugLog(`✅ POST ${endpoint} exitoso`, responseData);
    return responseData;
    
  } catch (error) {
    handleApiError(endpoint, 'POST', error);
  }
}

export async function put(endpoint, data, key = null) {
  ConfigUtils.showDebugLog(`🌐 Llamando API PUT ${endpoint}`, data);
  
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "PUT",
      headers: buildHeaders(key),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Si la respuesta no tiene contenido (204), retornar null
    if (response.status === 204) {
      ConfigUtils.showDebugLog(`✅ PUT ${endpoint} exitoso (sin contenido)`);
      return null;
    }

    const responseData = await response.json();
    ConfigUtils.showDebugLog(`✅ PUT ${endpoint} exitoso`, responseData);
    return responseData;
    
  } catch (error) {
    handleApiError(endpoint, 'PUT', error);
  }
}

export async function del(endpoint, key = null) {
  ConfigUtils.showDebugLog(`🌐 Llamando API DELETE ${endpoint}`);
  
  try {
    const headers = key ? buildHeaders(key) : {};
    const response = await fetch(`${API_BASE}/${endpoint}`, { 
      method: "DELETE", 
      headers 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Si la respuesta no tiene contenido (204), retornar null
    if (response.status === 204) {
      ConfigUtils.showDebugLog(`✅ DELETE ${endpoint} exitoso (sin contenido)`);
      return null;
    }

    const responseData = await response.json();
    ConfigUtils.showDebugLog(`✅ DELETE ${endpoint} exitoso`, responseData);
    return responseData;
    
  } catch (error) {
    handleApiError(endpoint, 'DELETE', error);
  }
}
