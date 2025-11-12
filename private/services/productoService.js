import { createCrud } from '../api/crudFactory.js';
import { API_BASE } from '../api/httpClient.js';

const productoCrud = createCrud('productos');

export const ProductoService = {
  ...productoCrud,

  ontenerTodos: async () => {
    const response = await fetch(`${API_BASE}/productos`);
    if (!response.ok) throw new Error('Failed to fetch productos');
    return response.json();
  },


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

  getProductosPorNombre: async (nombre) => {
    const allProductos = await productoCrud.getAll();
    return allProductos.filter(producto => producto.nombre.toLowerCase().includes(nombre.toLowerCase()));
  }

};