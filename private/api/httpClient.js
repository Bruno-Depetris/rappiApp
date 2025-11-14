import { getMockData, getMockById } from '../data/mockData.js';
import { APP_CONFIG, ConfigUtils } from '../config/appConfig.js';

const API_BASE = APP_CONFIG.API_BASE_URL;

function buildHeaders(key) {
  const headers = { "Content-Type": "application/json" };
  if (key) {
    headers["Authorization"] = `Bearer ${key}`;
  }
  return headers;
}

export async function get(endpoint, key = null) {
  // Si estamos en modo mock, usar datos locales
  if (APP_CONFIG.USE_MOCK_DATA) {
    ConfigUtils.showDebugLog(`🔧 Usando datos mock para GET ${endpoint}`);
    
    // Extraer la entidad del endpoint
    const parts = endpoint.split('/');
    const entity = parts[0];
    const id = parts[1];
    
    if (id) {
      return await getMockById(entity, id);
    } else {
      return await getMockData(entity);
    }
  }
  
  // Intentar usar la API real como fallback
  try {
    const headers = key ? buildHeaders(key) : {};
    const res = await fetch(`${API_BASE}/${endpoint}`, { headers });
    if (!res.ok) throw new Error(`GET ${endpoint} failed`);
    return res.json();
  } catch (error) {
    console.warn(`⚠️ API falló para ${endpoint}, usando datos mock`, error);
    // Fallback a datos mock si la API falla
    const parts = endpoint.split('/');
    const entity = parts[0];
    const id = parts[1];
    
    if (id) {
      return await getMockById(entity, id);
    } else {
      return await getMockData(entity);
    }
  }
}

export async function post(endpoint, data, key = null) {
  if (APP_CONFIG.USE_MOCK_DATA) {
    ConfigUtils.showDebugLog(`🔧 Usando datos mock para POST ${endpoint}`, data);
    const { createMockData } = await import('../data/mockData.js');
    const entity = endpoint.split('/')[0];
    return await createMockData(entity, data);
  }
  
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: buildHeaders(key),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`POST ${endpoint} failed`);

    // No parsear JSON si el backend no devuelve cuerpo
    if (res.status === 204) return null;

    return res.json();
  } catch (error) {
    console.warn(`⚠️ API falló para POST ${endpoint}, usando datos mock`, error);
    const { createMockData } = await import('../data/mockData.js');
    const entity = endpoint.split('/')[0];
    return await createMockData(entity, data);
  }
}

export async function put(endpoint, data, key = null) {
  if (APP_CONFIG.USE_MOCK_DATA) {
    ConfigUtils.showDebugLog(`🔧 Usando datos mock para PUT ${endpoint}`, data);
    const { updateMockData } = await import('../data/mockData.js');
    const parts = endpoint.split('/');
    const entity = parts[0];
    const id = parts[1];
    return await updateMockData(entity, id, data);
  }
  
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "PUT",
      headers: buildHeaders(key),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`PUT ${endpoint} failed`);

    if (res.status === 204) return null;

    return res.json();
  } catch (error) {
    console.warn(`⚠️ API falló para PUT ${endpoint}, usando datos mock`, error);
    const { updateMockData } = await import('../data/mockData.js');
    const parts = endpoint.split('/');
    const entity = parts[0];
    const id = parts[1];
    return await updateMockData(entity, id, data);
  }
}

export async function del(endpoint, key = null) {
  if (APP_CONFIG.USE_MOCK_DATA) {
    ConfigUtils.showDebugLog(`🔧 Usando datos mock para DELETE ${endpoint}`);
    const { deleteMockData } = await import('../data/mockData.js');
    const parts = endpoint.split('/');
    const entity = parts[0];
    const id = parts[1];
    return await deleteMockData(entity, id);
  }
  
  try {
    const headers = key ? buildHeaders(key) : {};
    const res = await fetch(`${API_BASE}/${endpoint}`, { method: "DELETE", headers });
    if (!res.ok) throw new Error(`DELETE ${endpoint} failed`);

    if (res.status === 204) return null;

    return res.json();
  } catch (error) {
    console.warn(`⚠️ API falló para DELETE ${endpoint}, usando datos mock`, error);
    const { deleteMockData } = await import('../data/mockData.js');
    const parts = endpoint.split('/');
    const entity = parts[0];
    const id = parts[1];
    return await deleteMockData(entity, id);
  }
}
