import { createCrud } from '../api/crudFactory.js';
import * as http from '../api/httpClient.js';

const usuarioCrud = createCrud('usuarios');

export const UsuarioService = {
  ...usuarioCrud,

  register: async (nombre, email, password, direccion) => {
    const response = await http.post('auth/register', {
      Nombre: nombre,
      Email: email,
      Password: password,
      Direccion: direccion
    });
    
    if (response.access_token) {
      UsuarioService.guardarToken(response.access_token);
      UsuarioService.guardarUsuario(response.user);
    }
    
    return response;
  },

  login: async (email, password) => {
    const response = await http.post('auth/login', {
      Email: email,
      Password: password
    });
    
    if (response.access_token) {
      UsuarioService.guardarToken(response.access_token);
      UsuarioService.guardarUsuario(response.user);
    }
    
    return response;
  },

  logout: () => {
    UsuarioService.eliminarToken();
    UsuarioService.eliminarUsuario();
  },

  guardarToken: (token) => {
    localStorage.setItem('rappi_token', token);
  },

  obtenerToken: () => {
    return localStorage.getItem('rappi_token');
  },

  eliminarToken: () => {
    localStorage.removeItem('rappi_token');
  },

  guardarUsuario: (usuario) => {
    localStorage.setItem('rappi_usuario', JSON.stringify(usuario));
  },

  obtenerUsuario: () => {
    const data = localStorage.getItem('rappi_usuario');
    return data ? JSON.parse(data) : null;
  },

  eliminarUsuario: () => {
    localStorage.removeItem('rappi_usuario');
  },

  estaAutenticado: () => {
    return !!UsuarioService.obtenerToken();
  },

  obtenerRol: () => {
    const usuario = UsuarioService.obtenerUsuario();
    return usuario?.rol || null;
  },

  obtenerUsuarioId: () => {
    const usuario = UsuarioService.obtenerUsuario();
    return usuario?.usuarioId || null;
  },

  esAdmin: () => UsuarioService.obtenerRol() === 'admin',
  esVendedor: () => UsuarioService.obtenerRol() === 'vendedor',
  esRepartidor: () => UsuarioService.obtenerRol() === 'repartidor',
  esCliente: () => UsuarioService.obtenerRol() === 'cliente',


  validarEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },


  validarPassword: (password) => {
    return password.length >= 6;
  },

  validarRegistro: (datos) => {
    const errores = [];

    if (!datos.nombre || datos.nombre.trim().length < 3) {
      errores.push('El nombre debe tener al menos 3 caracteres');
    }
    if (!datos.email || !UsuarioService.validarEmail(datos.email)) {
      errores.push('El email no es válido');
    }

    if (!datos.password || !UsuarioService.validarPassword(datos.password)) {
      errores.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (!datos.direccion || datos.direccion.trim().length < 10) {
      errores.push('La dirección debe tener al menos 10 caracteres');
    }

    return {
      valido: errores.length === 0,
      errores: errores
    };
  },

  getUsuarios: async () => {
    return await usuarioCrud.getAll();
  },

  getPerfil: async () => {
  return await http.get('usuarios/perfil');
  },
  getUsuarioById: async (id) => {
    return await usuarioCrud.getById(id);
  },

  buscarPorEmail: async (email) => {
    const usuarios = await usuarioCrud.getAll();
    return usuarios.find(u => u.email === email);
  }
};
