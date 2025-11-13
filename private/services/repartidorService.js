import { createCrud } from '../api/crudFactory.js';
import * as http from '../api/httpClient.js';

const repartidorCrud = createCrud('repartidores');
const pedidoCrud = createCrud('pedidos');
const pedidosPendientesCrud = createCrud('pedidos/repartidor/pendientes');
const pedidosAceptadosCrud = createCrud('pedidos/repartidor/aceptados');
const pedidosEntregarCrud = createCrud('pedidos'); // Para usar el endpoint /pedidos/:id/entregar

export const RepartidorService = {
  ...repartidorCrud,

  getRepartidoresDisponibles: async () => {
    const repartidores = await RepartidorService.getRepartidores();
    const pedidos = await pedidoCrud.getAll();

    const repartidoresOcupados = pedidos
      .filter(p => p.estado === 'EnCamino')
      .map(p => p.repartidorId);


    return repartidores.filter(r => !repartidoresOcupados.includes(r.usuarioId));
  },


  getPedidosDeRepartidor: async (repartidorId) => {
    try {
      const response = await pedidosAceptadosCrud.getAll();
      return response.data || response || [];
    } catch (err) {
      console.error('Error obteniendo pedidos del repartidor:', err);
      return [];
    }
  },

  getPedidosActivosDeRepartidor: async (repartidorId) => {
    const pedidos = await RepartidorService.getPedidosDeRepartidor(repartidorId);
    return pedidos.filter(pedido => pedido.estado === 'EnCamino');
  },

  getPedidosDisponibles: async () => {
    try {
      const response = await pedidosPendientesCrud.getAll();
      return response.data || response || [];
    } catch (err) {
      console.error('Error obteniendo pedidos disponibles:', err);
      return [];
    }
  },

  getRepartidorByPedido: async (pedidoId) => {
    const pedido = await pedidoCrud.getById(pedidoId);
    if (!pedido || !pedido.repartidorId) return null;
    
    return await RepartidorService.getRepartidorById(pedido.repartidorId);
  },

  marcarEntregado: async (pedidoId) => {
    try {
      return await http.put(`pedidos/${pedidoId}/entregar`, {});
    } catch (err) {
      console.error('Error al marcar pedido como entregado:', err);
      throw err;
    }
  },

  tomarPedido: async (pedidoId) => {
    try {
      return await http.put(`pedidos/${pedidoId}/tomar`, {});
    } catch (err) {
      console.error('Error al tomar pedido:', err);
      throw err;
    }
  }
};