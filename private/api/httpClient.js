const API_BASE = "https://rapi-api-rest-production.up.railway.app/api";

function buildHeaders(key) {
  const headers = { "Content-Type": "application/json" };
  if (key) {
    headers["Authorization"] = `Bearer ${key}`;
  }
  return headers;
}

export async function get(endpoint, key = null) {
  const headers = key ? buildHeaders(key) : {};
  const res = await fetch(`${API_BASE}/${endpoint}`, { headers });
  if (!res.ok) throw new Error(`GET ${endpoint} failed`);
  return res.json();
}

export async function post(endpoint, data, key = null) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: buildHeaders(key),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST ${endpoint} failed`);

  // No parsear JSON si el backend no devuelve cuerpo
  if (res.status === 204) return null;

  return res.json();
}

export async function put(endpoint, data, key = null) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "PUT",
    headers: buildHeaders(key),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(`PUT ${endpoint} failed`);

  if (res.status === 204) return null;

  return res.json();
}

export async function del(endpoint, key = null) {
  const headers = key ? buildHeaders(key) : {};
  const res = await fetch(`${API_BASE}/${endpoint}`, { method: "DELETE", headers });
  if (!res.ok) throw new Error(`DELETE ${endpoint} failed`);

  if (res.status === 204) return null;

  return res.json();
}
