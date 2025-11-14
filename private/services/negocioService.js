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

const negocioCrud = crearCrudConToken('negocios');

export const NegocioService = {
  ...negocioCrud,

  // Filtrar negocios por categoría
  getNegociosByCategoria: async (categoriaId) => {
    const negocios = await negocioCrud.getAll();
    return negocios.filter(negocio => negocio.categoriaId === categoriaId);
  },

  // Obtener negocios activos/aprobados
  getNegociosActivos: async () => {
    const negocios = await negocioCrud.getAll();
    return negocios.filter(negocio => negocio.estado === 'Aprobado');
  },

  // Obtener negocios por estado
  getNegociosByEstado: async (estado) => {
    const negocios = await negocioCrud.getAll();
    return negocios.filter(negocio => negocio.estado === estado);
  },

  // Obtener negocios pendientes de aprobación
  getNegociosPendientes: async () => {
    return await NegocioService.getNegociosByEstado('Pendiente');
  },

  // Obtener negocios rechazados
  getNegociosRechazados: async () => {
    return await NegocioService.getNegociosByEstado('Rechazado');
  },

  // Obtener negocios de un vendedor específico
  getNegociosByVendedor: async (vendedorId) => {
    const negocios = await negocioCrud.getAll();
    return negocios.filter(negocio => 
      negocio.vendedor?.usuarioId === vendedorId
    );
  },

  // Obtener MI negocio (para vendedor autenticado)
  getMiNegocio: async (vendedorId) => {
    const negocios = await NegocioService.getNegociosByVendedor(vendedorId);
    return negocios[0] || null; // Un vendedor solo tiene un negocio
  },

  // Buscar negocios por nombre
  buscarPorNombre: async (termino) => {
    const negocios = await negocioCrud.getAll();
    const terminoLower = termino.toLowerCase();
    return negocios.filter(negocio => 
      negocio.nombreNegocio.toLowerCase().includes(terminoLower)
    );
  },

  // Buscar negocios (nombre o categoría)
  buscarNegocios: async (termino) => {
    const negocios = await negocioCrud.getAll();
    const terminoLower = termino.toLowerCase();
    
    return negocios.filter(negocio => {
      const nombreMatch = negocio.nombreNegocio.toLowerCase().includes(terminoLower);
      const categoriaMatch = negocio.categoria?.nombre.toLowerCase().includes(terminoLower);
      return nombreMatch || categoriaMatch;
    });
  },

  // Filtrar negocios activos por categoría
  getNegociosActivosByCategoria: async (categoriaId) => {
    const negocios = await NegocioService.getNegociosActivos();
    return negocios.filter(negocio => negocio.categoriaId === categoriaId);
  },

  // Obtener categorías con negocios activos
  getCategoriasConNegocios: async () => {
    const negocios = await NegocioService.getNegociosActivos();
    const categoriasIds = [...new Set(negocios.map(n => n.categoriaId))];
    
    return categoriasIds.map(id => ({
      categoriaId: id,
      cantidadNegocios: negocios.filter(n => n.categoriaId === id).length
    }));
  },


  // Ordenar negocios por nombre
  ordenarPorNombre: (negocios, ascendente = true) => {
    return [...negocios].sort((a, b) => {
      const comparison = a.nombreNegocio.localeCompare(b.nombreNegocio);
      return ascendente ? comparison : -comparison;
    });
  },

  // Ordenar negocios por categoría
  ordenarPorCategoria: (negocios) => {
    return [...negocios].sort((a, b) => 
      (a.categoria?.nombre || '').localeCompare(b.categoria?.nombre || '')
    );
  }
};