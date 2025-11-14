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

const productoCrud = crearCrudConToken('productos');

export const ProductoService = {
  ...productoCrud, // con esto se puede llamar a los basicos getAll, getById, create, update, delete



  getProductosByCategoria: async (categoriaId) => {
    const allProductos = await productoCrud.getAll();
    return allProductos.filter(producto => producto.categoriaProductoId === categoriaId);
    
  },

  getProductosByVendedor: async (vendedorId) => {
    const allProductos = await productoCrud.getAll();
    return allProductos.filter(producto => producto.vendedorId === vendedorId);
  },

  getProductosPorNombre: async (nombre) => {
    const allProductos = await productoCrud.getAll();
    return allProductos.filter(producto => producto.nombre.toLowerCase().includes(nombre.toLowerCase()));
  }

};