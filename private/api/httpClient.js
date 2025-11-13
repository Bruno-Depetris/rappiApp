const API_BASE = "https://rapi-api-rest-production.up.railway.app/api";

function getToken() {
  return localStorage.getItem('rappi_token');
}
function getHeaders(additionalHeaders = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...additionalHeaders
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function get(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(`GET ${endpoint} failed`);
  return res.json();
}

export async function post(endpoint, data) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    // Intentar leer cuerpo con mensaje de error del servidor
    try {
      const err = await res.json();
      const msg = err?.message || err?.error || JSON.stringify(err);
      throw new Error(`POST ${endpoint} failed: ${msg}`);
    } catch (e) {
      throw new Error(`POST ${endpoint} failed: ${res.status} ${res.statusText}`);
    }
  }

  // No parsear JSON si el backend no devuelve cuerpo
  if (res.status === 204) return null;

  return res.json();
}

export async function put(endpoint, data) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    try {
      const err = await res.json();
      const msg = err?.message || err?.error || JSON.stringify(err);
      throw new Error(`PUT ${endpoint} failed: ${msg}`);
    } catch (e) {
      throw new Error(`PUT ${endpoint} failed: ${res.status} ${res.statusText}`);
    }
  }

  if (res.status === 204) return null;

  return res.json();
}

export async function del(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!res.ok) {
    try {
      const err = await res.json();
      const msg = err?.message || err?.error || JSON.stringify(err);
      throw new Error(`DELETE ${endpoint} failed: ${msg}`);
    } catch (e) {
      throw new Error(`DELETE ${endpoint} failed: ${res.status} ${res.statusText}`);
    }
  }

  if (res.status === 204) return null;

  return res.json();
}
