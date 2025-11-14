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

const usuarioCrud = crearCrudConToken('usuarios');
const negocioCrud = crearCrudConToken('negocios');
const productoCrud = crearCrudConToken('productos');
const pedidoCrud = crearCrudConToken('pedidos');
const vendedorCrud = crearCrudConToken('vendedores');

export const VendedorService = {
  ...vendedorCrud,
  
  // Método base para obtener vendedores
  getVendedores: async () => {
    try {
      const usuarios = await usuarioCrud.getAll();
      const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
      return usuariosArray.filter(u => u.rol === 'Vendedor');
    } catch (error) {
      console.error('Error al obtener vendedores:', error);
      return [];
    }
  },
  
  // Obtener vendedor por ID de usuario
  getVendedorById: async (usuarioId) => {
    try {
      const vendedores = await VendedorService.getVendedores();
      const vendedoresArray = Array.isArray(vendedores) ? vendedores : [];
      return vendedoresArray.find(v => v.usuarioId === usuarioId);
    } catch (error) {
      console.error('Error al obtener vendedor:', error);
      return null;
    }
  },

  // Obtener todos los vendedores por estado
  getVendedoresByEstado: async (estado) => {
    try {
      const vendedores = await usuarioCrud.getAll();
      const vendedoresArray = Array.isArray(vendedores) ? vendedores : [];
      return vendedoresArray.filter(v => v.rol === 'Vendedor' && v.estado === estado);
    } catch (error) {
      console.error('Error al obtener vendedores por estado:', error);
      return [];
    }
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
    try {
      const negocios = await negocioCrud.getAll();
      // Asegurar que negocios es un array
      const negociosArray = Array.isArray(negocios) ? negocios : [];
      return negociosArray.find(n => n.vendedor?.usuarioId === vendedorId) || null;
    } catch (error) {
      console.error('Error al obtener negocio:', error);
      return null;
    }
  },

  // Actualizar MI negocio
  updateMiNegocio: async (negocioId, data) => {
    return await negocioCrud.update(negocioId, data);
  },

  
  // Obtener mis productos
  getMisProductos: async (vendedorId) => {
    try {
      const productos = await productoCrud.getAll();
      const productosArray = Array.isArray(productos) ? productos : [];
      return productosArray.filter(p => p.vendedorId === vendedorId);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
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
    try {
      const pedidos = await pedidoCrud.getAll();
      const pedidosArray = Array.isArray(pedidos) ? pedidos : [];
      return pedidosArray.filter(pedido => {
        if (!pedido.detalles || !Array.isArray(pedido.detalles)) return false;
        return pedido.detalles.some(detalle => detalle.vendedorId === vendedorId);
      });
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return [];
    }
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