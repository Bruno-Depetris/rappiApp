import { createCrud } from '../api/crudFactory.js';
import { API_BASE } from '../api/httpClient.js';

const pedidoCrud = createCrud('pedidos');

// Helper para hacer peticiones HTTP
const getAuthHeaders = () => {
  const token = localStorage.getItem('rappi_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const httpGet = async (endpoint) => {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('401: Sesión expirada o no autorizada.');
    throw new Error(`GET ${endpoint} failed`);
  }
  return res.json();
};

const httpPut = async (endpoint, data) => {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('401: Sesión expirada o no autorizada.');
    throw new Error(`PUT ${endpoint} failed`);
  }
  if (res.status === 204) return null;
  return res.json();
};

export const PedidoService = {
  ...pedidoCrud,

  // ==================== MÉTODOS ANTIGUOS (mantener) ====================

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

  getPedidosPendientesLegacy: async () => {
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

  // ==================== NUEVOS MÉTODOS (Backend con JWT) ====================

  // CLIENTE - Crear pedido desde carrito (POST /pedidos)
  crearPedido: async (carritoId, metodoPagoId, resenia = null) => {
    return await pedidoCrud.create({
      CarritoId: carritoId,
      MetodoPagoId: metodoPagoId,
      Resenia: resenia
    });
  },

  // CLIENTE - Listar mis pedidos (GET /pedidos/mis-pedidos)
  getMisPedidos: async (page = 1, limit = 10) => {
    return await httpGet(`pedidos/mis-pedidos?page=${page}&limit=${limit}`);
  },

  // CLIENTE - Obtener detalle de un pedido (GET /pedidos/:id)
  getDetalle: async (pedidoId) => {
    return await pedidoCrud.getById(pedidoId);
  },

  // CLIENTE - Cancelar pedido (DELETE /pedidos/:id)
  cancelarPedido: async (pedidoId) => {
    return await pedidoCrud.delete(pedidoId);
  },

  // REPARTIDOR - Listar pedidos disponibles para tomar (GET /pedidos/repartidor/pendientes)
  getPedidosPendientes: async (page = 1, limit = 10) => {
    return await httpGet(`pedidos/repartidor/pendientes?page=${page}&limit=${limit}`);
  },

  // REPARTIDOR - Tomar/aceptar pedido (PUT /pedidos/:id/tomar)
  tomarPedido: async (pedidoId) => {
    return await httpPut(`pedidos/${pedidoId}/tomar`, {});
  },

  // REPARTIDOR - Marcar pedido como entregado (PUT /pedidos/:id/entregar)
  entregarPedido: async (pedidoId) => {
    return await httpPut(`pedidos/${pedidoId}/entregar`, {});
  },

  // VENDEDOR - Listar pedidos con mis productos (GET /pedidos/vendedor/mis-pedidos)
  getPedidosVendedor: async (estado = null, page = 1, limit = 10) => {
    const estadoQuery = estado ? `&estado=${estado}` : '';
    return await httpGet(`pedidos/vendedor/mis-pedidos?page=${page}&limit=${limit}${estadoQuery}`);
  },

  // ==================== UTILIDADES ====================

  formatearFecha: (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getTextoEstado: (estado) => {
    const textos = {
      'Pendiente': 'Pendiente',
      'EnCamino': 'En Camino',
      'Entregado': 'Entregado',
      'Cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  },

  puedeCancelar: (estado) => {
    return estado === 'Pendiente';
  },

  puedeTomar: (estado) => {
    return estado === 'Pendiente';
  },

  puedeEntregar: (estado) => {
    return estado === 'EnCamino';
  },
};