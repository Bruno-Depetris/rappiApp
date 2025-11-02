import { createCrud } from '../api/crudFactory.js';
import * as http from '../api/httpClient.js';

const vendedorCrud = createCrud('vendedores');

export const VendedorService = {
  ...vendedorCrud,

  getVendedoresByNegocio: async (negocioId) => {
    return http.get(`vendedores/negocio/${negocioId}`);
  },

  activarVendedor: async (id) => {
    return http.put(`vendedores/${id}/activar`, {});
  },

  desactivarVendedor: async (id) => {
    return http.put(`vendedores/${id}/desactivar`, {});
  },

  //negocio asociado al vendedor
  getMiNegocio: async () => {
    const negocios = await negocioCrud.getAll();
    return negocios[0];
  },

  

};