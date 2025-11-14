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

const carritoCrud = crearCrudConToken('carrito');
const carritoItemCrud = crearCrudConToken('carritoItem');
const carritoCuponCrud = crearCrudConToken('carritoCupon');
const productoCrud = crearCrudConToken('productos');

export const CarritoService = {
  ...carritoCrud,

  // Obtener MI carrito (para usuario autenticado)
  getMiCarrito: async (usuarioId = null) => {
    try {
      const carritos = await carritoCrud.getAll();
      const carritosArray = Array.isArray(carritos) ? carritos : [];
      
      // Buscar carrito del usuario
      let carrito = carritosArray.find(c => c.usuarioId === usuarioId);
      
      if (!carrito) {
        // Crear carrito nuevo si no existe
        carrito = await CarritoService.crearCarritoVacio(usuarioId);
      }
      
      // Obtener items del carrito
      const items = await CarritoService.getItemsCarrito(carrito.id);
      const cupones = await CarritoService.getCuponesCarrito(carrito.id);
      
      return {
        ...carrito,
        items,
        cupones
      };
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      return { items: [], cupones: [], total: 0 };
    }
  },

  // Crear carrito vacío
  crearCarritoVacio: async (usuarioId) => {
    const nuevoCarrito = {
      usuarioId,
      subtotal: 0,
      totalDescuentos: 0,
      total: 0,
      fechaCreacion: new Date().toISOString()
    };
    return await carritoCrud.create(nuevoCarrito);
  },

  // Obtener items del carrito
  getItemsCarrito: async (carritoId) => {
    try {
      const items = await carritoItemCrud.getAll();
      const itemsCarrito = items.filter(item => 
        item.carritoId === carritoId && !item.isDeleted
      );
      
      // Enriquecer con datos del producto
      const productos = await productoCrud.getAll();
      
      return itemsCarrito.map(item => {
        const producto = productos.find(p => p.id === item.productoId);
        return {
          ...item,
          nombreProducto: producto?.nombre || 'Producto no encontrado',
          imagen: producto?.imagenes || '',
          descripcion: producto?.descripcion || ''
        };
      });
    } catch (error) {
      console.error('Error al obtener items del carrito:', error);
      return [];
    }
  },

  // Obtener cupones del carrito
  getCuponesCarrito: async (carritoId) => {
    try {
      const carritoCupones = await carritoCuponCrud.getAll();
      return carritoCupones.filter(cc => 
        cc.carritoId === carritoId && !cc.isDeleted
      );
    } catch (error) {
      console.error('Error al obtener cupones del carrito:', error);
      return [];
    }
  },

  // Agregar producto al carrito
  agregarProducto: async (usuarioId, productoId, cantidad = 1) => {
    try {
      // Obtener o crear carrito
      const carrito = await CarritoService.getMiCarrito(usuarioId);
      
      // Verificar si el producto ya está en el carrito
      const itemExistente = carrito.items.find(item => item.productoId === productoId);
      
      if (itemExistente) {
        // Actualizar cantidad
        return await CarritoService.actualizarCantidadItem(
          itemExistente.id, 
          itemExistente.cantidad + cantidad
        );
      } else {
        // Agregar nuevo item
        const producto = await productoCrud.getById(productoId);
        const nuevoItem = {
          carritoId: carrito.id,
          productoId,
          cantidad,
          precioUnitario: producto.precio,
          subtotal: producto.precio * cantidad,
          isDeleted: false
        };
        
        const itemCreado = await carritoItemCrud.create(nuevoItem);
        await CarritoService.recalcularTotales(carrito.id);
        return itemCreado;
      }
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      throw error;
    }
  },

  // Actualizar cantidad de item
  actualizarCantidadItem: async (itemId, nuevaCantidad) => {
    try {
      const item = await carritoItemCrud.getById(itemId);
      const nuevoSubtotal = item.precioUnitario * nuevaCantidad;
      
      const itemActualizado = await carritoItemCrud.update(itemId, {
        cantidad: nuevaCantidad,
        subtotal: nuevoSubtotal
      });
      
      await CarritoService.recalcularTotales(item.carritoId);
      return itemActualizado;
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      throw error;
    }
  },

  // Eliminar item del carrito
  eliminarItem: async (itemId) => {
    try {
      const item = await carritoItemCrud.getById(itemId);
      await carritoItemCrud.update(itemId, { isDeleted: true });
      await CarritoService.recalcularTotales(item.carritoId);
    } catch (error) {
      console.error('Error al eliminar item:', error);
      throw error;
    }
  },

  // Aplicar cupón
  aplicarCupon: async (carritoId, cuponId, descuentoAplicado) => {
    try {
      const carritoCupon = {
        carritoId,
        cuponId,
        descuentoAplicado,
        fechaAplicacion: new Date().toISOString(),
        isDeleted: false
      };
      
      const resultado = await carritoCuponCrud.create(carritoCupon);
      await CarritoService.recalcularTotales(carritoId);
      return resultado;
    } catch (error) {
      console.error('Error al aplicar cupón:', error);
      throw error;
    }
  },

  // Recalcular totales del carrito
  recalcularTotales: async (carritoId) => {
    try {
      const items = await CarritoService.getItemsCarrito(carritoId);
      const cupones = await CarritoService.getCuponesCarrito(carritoId);
      
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const totalDescuentos = cupones.reduce((sum, cupon) => sum + cupon.descuentoAplicado, 0);
      const total = subtotal - totalDescuentos;
      
      await carritoCrud.update(carritoId, {
        subtotal,
        totalDescuentos,
        total
      });
      
      return { subtotal, totalDescuentos, total };
    } catch (error) {
      console.error('Error al recalcular totales:', error);
      throw error;
    }
  },

  // Vaciar carrito
  vaciarCarrito: async (carritoId) => {
    try {
      const items = await CarritoService.getItemsCarrito(carritoId);
      
      // Marcar todos los items como eliminados
      for (const item of items) {
        await carritoItemCrud.update(item.id, { isDeleted: true });
      }
      
      // Limpiar cupones también
      const cupones = await CarritoService.getCuponesCarrito(carritoId);
      for (const cupon of cupones) {
        await carritoCuponCrud.update(cupon.id, { isDeleted: true });
      }
      
      // Resetear totales
      await carritoCrud.update(carritoId, {
        subtotal: 0,
        totalDescuentos: 0,
        total: 0
      });
      
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      throw error;
    }
  },

  // Obtener cantidad total de items
  obtenerCantidadTotal: (items) => {
    return items.reduce((total, item) => total + item.cantidad, 0);
  }
};