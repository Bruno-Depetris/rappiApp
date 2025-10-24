import { createCrud } from '../api/crudFactory.js';

const metodoPagoCrud = createCrud('metodos-pago');

export const MetodoPagoService = {
  ...metodoPagoCrud,
    getMetodosPagoByUsuario: async (usuarioId) => {
    const response = await fetch(`${API_BASE}/metodos-pago/usuario/${usuarioId}`);
    if (!response.ok) throw new Error('Metodos pago not found for usuario');
    return response.json();
  },
  
  getMetodosPagoActivos: async () => {
    const response = await fetch(`${API_BASE}/metodos-pago/activos`);
    if (!response.ok) throw new Error('Active metodos pago not found');
    return response.json();
  },
  
  agregarMetodoPagoAUsuario: async (usuarioId, metodoPagoData) => {
    const response = await fetch(`${API_BASE}/metodos-pago`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId, ...metodoPagoData })
    });
    if (!response.ok) throw new Error('Failed to add metodo pago');
    return response.json();
  },
  
  validarMetodoPago: async (metodoPagoId, monto) => {
    const response = await fetch(`${API_BASE}/metodos-pago/${metodoPagoId}/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto })
    });
    if (!response.ok) throw new Error('Failed to validate metodo pago');
    return response.json();
  },
  
  procesarPago: async (metodoPagoId, monto, pedidoId) => {
    const response = await fetch(`${API_BASE}/metodos-pago/${metodoPagoId}/procesar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto, pedidoId })
    });
    if (!response.ok) throw new Error('Failed to process payment');
    return response.json();
  },
  
  establecerMetodoPagoPredeterminado: async (usuarioId, metodoPagoId) => {
    const response = await fetch(`${API_BASE}/metodos-pago/${metodoPagoId}/predeterminado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId })
    });
    if (!response.ok) throw new Error('Failed to set default metodo pago');
    return response.json();
  }
};