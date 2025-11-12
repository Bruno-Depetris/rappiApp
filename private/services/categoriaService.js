import { createCrud } from '../api/crudFactory.js';

const categoriaCrud = createCrud('categorias');
const negocioCrud = createCrud('negocios');

export const CategoriaService = {
  ...categoriaCrud,


  // Buscar categoría por nombre
  buscarPorNombre: async (nombre) => {
    const categorias = await categoriaCrud.getAll();
    return categorias.filter(cat => 
      cat.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  },

  // Obtener negocios por categoría
  getNegociosPorCategoria: async (categoriaId) => {
    const negocios = await negocioCrud.getAll();
    return negocios.filter(negocio => negocio.categoriaId === categoriaId);
  },

  // Obtener negocios activos por categoría
  getNegociosActivosPorCategoria: async (categoriaId) => {
    const negocios = await negocioCrud.getAll();
    return negocios.filter(negocio => 
      negocio.categoriaId === categoriaId && negocio.estado === 'Aprobado'
    );
  },

  // Contar negocios por categoría
  contarNegociosPorCategoria: async (categoriaId) => {
    const negocios = await CategoriaService.getNegociosPorCategoria(categoriaId);
    return negocios.length;
  },

  // Obtener categorías con negocios
  getCategoriasConNegocios: async () => {
    const categorias = await categoriaCrud.getAll();
    const negocios = await negocioCrud.getAll();

    return categorias.map(cat => ({
      ...cat,
      cantidadNegocios: negocios.filter(n => n.categoriaId === cat.categoriaId).length
    }));
  },

  // Obtener categorías con negocios activos
  getCategoriasConNegociosActivos: async () => {
    const categorias = await categoriaCrud.getAll();
    const negocios = await negocioCrud.getAll();

    return categorias.filter(cat => {
      const negociosActivos = negocios.filter(n => 
        n.categoriaId === cat.categoriaId && n.estado === 'Aprobado'
      );
      return negociosActivos.length > 0;
    }).map(cat => ({
      ...cat,
      cantidadNegociosActivos: negocios.filter(n => 
        n.categoriaId === cat.categoriaId && n.estado === 'Aprobado'
      ).length
    }));
  },

  // Ordenar categorías por nombre
  ordenarPorNombre: (categorias, ascendente = true) => {
    return [...categorias].sort((a, b) => {
      const comparison = a.nombre.localeCompare(b.nombre);
      return ascendente ? comparison : -comparison;
    });
  },

  // Ordenar categorías por cantidad de negocios
  ordenarPorCantidadNegocios: async (ascendente = false) => {
    const categoriasConNegocios = await CategoriaService.getCategoriasConNegocios();
    return categoriasConNegocios.sort((a, b) => {
      const comparison = b.cantidadNegocios - a.cantidadNegocios;
      return ascendente ? -comparison : comparison;
    });
  },

  // Verificar si una categoría tiene negocios
  tieneNegocios: async (categoriaId) => {
    const count = await CategoriaService.contarNegociosPorCategoria(categoriaId);
    return count > 0;
  },

  // Obtener categoría más popular (con más negocios)
  getCategoriaMasPopular: async () => {
    const categorias = await CategoriaService.ordenarPorCantidadNegocios(false);
    return categorias[0] || null;
  }



};