export const API_BASE = "https://rapi-api-rest-production.up.railway.app/api";

const getAuthHeaders = () => {
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
        headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
        if (res.status === 401) throw new Error('401: Sesión expirada o no autorizada.');
        throw new Error(`DELETE ${endpoint} failed`);
    }

    if (res.status === 204) return null;

    return res.json();
}