import { createCrud } from '../api/crudFactory.js';

const carritoCrud = createCrud('carrito');

export const CarritoService = {
  
  getMiCarrito: async () => {
    return await carritoCrud.getAll(); 
  },

  vaciarCarrito: async () => {
    return await carritoCrud.delete('vaciar');
  },


  getItems: async () => {
    const carrito = await CarritoService.getMiCarrito();
    return carrito.items || [];
  },

  agregarItem: async (productoId, cantidad) => {
    const itemsCrud = createCrud('carrito/items');
    return await itemsCrud.create({
      ProductoId: productoId,
      Cantidad: cantidad
    });
  },

  actualizarCantidad: async (itemId, cantidad) => {
    const itemsCrud = createCrud('carrito/items');
    return await itemsCrud.update(itemId, {
      Cantidad: cantidad
    });
  },

  eliminarItem: async (itemId) => {
    const itemsCrud = createCrud('carrito/items');
    return await itemsCrud.delete(itemId);
  },


  getCupones: async () => {
    const carrito = await CarritoService.getMiCarrito();
    return carrito.cupones || [];
  },

  aplicarCupon: async (codigo) => {
    const cuponesCrud = createCrud('carrito/cupones');
    return await cuponesCrud.create({
      codigo
    });
  },

  removerCupon: async (carritoCuponId) => {
    const cuponesCrud = createCrud('carrito/cupones');
    return await cuponesCrud.delete(carritoCuponId);
  },

  
  contarItems: (items) => {
    return items.reduce((sum, item) => sum + item.cantidad, 0);
  },

  productoEnCarrito: (items, productoId) => {
    return items.some(item => item.productoId === productoId);
  },

  buscarItemPorProducto: (items, productoId) => {
    return items.find(item => item.productoId === productoId);
  },

  carritoVacio: (items) => {
    return !items || items.length === 0;
  },

  formatearPrecio: (precio) => {
    return `$${precio.toLocaleString('es-AR')}`;
  },

  agruparPorVendedor: (items) => {
    return items.reduce((grupos, item) => {
      const vendedorId = item.vendedorId || 'sin_vendedor';
      if (!grupos[vendedorId]) {
        grupos[vendedorId] = {
          vendedorId,
          items: [],
          subtotal: 0
        };
      }
      grupos[vendedorId].items.push(item);
      grupos[vendedorId].subtotal += item.subtotal;
      return grupos;
    }, {});
  },

  getResumen: async () => {
    const carrito = await CarritoService.getMiCarrito();
    const items = carrito.items || [];
    const cupones = carrito.cupones || [];

    return {
      carritoId: carrito.carritoId,
      cantidadItems: items.length,
      cantidadProductos: CarritoService.contarItems(items),
      subtotal: carrito.subtotal || 0,
      totalDescuentos: carrito.totalDescuentos || 0,
      total: carrito.total || 0,
      tieneCupones: cupones.length > 0,
      estado: carrito.estado
    };
  },
};