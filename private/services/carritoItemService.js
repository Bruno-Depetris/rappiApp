import { createCrud } from './api/crudFactory.js';
import { CarritoService } from './carritoService.js';

const carritoCrud = createCrud('carrito');
const carritoItemCrud = createCrud('carrito/items');
const carritoCuponCrud = createCrud('carrito/cupones');
const productoCrud = createCrud('productos');


export const CarritoItemService = {
  ...carritoItemCrud,

  // Vaciar carrito (DELETE /api/carrito/vaciar)
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
    return await carritoItemCrud.create({
      ProductoId: productoId,
      Cantidad: cantidad
    });
  },

  // Actualizar cantidad de item (PUT /api/carrito/items/:id)
  actualizarCantidad: async (itemId, cantidad) => {
    return await carritoItemCrud.update(itemId, {
      Cantidad: cantidad
    });
  },

  // Eliminar item (DELETE /api/carrito/items/:id)
  eliminarItem: async (itemId) => {
    return await carritoItemCrud.delete(itemId);
  },

  // ==================== GESTIÓN DE CUPONES ====================
  
  // Aplicar cupón (POST /api/carrito/cupones)
  aplicarCupon: async (codigo) => {
    return await carritoCuponCrud.create({
      Codigo: codigo
    });
  },

  // Remover cupón (DELETE /api/carrito/cupones/:id)
  removerCupon: async (cuponId) => {
    return await carritoCuponCrud.delete(cuponId);
  },

  // Obtener cupones aplicados
  getCupones: async () => {
    const carrito = await CarritoService.getMiCarrito();
    return carrito.cupones || [];
  },

  // ==================== CÁLCULOS ====================
  
  // Calcular subtotal de un item
  calcularSubtotalItem: (item) => {
    return item.cantidad * item.precioUnitario;
  },

  // Calcular subtotal del carrito
  calcularSubtotal: (items) => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  },

  // Calcular total de descuentos
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

  // ==================== VALIDACIONES ====================
  
  // Verificar disponibilidad de un producto
  verificarDisponibilidad: async (productoId, cantidadSolicitada) => {
    const producto = await productoCrud.getById(productoId);
    return {
      disponible: producto.disponibilidad >= cantidadSolicitada,
      stock: producto.disponibilidad,
      cantidadSolicitada
    };
  },

  // Verificar disponibilidad de todos los items del carrito
  verificarDisponibilidadCarrito: async () => {
    const items = await CarritoService.getItems();
    const productosNoDisponibles = [];

    for (const item of items) {
      const verificacion = await CarritoService.verificarDisponibilidad(
        item.productoId, 
        item.cantidad
      );
      
      if (!verificacion.disponible) {
        productosNoDisponibles.push({
          ...item,
          stockDisponible: verificacion.stock
        });
      }
    }

    return {
      todosDisponibles: productosNoDisponibles.length === 0,
      productosNoDisponibles
    };
  },

  // Validar que el carrito no esté vacío
  carritoVacio: (items) => {
    return !items || items.length === 0;
  },

  // ==================== BÚSQUEDAS Y FILTROS ====================
  
  // Buscar item en el carrito por producto ID
  buscarItemPorProducto: (items, productoId) => {
    return items.find(item => item.productoId === productoId);
  },

  // Verificar si un producto ya está en el carrito
  productoEnCarrito: (items, productoId) => {
    return items.some(item => item.productoId === productoId);
  },

  // Agrupar items por vendedor
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

  // ==================== UTILIDADES ====================
  
  // Obtener resumen del carrito
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

  // Formatear precio
  formatearPrecio: (precio) => {
    return `$${precio.toLocaleString('es-AR')}`;
  },

  // Obtener productos del carrito (con toda su info)
  getProductosCompletos: async () => {
    const items = await CarritoService.getItems();
    const productos = [];

    for (const item of items) {
      const producto = await productoCrud.getById(item.productoId);
      productos.push({
        ...producto,
        cantidadEnCarrito: item.cantidad,
        carritoItemId: item.carritoItemId
      });
    }

    return productos;
  },

  // Verificar si el carrito puede convertirse en pedido
  puedeCrearPedido: async () => {
    const carrito = await CarritoService.getMiCarrito();
    const items = carrito.items || [];
    
    if (items.length === 0) {
      return { puede: false, razon: 'El carrito está vacío' };
    }

    const verificacion = await CarritoService.verificarDisponibilidadCarrito();
    if (!verificacion.todosDisponibles) {
      return { 
        puede: false, 
        razon: 'Hay productos sin stock suficiente',
        productos: verificacion.productosNoDisponibles
      };
    }

    return { puede: true };
  }
};