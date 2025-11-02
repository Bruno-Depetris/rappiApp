import { createCrud } from '../api/crudFactory.js';

const pedidoCrud = createCrud('pedidos');

export const PedidoService = {
  ...pedidoCrud,
  
  getPedidosByUsuario: async (usuarioId) => {
    const response = await fetch(`${API_BASE}/pedidos/usuario/${usuarioId}`);
    if (!response.ok) throw new Error('Pedidos not found for usuario');
    return response.json();
  },
  
  getPedidosByNegocio: async (negocioId) => {
    const response = await fetch(`${API_BASE}/pedidos/negocio/${negocioId}`);
    if (!response.ok) throw new Error('Pedidos not found for negocio');
    return response.json();
  },
  
  getPedidosByRepartidor: async (repartidorId) => {
    const response = await fetch(`${API_BASE}/pedidos/repartidor/${repartidorId}`);
    if (!response.ok) throw new Error('Pedidos not found for repartidor');
    return response.json();
  },
  
  cambiarEstadoPedido: async (id, estado) => {
    const response = await fetch(`${API_BASE}/pedidos/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    if (!response.ok) throw new Error('Failed to change pedido estado');
    return response.json();
  },
  
  confirmarPedido: async (id) => {
    const response = await fetch(`${API_BASE}/pedidos/${id}/confirmar`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to confirm pedido');
    return response.json();
  },
  
  cancelarPedido: async (id, motivo) => {
    const response = await fetch(`${API_BASE}/pedidos/${id}/cancelar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo })
    });
    if (!response.ok) throw new Error('Failed to cancel pedido');
    return response.json();
  },
  
  calcularTiempoEntrega: async (pedidoId) => {
    const response = await fetch(`${API_BASE}/pedidos/${pedidoId}/tiempo-entrega`);
    if (!response.ok) throw new Error('Failed to calculate delivery time');
    return response.json();
  },
  
};