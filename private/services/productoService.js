import { createCrud } from '../api/crudFactory.js';
import { API_BASE } from '../api/httpClient.js';

const productoCrud = createCrud('productos');

export const ProductoService = {
  ...productoCrud,

  async getProductosByCategoria(categoriaId) {
    try {
      let productos = await productoCrud.getAll();

      if (productos.data) productos = productos.data;
      if (!Array.isArray(productos)) throw new Error("La respuesta no es un array de productos");

      // Filtrar por categoriaProductoId
      return productos.filter(p => p.categoriaProductoId === categoriaId);
    } catch (error) {
      console.error("Error al filtrar productos por categoría:", error);
      throw error;
    }
  },


  obtenerTodos: async () => {
    const response = await fetch(`${API_BASE}/productos`);
    if (!response.ok) throw new Error('Failed to fetch productos');
    return response.json();
  },

  getProductosByNegocio: async (negocioId) => {
    const response = await fetch(`${API_BASE}/productos/negocio/${negocioId}`);
    if (!response.ok) throw new Error('Productos not found for negocio');
    return response.json();
  },
  /* 
  getProductosByCategoria: async (categoriaId) => {
    const response = await fetch(`${API_BASE}/productos/categoria/${categoriaId}`);
    if (!response.ok) throw new Error('Productos not found for categoria');
    return response.json();
  }, */
  
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