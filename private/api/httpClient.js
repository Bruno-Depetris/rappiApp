export const API_BASE = "https://rapi-api-rest-production.up.railway.app/api";

// 🚀 Nueva función para gestionar el token
const getAuthHeaders = () => {
    // 🛑 CORRECCIÓN: Usar 'rappi_token' (la clave que realmente existe)
    const token = localStorage.getItem('rappi_token'); 
    
    const headers = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`; 
    }
    
    return headers;
};

export async function get(endpoint) {
    // 🛑 Incluimos los headers de autenticación
    const res = await fetch(`${API_BASE}/${endpoint}`, {
        headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
        if (res.status === 401) throw new Error('401: Sesión expirada o no autorizada.');
        throw new Error(`GET ${endpoint} failed`);
    }
    return res.json();
}

export async function post(endpoint, data) {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        // ✅ Usamos la función de headers
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        if (res.status === 401) throw new Error('401: Sesión expirada o no autorizada.');
        throw new Error(`POST ${endpoint} failed`);
    }

    if (res.status === 204) return null;

    return res.json();
}

export async function put(endpoint, data) {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "PUT",
        // ✅ Usamos la función de headers
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error('401: Sesión expirada o no autorizada.');
        throw new Error(`PUT ${endpoint} failed`);
    }

    if (res.status === 204) return null;

    return res.json();
}

export async function del(endpoint) {
    const res = await fetch(`${API_BASE}/${endpoint}`, { 
        method: "DELETE",
        // ✅ Usamos la función de headers
        headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
        if (res.status === 401) throw new Error('401: Sesión expirada o no autorizada.');
        throw new Error(`DELETE ${endpoint} failed`);
    }

    if (res.status === 204) return null;

    return res.json();
}