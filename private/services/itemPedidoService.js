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

export const ItemPedidoService = {
  ...pedidoCrud,
  // NOTA: Los items de pedido NO se gestionan directamente.
  // Se generan automáticamente desde el carrito al crear un pedido.

  // Obtener items de un pedido
  getItemsByPedido: async (pedidoId) => {
    const pedido = await pedidoCrud.getById(pedidoId);
    return pedido.detalles || [];
  },

  // Calcular total de items
  calcularTotalItems: (items) => {
    return items.reduce((total, item) => total + (item.subtotal || 0), 0);
  }
};