import { createCrud } from '../api/crudFactory.js';

const productoCrud = createCrud('productos');

export const ProductoService = {
  ...productoCrud,
  
  getProductosByNegocio: async (negocioId) => {
    const response = await fetch(`${API_BASE}/productos/negocio/${negocioId}`);
    if (!response.ok) throw new Error('Productos not found for negocio');
    return response.json();
  },
  
  getProductosByCategoria: async (categoriaId) => {
    const response = await fetch(`${API_BASE}/productos/categoria/${categoriaId}`);
    if (!response.ok) throw new Error('Productos not found for categoria');
    return response.json();
  },
  
  buscarProductos: async (termino) => {
    const response = await fetch(`${API_BASE}/productos/buscar?q=${encodeURIComponent(termino)}`);
    if (!response.ok) throw new Error('Product search failed');
    return response.json();
  },
  
  getProductosPopulares: async (limite = 10) => {
    const response = await fetch(`${API_BASE}/productos/populares?limite=${limite}`);
    if (!response.ok) throw new Error('Popular productos not found');
    return response.json();
  },
  
  getProductosEnOferta: async () => {
    const response = await fetch(`${API_BASE}/productos/ofertas`);
    if (!response.ok) throw new Error('Productos en oferta not found');
    return response.json();
  },
  
  cambiarDisponibilidad: async (id, disponible) => {
    const response = await fetch(`${API_BASE}/productos/${id}/disponibilidad`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponible })
    });
    if (!response.ok) throw new Error('Failed to change product availability');
    return response.json();
  }
};