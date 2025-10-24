import { createCrud } from '../api/crudFactory.js';

const carritoCrud = createCrud('carritos');

export const CarritoService = {
  ...carritoCrud,
    getCarritoByUsuario: async (usuarioId) => {
    const response = await fetch(`${API_BASE}/carritos/usuario/${usuarioId}`);
    if (!response.ok) throw new Error('Carrito not found for usuario');
    return response.json();
  },
  
  crearCarritoParaUsuario: async (usuarioId) => {
    const response = await fetch(`${API_BASE}/carritos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId })
    });
    if (!response.ok) throw new Error('Failed to create carrito');
    return response.json();
  },
  
  vaciarCarrito: async (carritoId) => {
    const response = await fetch(`${API_BASE}/carritos/${carritoId}/vaciar`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to empty carrito');
    return response.json();
  },
  
  calcularTotalCarrito: async (carritoId) => {
    const response = await fetch(`${API_BASE}/carritos/${carritoId}/total`);
    if (!response.ok) throw new Error('Failed to calculate carrito total');
    return response.json();
  },
  
  aplicarCuponAlCarrito: async (carritoId, cuponCodigo) => {
    const response = await fetch(`${API_BASE}/carritos/${carritoId}/aplicar-cupon`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuponCodigo })
    });
    if (!response.ok) throw new Error('Failed to apply coupon to carrito');
    return response.json();
  },
  
  convertirCarritoAPedido: async (carritoId, metodoPagoId) => {
    const response = await fetch(`${API_BASE}/carritos/${carritoId}/convertir-pedido`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metodoPagoId })
    });
    if (!response.ok) throw new Error('Failed to convert carrito to pedido');
    return response.json();
  }
};