import { createCrud } from '../api/crudFactory.js';

const metodoPagoCrud = createCrud('metodos-pago');

export const MetodoPagoService = {
  ...metodoPagoCrud,
// Crear método de pago (solo admin)
  createMetodo: async (data) => {
    return await metodoPagoCrud.create(data);
  },

  // Actualizar método de pago (solo admin)
  updateMetodo: async (id, data) => {
    return await metodoPagoCrud.update(id, data);
  },

  // Eliminar método de pago (solo admin)
  deleteMetodo: async (id) => {
    return await metodoPagoCrud.delete(id);
  },

  // Buscar método de pago por nombre
  buscarPorNombre: async (nombre) => {
    const metodos = await metodoPagoCrud.getAll();
    return metodos.filter(metodo => 
      metodo.metodo.toLowerCase().includes(nombre.toLowerCase())
    );
  },



  
};