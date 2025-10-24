import { createCrud } from '../api/crudFactory.js';

const categoriaCrud = createCrud('categorias');

export const CategoriaService = {
  ...categoriaCrud,
  
  getCategoriasActivas: async () => {
    const response = await fetch(`${API_BASE}/categorias/activas`);
    if (!response.ok) throw new Error('Active categorias not found');
    return response.json();
  },
  
  getCategoriasPadre: async () => {
    const response = await fetch(`${API_BASE}/categorias/padre`);
    if (!response.ok) throw new Error('Parent categorias not found');
    return response.json();
  },
  
  getSubcategorias: async (categoriaId) => {
    const response = await fetch(`${API_BASE}/categorias/${categoriaId}/subcategorias`);
    if (!response.ok) throw new Error('Subcategorias not found');
    return response.json();
  },
  
  ordenarCategorias: async (orden) => {
    const response = await fetch(`${API_BASE}/categorias/ordenar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orden })
    });
    if (!response.ok) throw new Error('Failed to order categorias');
    return response.json();
  }
};