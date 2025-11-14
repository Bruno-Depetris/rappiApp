import { createCrud } from '../api/crudFactory.js';

// Función auxiliar para obtener el token actual
const obtenerToken = () => localStorage.getItem('rappi_token');

// Función auxiliar para crear CRUD con token
const crearCrudConToken = (entity) => {
  return {
    getAll: () => {
      const token = obtenerToken();
      return createCrud(entity, token).getAll();
    },
    getById: (id) => {
      const token = obtenerToken();
      return createCrud(entity, token).getById(id);
    },
    create: (data) => {
      const token = obtenerToken();
      return createCrud(entity, token).create(data);
    },
    update: (id, data) => {
      const token = obtenerToken();
      return createCrud(entity, token).update(id, data);
    },
    delete: (id) => {
      const token = obtenerToken();
      return createCrud(entity, token).delete(id);
    }
  };
};

const categoriaProductoCrud = crearCrudConToken('categorias-productos');
const productoCrud = crearCrudConToken('productos');

export const CategoriaProductoService = {
  ...categoriaProductoCrud,

  // Buscar categoría por nombre
  buscarPorNombre: async (nombre) => {
    const categorias = await categoriaProductoCrud.getAll();
    return categorias.filter(cat => 
      cat.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  },

  // Obtener productos por categoría
  getProductosPorCategoria: async (categoriaId) => {
    const productos = await productoCrud.getAll();
    return productos.filter(producto => producto.categoriaId === categoriaId);
  },

  // Obtener categoría de un producto específico
  getCategoriaDeProducto: async (productoId) => {
    const producto = await productoCrud.getById(productoId);
    if (!producto.categoriaId) return null;
    return await categoriaProductoCrud.getById(producto.categoriaId);
  },

  // Contar productos por categoría
  contarProductosPorCategoria: async (categoriaId) => {
    const productos = await CategoriaProductoService.getProductosPorCategoria(categoriaId);
    return productos.length;
  },

  // Obtener categorías con productos
  getCategoriasConProductos: async () => {
    const categorias = await categoriaProductoCrud.getAll();
    const productos = await productoCrud.getAll();

    return categorias.map(cat => ({
      ...cat,
      cantidadProductos: productos.filter(p => p.categoriaId === cat.categoriaId).length
    }));
  },

  // Obtener categorías con productos disponibles 
  getCategoriasConStock: async () => {
    const categorias = await categoriaProductoCrud.getAll();
    const productos = await productoCrud.getAll();

    return categorias.filter(cat => {
      const productosCategoria = productos.filter(p => 
        p.categoriaId === cat.categoriaId && p.disponibilidad > 0
      );
      return productosCategoria.length > 0;
    });
  },

  // Ordenar categorías por nombre
  ordenarPorNombre: (categorias, ascendente = true) => {
    return [...categorias].sort((a, b) => {
      const comparison = a.nombre.localeCompare(b.nombre);
      return ascendente ? comparison : -comparison;
    });
  }







};