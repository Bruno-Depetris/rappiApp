import { createCrud } from '../api/crudFactory.js';
import * as http from '../api/httpClient.js';

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

const repartidorCrud = crearCrudConToken('repartidores');
const pedidoCrud = crearCrudConToken('pedidos');

export const RepartidorService = {
  ...repartidorCrud,
  
   // Obtener repartidores disponibles (que no tengan pedidos en camino)
  getRepartidoresDisponibles: async () => {
    const repartidores = await repartidorCrud.getAll();
    const pedidos = await pedidoCrud.getAll();
    
    // aca los filtras negraso
    const repartidoresOcupados = pedidos
      .filter(p => p.estado === 'EnCamino')
      .map(p => p.repartidorId);


    return repartidores.filter(r => !repartidoresOcupados.includes(r.usuarioId));
  },


  // Obtener pedidos de un repartidor
  getPedidosDeRepartidor: async (repartidorId) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => pedido.repartidorId === repartidorId);
  },

  // Obtener pedidos activos (en camino) de un repartidor
  getPedidosActivosDeRepartidor: async (repartidorId) => {
    const pedidos = await RepartidorService.getPedidosDeRepartidor(repartidorId);
    return pedidos.filter(pedido => pedido.estado === 'EnCamino');
  },

  // Obtener pedidos disponibles para tomar (para poder usarlo tipo en la vistac donde se muetran todos)
  getPedidosDisponibles: async () => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => 
      pedido.estado === 'Pendiente' && !pedido.repartidorId
    );
  },

  // Obtener repartidor asignado a un pedido
  getRepartidorByPedido: async (pedidoId) => {
    const pedido = await pedidoCrud.getById(pedidoId);
    if (!pedido || !pedido.repartidorId) return null;
    
    return await repartidorCrud.getById(pedido.repartidorId);
  },

   
};