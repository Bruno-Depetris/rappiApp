import { createCrud } from '../api/crudFactory.js';

const productoCrud = createCrud('productos');

export const ProductoService = {
  ...productoCrud, // con esto se puede llamar a los basicos getAll, getById, create, update, delete

  getProductos: async () => {
    return await productoCrud.getAll();
  },

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