import { createCrud } from '../api/crudFactory.js';

const cuponCrud = createCrud('cupones');

export const CuponService = {
  ...cuponCrud,
  
  getCuponesActivos: async () => {
    const response = await fetch(`${API_BASE}/cupones/activos`);
    if (!response.ok) throw new Error('Active cupones not found');
    return response.json();
  },
  
  getCuponesByUsuario: async (usuarioId) => {
    const response = await fetch(`${API_BASE}/cupones/usuario/${usuarioId}`);
    if (!response.ok) throw new Error('Cupones not found for usuario');
    return response.json();
  },
  
  validarCupon: async (codigo, usuarioId, montoCompra) => {
    const response = await fetch(`${API_BASE}/cupones/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, usuarioId, montoCompra })
    });
    if (!response.ok) throw new Error('Failed to validate cupon');
    return response.json();
  },
  
  aplicarCupon: async (codigo, usuarioId, pedidoId) => {
    const response = await fetch(`${API_BASE}/cupones/aplicar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, usuarioId, pedidoId })
    });
    if (!response.ok) throw new Error('Failed to apply cupon');
    return response.json();
  },
  
  getCuponesPorCategoria: async (categoriaId) => {
    const response = await fetch(`${API_BASE}/cupones/categoria/${categoriaId}`);
    if (!response.ok) throw new Error('Cupones not found for categoria');
    return response.json();
  },
  
  getCuponesPorNegocio: async (negocioId) => {
    const response = await fetch(`${API_BASE}/cupones/negocio/${negocioId}`);
    if (!response.ok) throw new Error('Cupones not found for negocio');
    return response.json();
  },
  
  generarCodigoCupon: async () => {
    const response = await fetch(`${API_BASE}/cupones/generar-codigo`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to generate cupon code');
    return response.json();
  },
  
  desactivarCupon: async (cuponId) => {
    const response = await fetch(`${API_BASE}/cupones/${cuponId}/desactivar`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to deactivate cupon');
    return response.json();
  }
};