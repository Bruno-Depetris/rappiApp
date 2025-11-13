import { createCrud } from '../api/crudFactory.js';

const pedidoCrud = createCrud('pedidos');

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