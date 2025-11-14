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
const productoCrud = crearCrudConToken('productos');

export const CarritoService = {
  ...carritoCrud,

  vaciarCarrito: async () => {
    return await carritoCrud.delete('vaciar');
  },
  
  // Obtener items del carrito
  getItems: async () => {
    const carrito = await CarritoService.getMiCarrito();
    return carrito.items || [];
  },

  // Agregar item al carrito (POST /api/carrito/items)
  agregarItem: async (productoId, cantidad) => {
    // Nota: Esto hace POST a /api/carrito pero necesitamos /api/carrito/items
    // Solución temporal: crear un nuevo crud para items
    const token = obtenerToken();
    const itemsCrud = createCrud('carrito/items', token);
    return await itemsCrud.create({
      ProductoId: productoId,
      Cantidad: cantidad
    });
  },

  // Actualizar cantidad de item 
  actualizarCantidad: async (itemId, cantidad) => {
    const token = obtenerToken();
    const itemsCrud = createCrud('carrito/items', token);
    return await itemsCrud.update(itemId, {
      Cantidad: cantidad
    });
  },

  // Eliminar item
  eliminarItem: async (itemId) => {
    const token = obtenerToken();
    const itemsCrud = createCrud('carrito/items', token);
    return await itemsCrud.delete(itemId);
  },

  // ==================== GESTIÓN DE CUPONES ====================

  // Aplicar cupón
  aplicarCupon: async (codigo) => {
    const token = obtenerToken();
    const cuponesCrud = createCrud('carrito/cupones', token);
    return await cuponesCrud.create({
      Codigo: codigo
    });
  },

  // Remover cupón
  removerCupon: async (cuponId) => {
    const token = obtenerToken();
    const cuponesCrud = createCrud('carrito/cupones', token);
    return await cuponesCrud.delete(cuponId);
  },

  // Obtener cupones aplicados
  getCupones: async () => {
    const carrito = await CarritoService.getMiCarrito();
    return carrito.cupones || [];
  },

  
  calcularSubtotalItem: (item) => {
    return item.cantidad * item.precioUnitario;
  },

  calcularSubtotal: (items) => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  },

  calcularDescuentos: (cupones) => {
    return cupones.reduce((sum, cupon) => sum + (cupon.descuentoAplicado || 0), 0);
  },

  // Calcular total del carrito
  calcularTotal: (items, cupones = []) => {
    const subtotal = CarritoService.calcularSubtotal(items);
    const descuentos = CarritoService.calcularDescuentos(cupones);
    return subtotal - descuentos;
  },

  // Contar items en el carrito
  contarItems: (items) => {
    return items.reduce((sum, item) => sum + item.cantidad, 0);
  },

};