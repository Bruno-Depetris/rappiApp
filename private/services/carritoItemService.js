import { createCrud } from '../api/crudFactory.js';

const carritoItemCrud = createCrud('carrito-items');

export const CarritoItemService = {
  ...carritoItemCrud,
  
  getItemsByCarrito: async (carritoId) => {
    const response = await fetch(`${API_BASE}/carrito-items/carrito/${carritoId}`);
    if (!response.ok) throw new Error('Items not found for carrito');
    return response.json();
  },
  
  agregarItemAlCarrito: async (carritoId, productoId, cantidad) => {
    const response = await fetch(`${API_BASE}/carrito-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carritoId, productoId, cantidad })
    });
    if (!response.ok) throw new Error('Failed to add item to carrito');
    return response.json();
  },
  
  actualizarCantidadItem: async (itemId, cantidad) => {
    const response = await fetch(`${API_BASE}/carrito-items/${itemId}/cantidad`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad })
    });
    if (!response.ok) throw new Error('Failed to update item quantity');
    return response.json();
  },
  
  eliminarItemDelCarrito: async (itemId) => {
    const response = await fetch(`${API_BASE}/carrito-items/${itemId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove item from carrito');
    return response.json();
  },
  
  verificarDisponibilidadItem: async (itemId) => {
    const response = await fetch(`${API_BASE}/carrito-items/${itemId}/disponibilidad`);
    if (!response.ok) throw new Error('Failed to check item availability');
    return response.json();
  },
  
  calcularSubtotalItem: async (itemId) => {
    const response = await fetch(`${API_BASE}/carrito-items/${itemId}/subtotal`);
    if (!response.ok) throw new Error('Failed to calculate item subtotal');
    return response.json();
  }
};