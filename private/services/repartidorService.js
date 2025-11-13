import { createCrud } from '../api/crudFactory.js';
import * as http from '../api/httpClient.js';

const repartidorCrud = createCrud('repartidores');
const pedidoCrud = createCrud('pedidos');
const pedidosPendientesCrud = createCrud('pedidos/repartidor/pendientes');
const pedidosAceptadosCrud = createCrud('pedidos/repartidor/aceptados');
const pedidosEntregarCrud = createCrud('pedidos'); // Para usar el endpoint /pedidos/:id/entregar

export const RepartidorService = {
  ...repartidorCrud,
  
   // Obtener repartidores disponibles (que no tengan pedidos en camino)
  getRepartidoresDisponibles: async () => {
    const repartidores = await RepartidorService.getRepartidores();
    const pedidos = await pedidoCrud.getAll();
    
    // aca los filtras negraso
    const repartidoresOcupados = pedidos
      .filter(p => p.estado === 'EnCamino')
      .map(p => p.repartidorId);


    return repartidores.filter(r => !repartidoresOcupados.includes(r.usuarioId));
  },


  // Obtener pedidos de un repartidor (aceptados por el repartidor)
  getPedidosDeRepartidor: async (repartidorId) => {
    try {
      const response = await pedidosAceptadosCrud.getAll();
      // El servidor devuelve { data: [...], limit, page, total, totalPages }
      return response.data || response || [];
    } catch (err) {
      console.error('Error obteniendo pedidos del repartidor:', err);
      return [];
    }
  },

  // Obtener pedidos activos (en camino) de un repartidor
  getPedidosActivosDeRepartidor: async (repartidorId) => {
    const pedidos = await RepartidorService.getPedidosDeRepartidor(repartidorId);
    return pedidos.filter(pedido => pedido.estado === 'EnCamino');
  },

  // Obtener pedidos disponibles para tomar (pendientes)
  getPedidosDisponibles: async () => {
    try {
      const response = await pedidosPendientesCrud.getAll();
      // El servidor devuelve { data: [...], limit, page, total, totalPages }
      return response.data || response || [];
    } catch (err) {
      console.error('Error obteniendo pedidos disponibles:', err);
      return [];
    }
  },

  // Obtener repartidor asignado a un pedido
  getRepartidorByPedido: async (pedidoId) => {
    const pedido = await pedidoCrud.getById(pedidoId);
    if (!pedido || !pedido.repartidorId) return null;
    
    return await RepartidorService.getRepartidorById(pedido.repartidorId);
  },

  // Marcar pedido como entregado
  marcarEntregado: async (pedidoId) => {
    try {
      return await http.put(`pedidos/${pedidoId}/entregar`, {});
    } catch (err) {
      console.error('Error al marcar pedido como entregado:', err);
      throw err;
    }
  },

  // Tomar un pedido pendiente (asignarlo al repartidor)
  tomarPedido: async (pedidoId) => {
    try {
      // El endpoint espera una actualización del pedido: PUT /api/pedidos/:id/tomar
      return await http.put(`pedidos/${pedidoId}/tomar`, {});
    } catch (err) {
      console.error('Error al tomar pedido:', err);
      throw err;
    }
  }

};