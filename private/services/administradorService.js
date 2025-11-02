import { createCrud } from '../api/crudFactory.js';
const administradorCrud = createCrud('administradores');

export const AdministradorService = {
  ...administradorCrud,
  
  
};