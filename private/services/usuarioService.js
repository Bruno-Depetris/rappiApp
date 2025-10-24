import { createCrud } from '../api/crudFactory.js';
import * as http from '../api/httpClient.js';

const usuarioCrud = createCrud('usuarios');

export const UsuarioService = {
  ...usuarioCrud,
  
  login: async (email, password) => {
    return http.post('usuarios/login', { email, password });
  },
  
  register: async (userData) => {
    return usuarioCrud.create(userData);
  },
  
  updateProfile: async (id, profileData) => {
    return usuarioCrud.update(id, profileData);
  },
  
  getUserByEmail: async (email) => {
    return http.get(`usuarios/email/${email}`);
  }
};