import { createCrud } from '../api/crudFactory.js';

const categoriaProductoCrud = createCrud('categoria-productos');

export const CategoriaProductoService = {
  ...categoriaProductoCrud,
  
  getProductosPorCategoria: async (categoriaId) => {
    const response = await fetch(`${API_BASE}/categoria-productos/categoria/${categoriaId}/productos`);
    if (!response.ok) throw new Error('Productos not found for categoria');
    return response.json();
  },
  
  getCategoriasPorProducto: async (productoId) => {
    const response = await fetch(`${API_BASE}/categoria-productos/producto/${productoId}/categorias`);
    if (!response.ok) throw new Error('Categorias not found for producto');
    return response.json();
  },
  
  asignarProductoACategoria: async (productoId, categoriaId) => {
    const response = await fetch(`${API_BASE}/categoria-productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productoId, categoriaId })
    });
    if (!response.ok) throw new Error('Failed to assign producto to categoria');
    return response.json();
  },
  
  desasignarProductoDeCategoria: async (productoId, categoriaId) => {
    const response = await fetch(`${API_BASE}/categoria-productos/producto/${productoId}/categoria/${categoriaId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to unassign producto from categoria');
    return response.json();
  }
};