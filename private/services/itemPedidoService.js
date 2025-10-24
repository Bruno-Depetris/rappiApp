import { createCrud } from '../api/crudFactory.js';

const itemPedidoCrud = createCrud('item-pedidos');

export const ItemPedidoService = {
  ...itemPedidoCrud,
  
  getItemsByPedido: async (pedidoId) => {
    const response = await fetch(`${API_BASE}/item-pedidos/pedido/${pedidoId}`);
    if (!response.ok) throw new Error('Items not found for pedido');
    return response.json();
  },
  
  agregarItemAlPedido: async (pedidoId, productoId, cantidad, precio) => {
    const response = await fetch(`${API_BASE}/item-pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidoId, productoId, cantidad, precio })
    });
    if (!response.ok) throw new Error('Failed to add item to pedido');
    return response.json();
  },
  
  actualizarCantidadItem: async (id, cantidad) => {
    const response = await fetch(`${API_BASE}/item-pedidos/${id}/cantidad`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad })
    });
    if (!response.ok) throw new Error('Failed to update item quantity');
    return response.json();
  },
  
  eliminarItemDelPedido: async (itemId) => {
    const response = await fetch(`${API_BASE}/item-pedidos/${itemId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove item from pedido');
    return response.json();
  },
  
  calcularTotalItems: async (pedidoId) => {
    const response = await fetch(`${API_BASE}/item-pedidos/pedido/${pedidoId}/total`);
    if (!response.ok) throw new Error('Failed to calculate items total');
    return response.json();
  }
};