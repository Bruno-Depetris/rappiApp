import { createCrud } from '../api/crudFactory.js';

const usuarioCrud = createCrud('usuarios');
const negocioCrud = createCrud('negocios');
const productoCrud = createCrud('productos');
const pedidoCrud = createCrud('pedidos');
const vendedorCrud = createCrud('vendedores');

export const VendedorService = {
  ...vendedorCrud,
  
  // Obtener vendedor por ID de usuario
  getVendedorById: async (usuarioId) => {
    const vendedores = await VendedorService.getVendedores();
    return vendedores.find(v => v.usuarioId === usuarioId);
  },

  // Obtener todos los vendedores por estado
  getVendedoresByEstado: async (estado) => {
    const vendedores = await usuarioCrud.getAll();
    return vendedores.filter(v => v.rol === 'Vendedor' && v.estado === estado);
  },

  // Obtener vendedores aprobados
  getVendedoresAprobados: async () => {
    return await VendedorService.getVendedoresByEstado('Aprobado');
  },

  // Obtener vendedores pendientes
  getVendedoresPendientes: async () => {
    return await VendedorService.getVendedoresByEstado('Pendiente');
  },

  
  // Obtener MI negocio (para vendedor autenticado)
  getMiNegocio: async (vendedorId) => {
    const negocios = await negocioCrud.getAll();
    return negocios.find(n => n.vendedor?.usuarioId === vendedorId) || null;
  },

  // Actualizar MI negocio
  updateMiNegocio: async (negocioId, data) => {
    return await negocioCrud.update(negocioId, data);
  },

  
  // Obtener mis productos
  getMisProductos: async (vendedorId) => {
    const productos = await productoCrud.getAll();
    return productos.filter(p => p.vendedorId === vendedorId);
  },

  // Obtener productos disponibles (con stock)
  getProductosDisponibles: async (vendedorId) => {
    const productos = await VendedorService.getMisProductos(vendedorId);
    return productos.filter(p => p.disponibilidad > 0);
  },

  // Obtener productos sin stock
  getProductosSinStock: async (vendedorId) => {
    const productos = await VendedorService.getMisProductos(vendedorId);
    return productos.filter(p => p.disponibilidad === 0);
  },

  // Crear producto
  createProducto: async (data) => {
    return await productoCrud.create(data);
  },

  // Actualizar producto
  updateProducto: async (productoId, data) => {
    return await productoCrud.update(productoId, data);
  },

  // Eliminar producto
  deleteProducto: async (productoId) => {
    return await productoCrud.delete(productoId);
  },

  // Contar productos activos
  contarProductosActivos: async (vendedorId) => {
    const productos = await VendedorService.getProductosDisponibles(vendedorId);
    return productos.length;
  },

  
  // Obtener pedidos que contienen mis productos
  getMisPedidos: async (vendedorId) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => {
      if (!pedido.detalles) return false;
      return pedido.detalles.some(detalle => detalle.vendedorId === vendedorId);
    });
  },

  // Obtener pedidos por estado
  getMisPedidosByEstado: async (vendedorId, estado) => {
    const pedidos = await VendedorService.getMisPedidos(vendedorId);
    return pedidos.filter(pedido => pedido.estado === estado);
  },

  // Obtener pedidos pendientes
  getMisPedidosPendientes: async (vendedorId) => {
    return await VendedorService.getMisPedidosByEstado(vendedorId, 'Pendiente');
  },

  // Obtener pedidos en camino
  getMisPedidosEnCamino: async (vendedorId) => {
    return await VendedorService.getMisPedidosByEstado(vendedorId, 'EnCamino');
  },

  // Obtener pedidos entregados
  getMisPedidosEntregados: async (vendedorId) => {
    return await VendedorService.getMisPedidosByEstado(vendedorId, 'Entregado');
  },

  // Obtener solo MIS productos de un pedido
  getMisProductosDelPedido: (pedido, vendedorId) => {
    if (!pedido.detalles) return [];
    return pedido.detalles.filter(detalle => detalle.vendedorId === vendedorId);
  },

  
  // Obtener productos más vendidos (pedido al chat ni idea si anda)
  getProductosMasVendidos: async (vendedorId) => {
    const pedidos = await VendedorService.getMisPedidos(vendedorId);
    const conteo = {};
    
    pedidos.forEach(pedido => {
      if (pedido.detalles) {
        pedido.detalles.forEach(detalle => {
          if (detalle.vendedorId === vendedorId) {
            const id = detalle.productoId;
            if (!conteo[id]) {
              conteo[id] = {
                productoId: id,
                nombre: detalle.nombreProducto,
                cantidad: 0,
                totalVentas: 0
              };
            }
            conteo[id].cantidad += detalle.cantidad;
            conteo[id].totalVentas += detalle.subtotal;
          }
        });
      }
    });

    return Object.values(conteo)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  },

  


};