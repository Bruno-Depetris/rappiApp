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

const metodoPagoCrud = crearCrudConToken('metodos-pago');

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