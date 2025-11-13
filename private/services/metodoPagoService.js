import { createCrud } from '../api/crudFactory.js';

const metodoPagoCrud = createCrud('metodos-pago');

export const MetodoPagoService = {
  getAll: async () => {
    return await metodoPagoCrud.getAll();
  },

  getById: async (id) => {
    return await metodoPagoCrud.getById(id);
  },

  crear: async (metodo) => {
    return await metodoPagoCrud.create({
      Metodo: metodo
    });
  },

  actualizar: async (id, metodo) => {
    return await metodoPagoCrud.update(id, {
      Metodo: metodo
    });
  },

  eliminar: async (id) => {
    return await metodoPagoCrud.delete(id);
  },

};