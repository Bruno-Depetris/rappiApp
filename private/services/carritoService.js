import { createCrud } from '../api/crudFactory.js';

const carritoCrud = createCrud('carrito');
const productoCrud = createCrud('productos');

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
    const itemsCrud = createCrud('carrito/items');
    return await itemsCrud.create({
      ProductoId: productoId,
      Cantidad: cantidad
    });
  },

  // Actualizar cantidad de item 
  actualizarCantidad: async (itemId, cantidad) => {
    const itemsCrud = createCrud('carrito/items');
    return await itemsCrud.update(itemId, {
      Cantidad: cantidad
    });
  },

  // Eliminar item
  eliminarItem: async (itemId) => {
    const itemsCrud = createCrud('carrito/items');
    return await itemsCrud.delete(itemId);
  },

  // ==================== GESTIÓN DE CUPONES ====================

  // Aplicar cupón
  aplicarCupon: async (codigo) => {
    const cuponesCrud = createCrud('carrito/cupones');
    return await cuponesCrud.create({
      Codigo: codigo
    });
  },

  // Remover cupón
  removerCupon: async (cuponId) => {
    const cuponesCrud = createCrud('carrito/cupones');
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