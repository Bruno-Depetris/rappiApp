import { createCrud } from '../api/crudFactory.js';
const administradorCrud = createCrud('administradores');

export const AdministradorService = {
  ...administradorCrud,
  
  loginAdmin: async (email, password) => {
    const response = await fetch(`${API_BASE}/administradores/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Admin login failed');
    return response.json();
  },
  
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE}/administradores/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to get dashboard stats');
    return response.json();
  },
  
  aprobarNegocio: async (negocioId) => {
    const response = await fetch(`${API_BASE}/administradores/aprobar-negocio/${negocioId}`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to approve negocio');
    return response.json();
  },
  
  rechazarNegocio: async (negocioId, motivo) => {
    const response = await fetch(`${API_BASE}/administradores/rechazar-negocio/${negocioId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo })
    });
    if (!response.ok) throw new Error('Failed to reject negocio');
    return response.json();
  }
};