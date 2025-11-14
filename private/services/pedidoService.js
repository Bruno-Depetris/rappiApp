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

const pedidoCrud = crearCrudConToken('pedidos');


export const PedidoService = {
  ...pedidoCrud,

  // Obtener pedidos por usuario
  getPedidosByUsuario: async (usuarioId) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => pedido.usuarioId === usuarioId);
  },

  // Obtener pedidos por negocio
  getPedidosByNegocio: async (negocioId) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => {
      if (!pedido.detalles) return false;
      return pedido.detalles.some(detalle => {
        return detalle.negocioId === negocioId;
      });
    });
  },

  // Obtener pedidos por repartidor
  getPedidosByRepartidor: async (repartidorId) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => pedido.repartidorId === repartidorId);
  },

  // Obtener pedidos por vendedor (con sus productos)
  getPedidosByVendedor: async (vendedorId) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => {
      if (!pedido.detalles) return false;
      return pedido.detalles.some(detalle => detalle.vendedorId === vendedorId);
    });
  },

  // Filtrar pedidos por estado
  getPedidosByEstado: async (estado) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => pedido.estado === estado);
  },

  // Obtener pedidos pendientes
  getPedidosPendientes: async () => {
    return await PedidoService.getPedidosByEstado('Pendiente');
  },

  // Obtener pedidos en camino
  getPedidosEnCamino: async () => {
    return await PedidoService.getPedidosByEstado('EnCamino');
  },

  // Obtener pedidos entregados
  getPedidosEntregados: async () => {
    return await PedidoService.getPedidosByEstado('Entregado');
  },

  // Obtener pedidos cancelados
  getPedidosCancelados: async () => {
    return await PedidoService.getPedidosByEstado('Cancelado');
  },

  // Obtener pedidos activos (no entregados ni cancelados)
  getPedidosActivos: async () => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => 
      pedido.estado !== 'Entregado' && pedido.estado !== 'Cancelado'
    );
  },

  // Obtener historial de pedidos de un usuario (entregados y cancelados)
  getHistorialPedidos: async (usuarioId) => {
    const pedidos = await PedidoService.getPedidosByUsuario(usuarioId);
    return pedidos.filter(pedido => 
      pedido.estado === 'Entregado' || pedido.estado === 'Cancelado'
    );
  },

  // Verificar si un pedido se puede tomar (para repartidores)
  sePuedeTomar: (pedido) => {
    return pedido.estado === 'Pendiente' && !pedido.repartidorId;
  },

  // Calcular total del pedido
  calcularTotal: (pedido) => {
    return (pedido.subtotalProductos || 0) - 
          (pedido.totalDescuentos || 0) + 
          (pedido.costoEnvio || 0);
  },









};