const API_BASE = "https://zetainmobiliariaapirest-production.up.railway.app/api";

export async function get(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`);
  if (!res.ok) throw new Error(`GET ${endpoint} failed`);
  return res.json();
}

export async function post(endpoint, data) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST ${endpoint} failed`);

  // No parsear JSON si el backend no devuelve cuerpo
  if (res.status === 204) return null;

  return res.json();
}

export async function put(endpoint, data) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(`PUT ${endpoint} failed`);

  if (res.status === 204) return null;

  return res.json();
}

export async function del(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE ${endpoint} failed`);

  if (res.status === 204) return null;

  return res.json();
}
