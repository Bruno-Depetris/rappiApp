import { createCrud } from '../api/crudFactory.js';
import * as http from '../api/httpClient.js';

const repartidorCrud = createCrud('repartidores');

export const RepartidorService = {
  ...repartidorCrud,
  
  getRepartidoresDisponibles: async () => {
    return http.get('repartidores/disponibles');
  },
  
  asignarPedido: async (repartidorId, pedidoId) => {
    return http.put(`repartidores/${repartidorId}/asignar-pedido`, { pedidoId });
  },
  
  cambiarEstado: async (id, estado) => {
    return http.put(`repartidores/${id}/estado`, { estado });
  },
  
  getRepartidorByPedido: async (pedidoId) => {
    return http.get(`repartidores/pedido/${pedidoId}`);
  }
};