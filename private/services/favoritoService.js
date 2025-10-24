import { createCrud } from '../api/crudFactory.js';

const favoritoCrud = createCrud('favoritos');

export const FavoritoService = {
  ...favoritoCrud,
  
  getFavoritosByUsuario: async (usuarioId) => {
    const response = await fetch(`${API_BASE}/favoritos/usuario/${usuarioId}`);
    if (!response.ok) throw new Error('Favoritos not found for usuario');
    return response.json();
  },
  
  agregarAFavoritos: async (usuarioId, productoId) => {
    const response = await fetch(`${API_BASE}/favoritos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId, productoId })
    });
    if (!response.ok) throw new Error('Failed to add to favoritos');
    return response.json();
  },
  
  eliminarDeFavoritos: async (usuarioId, productoId) => {
    const response = await fetch(`${API_BASE}/favoritos/usuario/${usuarioId}/producto/${productoId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove from favoritos');
    return response.json();
  },
  
  verificarSiEsFavorito: async (usuarioId, productoId) => {
    const response = await fetch(`${API_BASE}/favoritos/verificar?usuarioId=${usuarioId}&productoId=${productoId}`);
    if (!response.ok) throw new Error('Failed to check if is favorito');
    return response.json();
  },
  
  getProductosFavoritosByCategoria: async (usuarioId, categoriaId) => {
    const response = await fetch(`${API_BASE}/favoritos/usuario/${usuarioId}/categoria/${categoriaId}`);
    if (!response.ok) throw new Error('Favoritos not found for categoria');
    return response.json();
  },
  
  contarFavoritosByProducto: async (productoId) => {
    const response = await fetch(`${API_BASE}/favoritos/producto/${productoId}/count`);
    if (!response.ok) throw new Error('Failed to count favoritos for producto');
    return response.json();
  }
};