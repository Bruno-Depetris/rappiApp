import { createCrud } from '../api/crudFactory.js';

const pedidoCrud = createCrud('pedidos');


export const PedidoService = {
  ...pedidoCrud,

  getPedidosByUsuario: async (usuarioId) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => pedido.usuarioId === usuarioId);
  },

  getPedidosByNegocio: async (negocioId) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => {
      if (!pedido.detalles) return false;
      return pedido.detalles.some(detalle => {
        return detalle.negocioId === negocioId;
      });
    });
  },

  getPedidosByRepartidor: async (repartidorId) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => pedido.repartidorId === repartidorId);
  },

  getPedidosByVendedor: async (vendedorId) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => {
      if (!pedido.detalles) return false;
      return pedido.detalles.some(detalle => detalle.vendedorId === vendedorId);
    });
  },

  getPedidosByEstado: async (estado) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => pedido.estado === estado);
  },

  getPedidosPendientes: async () => {
    return await PedidoService.getPedidosByEstado('Pendiente');
  },

  getPedidosEnCamino: async () => {
    return await PedidoService.getPedidosByEstado('EnCamino');
  },

  getPedidosEntregados: async () => {
    return await PedidoService.getPedidosByEstado('Entregado');
  },

  getPedidosCancelados: async () => {
    return await PedidoService.getPedidosByEstado('Cancelado');
  },

  getPedidosActivos: async () => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => 
      pedido.estado !== 'Entregado' && pedido.estado !== 'Cancelado'
    );
  },
  getHistorialPedidos: async (usuarioId) => {
    const pedidos = await PedidoService.getPedidosByUsuario(usuarioId);
    return pedidos.filter(pedido => 
      pedido.estado === 'Entregado' || pedido.estado === 'Cancelado'
    );
  },

  sePuedeTomar: (pedido) => {
    return pedido.estado === 'Pendiente' && !pedido.repartidorId;
  },

  calcularTotal: (pedido) => {
    return (pedido.subtotalProductos || 0) - 
          (pedido.totalDescuentos || 0) + 
          (pedido.costoEnvio || 0);
  },
};