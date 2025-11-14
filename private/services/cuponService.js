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

const cuponCrud = crearCrudConToken('cupones');

export const CuponService = {
  ...cuponCrud,

  // Obtener todos los cupones
  getCupones: async () => {
    return await cuponCrud.getAll();
  },

  // Obtener cupón por ID
  getCuponById: async (id) => {
    return await cuponCrud.getById(id);
  },

  // Obtener cupones activos (vigentes y con usos disponibles)
  getCuponesActivos: async () => {
    const cupones = await cuponCrud.getAll();
    const ahora = new Date();
    
    return cupones.filter(cupon => {
      const vigente = !cupon.fechaExpiracion || new Date(cupon.fechaExpiracion) > ahora;
      const conUsos = !cupon.usosMaximos || cupon.usosActuales < cupon.usosMaximos;
      return vigente && conUsos;
    });
  },

  // Buscar cupón por código
  buscarPorCodigo: async (codigo) => {
    const cupones = await cuponCrud.getAll();
    return cupones.find(cupon => cupon.codigo.toUpperCase() === codigo.toUpperCase());
  },

  // Validar cupón (verificar si es aplicable)
  validarCupon: async (codigo) => {
    const cupon = await CuponService.buscarPorCodigo(codigo);
    
    if (!cupon) {
      return { valido: false, razon: 'Cupón no encontrado' };
    }

    if (!CuponService.estaVigente(cupon)) {
      return { valido: false, razon: 'Cupón expirado' };
    }

    if (!CuponService.tieneUsosDisponibles(cupon)) {
      return { valido: false, razon: 'Cupón sin usos disponibles' };
    }

    return { valido: true, cupon };
  },

  // Verificar si un cupón está vigente
  estaVigente: (cupon) => {
    if (!cupon.fechaExpiracion) return true;
    return new Date() <= new Date(cupon.fechaExpiracion);
  },

  // Verificar si un cupón tiene usos disponibles
  tieneUsosDisponibles: (cupon) => {
    if (!cupon.usosMaximos) return true;
    return cupon.usosActuales < cupon.usosMaximos;
  },

  // Calcular descuento de un cupón
  calcularDescuento: (cupon, subtotal) => {
    if (cupon.tipoDescuento === 'porcentaje') {
      return (subtotal * cupon.descuento) / 100;
    } else if (cupon.tipoDescuento === 'monto') {
      return Math.min(cupon.descuento, subtotal);
    }
    return 0;
  },

  // Filtrar cupones por tipo de descuento
  getCuponesByTipo: async (tipoDescuento) => {
    const cupones = await cuponCrud.getAll();
    return cupones.filter(cupon => cupon.tipoDescuento === tipoDescuento);
  },

  // Obtener cupones de porcentaje
  getCuponesPorcentaje: async () => {
    return await CuponService.getCuponesByTipo('porcentaje');
  },

  // Obtener cupones de monto fijo
  getCuponesMonto: async () => {
    return await CuponService.getCuponesByTipo('monto');
  },

  // Obtener cupones próximos a expirar (menos de 7 días)
  getCuponesProximosAExpirar: async () => {
    const cupones = await CuponService.getCuponesActivos();
    const ahora = new Date();
    const sieteDias = 7 * 24 * 60 * 60 * 1000;

    return cupones.filter(cupon => {
      if (!cupon.fechaExpiracion) return false;
      const expiracion = new Date(cupon.fechaExpiracion);
      return (expiracion - ahora) <= sieteDias && (expiracion - ahora) > 0;
    });
  },

  // Obtener cupones más usados
  getCuponesMasUsados: async (limite = 10) => {
    const cupones = await cuponCrud.getAll();
    return cupones
      .sort((a, b) => (b.usosActuales || 0) - (a.usosActuales || 0))
      .slice(0, limite);
  },

  // Verificar si un cupón está casi agotado (más del 80% de usos)
  estaCasiAgotado: (cupon) => {
    if (!cupon.usosMaximos) return false;
    const porcentajeUso = (cupon.usosActuales / cupon.usosMaximos) * 100;
    return porcentajeUso >= 80;
  },

  // Obtener días restantes para un cupón
  getDiasRestantes: (cupon) => {
    if (!cupon.fechaExpiracion) return null;
    const ahora = new Date();
    const expiracion = new Date(cupon.fechaExpiracion);
    const diff = expiracion - ahora;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },


  // Generar código de cupón aleatorio
  generarCodigoCupon: (prefijo = 'RAPPI') => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = prefijo;
    for (let i = 0; i < 6; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  },



};