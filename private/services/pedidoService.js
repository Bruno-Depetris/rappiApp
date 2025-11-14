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
const detallesPedidoCrud = crearCrudConToken('detallesPedido');
const carritoCrud = crearCrudConToken('carrito');
const carritoItemCrud = crearCrudConToken('carritoItem');
const metodoPagoCrud = crearCrudConToken('metodoPago');
const productoCrud = crearCrudConToken('productos');
const usuarioCrud = crearCrudConToken('usuarios');

export const PedidoService = {
  ...pedidoCrud,

  // Crear pedido desde carrito
  crearPedidoDesdeCarrito: async (carritoId, metodoPagoId, direccionEntrega, costoEnvio = 0) => {
    try {
      // Obtener carrito y sus items
      const carrito = await carritoCrud.getById(carritoId);
      const items = await carritoItemCrud.getAll();
      const itemsCarrito = items.filter(item => 
        item.carritoId === carritoId && !item.isDeleted
      );

      if (itemsCarrito.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Crear el pedido principal
      const nuevoPedido = {
        usuarioId: carrito.usuarioId,
        repartidorId: null,
        metodoPagoId,
        subtotal: carrito.subtotal,
        totalDescuentos: carrito.totalDescuentos,
        costoEnvio,
        total: carrito.total + costoEnvio,
        estado: 'Pendiente',
        fechaCreacion: new Date().toISOString(),
        fechaEntrega: null,
        direccionEntrega,
        reseña: null,
        isDeleted: false
      };

      const pedidoCreado = await pedidoCrud.create(nuevoPedido);

      // Crear detalles del pedido
      const detalles = [];
      for (const item of itemsCarrito) {
        const detalle = {
          pedidoId: pedidoCreado.id,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal,
          isDeleted: false
        };
        const detalleCreado = await detallesPedidoCrud.create(detalle);
        detalles.push(detalleCreado);
      }

      // Vaciar carrito después de crear el pedido
      await PedidoService.vaciarCarrito(carritoId);

      return {
        ...pedidoCreado,
        detalles
      };

    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  },

  // Obtener pedidos de un usuario
  getPedidosUsuario: async (usuarioId) => {
    try {
      const pedidos = await pedidoCrud.getAll();
      const pedidosUsuario = pedidos.filter(p => 
        p.usuarioId === usuarioId && !p.isDeleted
      );

      // Enriquecer con detalles
      const pedidosCompletos = [];
      for (const pedido of pedidosUsuario) {
        const detalles = await PedidoService.getDetallesPedido(pedido.id);
        pedidosCompletos.push({
          ...pedido,
          detalles
        });
      }

      return pedidosCompletos;
    } catch (error) {
      console.error('Error al obtener pedidos del usuario:', error);
      return [];
    }
  },

  // Obtener detalles de un pedido
  getDetallesPedido: async (pedidoId) => {
    try {
      const detalles = await detallesPedidoCrud.getAll();
      return detalles.filter(d => 
        d.pedidoId === pedidoId && !d.isDeleted
      );
    } catch (error) {
      console.error('Error al obtener detalles del pedido:', error);
      return [];
    }
  },

  // Obtener pedidos por estado
  getPedidosPorEstado: async (estado) => {
    try {
      const pedidos = await pedidoCrud.getAll();
      const pedidosFiltrados = pedidos.filter(p => 
        p.estado === estado && !p.isDeleted
      );

      // Enriquecer con detalles
      const pedidosCompletos = [];
      for (const pedido of pedidosFiltrados) {
        const detalles = await PedidoService.getDetallesPedido(pedido.id);
        pedidosCompletos.push({
          ...pedido,
          detalles
        });
      }

      return pedidosCompletos;
    } catch (error) {
      console.error('Error al obtener pedidos por estado:', error);
      return [];
    }
  },

  // Obtener pedidos disponibles para repartidores
  getPedidosDisponibles: async () => {
    return await PedidoService.getPedidosPorEstado('Pendiente');
  },

  // Asignar repartidor a pedido
  asignarRepartidor: async (pedidoId, repartidorId) => {
    try {
      return await pedidoCrud.update(pedidoId, {
        repartidorId,
        estado: 'EnProceso',
        fechaAsignacion: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al asignar repartidor:', error);
      throw error;
    }
  },

  // Actualizar estado del pedido
  actualizarEstado: async (pedidoId, nuevoEstado, datosAdicionales = {}) => {
    try {
      const updateData = {
        estado: nuevoEstado,
        ...datosAdicionales
      };

      // Agregar timestamp específico según el estado
      switch (nuevoEstado) {
        case 'EnCamino':
          updateData.fechaDespacho = new Date().toISOString();
          break;
        case 'Entregado':
          updateData.fechaEntrega = new Date().toISOString();
          break;
      }

      return await pedidoCrud.update(pedidoId, updateData);
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw error;
    }
  },

  // Obtener pedidos del repartidor
  getPedidosRepartidor: async (repartidorId) => {
    try {
      const pedidos = await pedidoCrud.getAll();
      const pedidosRepartidor = pedidos.filter(p => 
        p.repartidorId === repartidorId && !p.isDeleted
      );

      // Enriquecer con detalles
      const pedidosCompletos = [];
      for (const pedido of pedidosRepartidor) {
        const detalles = await PedidoService.getDetallesPedido(pedido.id);
        pedidosCompletos.push({
          ...pedido,
          detalles
        });
      }

      return pedidosCompletos;
    } catch (error) {
      console.error('Error al obtener pedidos del repartidor:', error);
      return [];
    }
  },

  // Obtener métodos de pago
  getMetodosPago: async () => {
    try {
      return await metodoPagoCrud.getAll();
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      return [
        { id: 1, metodo: 'Efectivo' },
        { id: 2, metodo: 'Tarjeta de Crédito' },
        { id: 3, metodo: 'Transferencia' }
      ];
    }
  },

  // Agregar reseña al pedido
  agregarReseña: async (pedidoId, reseña) => {
    try {
      return await pedidoCrud.update(pedidoId, { reseña });
    } catch (error) {
      console.error('Error al agregar reseña:', error);
      throw error;
    }
  },

  // Cancelar pedido
  cancelarPedido: async (pedidoId, motivo = '') => {
    try {
      return await pedidoCrud.update(pedidoId, {
        estado: 'Cancelado',
        motivoCancelacion: motivo,
        fechaCancelacion: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      throw error;
    }
  },

  // Obtener estadísticas de pedidos
  getEstadisticasPedidos: async () => {
    try {
      const pedidos = await pedidoCrud.getAll();
      const pedidosActivos = pedidos.filter(p => !p.isDeleted);

      return {
        total: pedidosActivos.length,
        pendientes: pedidosActivos.filter(p => p.estado === 'Pendiente').length,
        enProceso: pedidosActivos.filter(p => p.estado === 'EnProceso').length,
        enCamino: pedidosActivos.filter(p => p.estado === 'EnCamino').length,
        entregados: pedidosActivos.filter(p => p.estado === 'Entregado').length,
        cancelados: pedidosActivos.filter(p => p.estado === 'Cancelado').length,
        ventasHoy: pedidosActivos
          .filter(p => {
            const hoy = new Date().toDateString();
            return new Date(p.fechaCreacion).toDateString() === hoy;
          })
          .reduce((total, p) => total + p.total, 0)
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        total: 0,
        pendientes: 0,
        enProceso: 0,
        enCamino: 0,
        entregados: 0,
        cancelados: 0,
        ventasHoy: 0
      };
    }
  },

  // Vaciar carrito (método auxiliar)
  vaciarCarrito: async (carritoId) => {
    try {
      const items = await carritoItemCrud.getAll();
      const itemsCarrito = items.filter(item => item.carritoId === carritoId);
      
      // Marcar todos los items como eliminados
      for (const item of itemsCarrito) {
        await carritoItemCrud.update(item.id, { isDeleted: true });
      }
      
      // Resetear totales del carrito
      await carritoCrud.update(carritoId, {
        subtotal: 0,
        totalDescuentos: 0,
        total: 0
      });
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
    }
  },

  // Métodos de compatibilidad con nombres anteriores
  getPedidosByUsuario: async (usuarioId) => {
    return await PedidoService.getPedidosUsuario(usuarioId);
  },

  getPedidosByEstado: async (estado) => {
    return await PedidoService.getPedidosPorEstado(estado);
  },

  getPedidosByRepartidor: async (repartidorId) => {
    return await PedidoService.getPedidosRepartidor(repartidorId);
  },

  getPedidosPendientes: async () => {
    return await PedidoService.getPedidosPorEstado('Pendiente');
  },

  getPedidosEnCamino: async () => {
    return await PedidoService.getPedidosPorEstado('EnCamino');
  },

  getPedidosEntregados: async () => {
    return await PedidoService.getPedidosPorEstado('Entregado');
  },

  sePuedeTomar: (pedido) => {
    return pedido.estado === 'Pendiente' && !pedido.repartidorId;
  },

  calcularTotal: (pedido) => {
    return (pedido.subtotal || 0) - 
           (pedido.totalDescuentos || 0) + 
           (pedido.costoEnvio || 0);
  }
};