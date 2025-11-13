import { createCrud } from '../api/crudFactory.js';
import * as http from '../api/httpClient.js';

const cuponCrud = createCrud('cupones');

export const CuponService = {
  ...cuponCrud,

  getCuponesActivos: async () => {
    return await http.get('cupones/activos');
  },

  validarCupon: async (codigo) => {
    return await http.get(`cupones/validar/${codigo}`);
  },

  getCupones: async (page = 1, limit = 10) => {
    return await http.get(`cupones?page=${page}&limit=${limit}`);
  },

  getCuponById: async (id) => {
    return await cuponCrud.getById(id);
  },

  crearCupon: async (cuponData) => {
    return await cuponCrud.create({
      Codigo: cuponData.codigo,
      Descuento: cuponData.descuento,
      TipoDescuento: cuponData.tipoDescuento, 
      FechaExpiracion: cuponData.fechaExpiracion || null,
      UsosMaximos: cuponData.usosMaximos || null,
    });
  },

  actualizarCupon: async (id, cuponData) => {
    return await cuponCrud.update(id, {
      Codigo: cuponData.codigo,
      Descuento: cuponData.descuento,
      TipoDescuento: cuponData.tipoDescuento,
      FechaExpiracion: cuponData.fechaExpiracion || null,
      UsosMaximos: cuponData.usosMaximos || null,
    });
  },

  eliminarCupon: async (id) => {
    return await cuponCrud.delete(id);
  },

  calcularDescuento: (cupon, subtotal) => {
    if (cupon.tipoDescuento === 'porcentaje') {
      return (subtotal * cupon.descuento) / 100;
    } else if (cupon.tipoDescuento === 'monto') {
      return Math.min(cupon.descuento, subtotal);
    }
    return 0;
  },

  estaVigente: (cupon) => {
    if (!cupon.fechaExpiracion) return true;
    return new Date() <= new Date(cupon.fechaExpiracion);
  },

  tieneUsosDisponibles: (cupon) => {
    if (!cupon.usosMaximos) return true;
    return cupon.usosActuales < cupon.usosMaximos;
  },

  getDiasRestantes: (cupon) => {
    if (!cupon.fechaExpiracion) return null;
    const ahora = new Date();
    const expiracion = new Date(cupon.fechaExpiracion);
    const diff = expiracion - ahora;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  estaCasiAgotado: (cupon) => {
    if (!cupon.usosMaximos) return false;
    const porcentajeUso = (cupon.usosActuales / cupon.usosMaximos) * 100;
    return porcentajeUso >= 80;
  },

  formatearCupon: (cupon) => {
    const descuentoTexto = cupon.tipoDescuento === 'porcentaje'
      ? `${cupon.descuento}%`
      : `$${cupon.descuento}`;
    
    return {
      ...cupon,
      descuentoTexto,
      diasRestantes: CuponService.getDiasRestantes(cupon),
      estaVigente: CuponService.estaVigente(cupon),
      tieneUsosDisponibles: CuponService.tieneUsosDisponibles(cupon),
      estaCasiAgotado: CuponService.estaCasiAgotado(cupon),
    };
  },

  getColorEstado: (cupon) => {
    if (!CuponService.estaVigente(cupon)) return 'danger';
    if (!CuponService.tieneUsosDisponibles(cupon)) return 'secondary';
    if (CuponService.estaCasiAgotado(cupon)) return 'warning';
    return 'success';
  },

  getTextoEstado: (cupon) => {
    if (!CuponService.estaVigente(cupon)) return 'Expirado';
    if (!CuponService.tieneUsosDisponibles(cupon)) return 'Sin usos';
    if (CuponService.estaCasiAgotado(cupon)) return 'Casi agotado';
    return 'Activo';
  },
};