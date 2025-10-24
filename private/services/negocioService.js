import { createCrud } from '../api/crudFactory.js';

const negocioCrud = createCrud('negocios');

export const NegocioService = {
  ...negocioCrud,
  
  getNegociosByCategoria: async (categoriaId) => {
    const response = await fetch(`${API_BASE}/negocios/categoria/${categoriaId}`);
    if (!response.ok) throw new Error('Negocios not found for categoria');
    return response.json();
  },
  
  getNegociosActivos: async () => {
    const response = await fetch(`${API_BASE}/negocios/activos`);
    if (!response.ok) throw new Error('Active negocios not found');
    return response.json();
  },
  
  buscarNegocios: async (termino) => {
    const response = await fetch(`${API_BASE}/negocios/buscar?q=${encodeURIComponent(termino)}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },
  
  cambiarEstadoNegocio: async (id, estado) => {
    const response = await fetch(`${API_BASE}/negocios/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    if (!response.ok) throw new Error('Failed to change negocio estado');
    return response.json();
  },
  
  getNegociosByVendedor: async (vendedorId) => {
    const response = await fetch(`${API_BASE}/negocios/vendedor/${vendedorId}`);
    if (!response.ok) throw new Error('Negocios not found for vendedor');
    return response.json();
  }
};