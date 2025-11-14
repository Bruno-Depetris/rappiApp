import { createCrud } from '../api/crudFactory.js';
import * as http from '../api/httpClient.js';

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

const usuarioCrud = crearCrudConToken('usuarios');

export const UsuarioService = {
  ...usuarioCrud,

  // ==================== AUTENTICACIÓN ====================
  
  // Registro de usuario
  register: async (nombre, email, password, direccion) => {
    const response = await http.post('auth/register', {
      nombre: nombre,
      email: email,
      password: password,
      direccion: direccion,
      rol: 'Cliente', // Rol por defecto
      estado: 'Activo'
    });
    
    // Simular respuesta de autenticación exitosa
    if (response) {
      const token = 'mock_token_' + Math.random().toString(36);
      const user = {
        id: response.id,
        nombre: response.nombre,
        email: response.email,
        rol: response.rol || 'Cliente',
        estado: response.estado || 'Activo'
      };
      
      UsuarioService.guardarToken(token);
      UsuarioService.guardarUsuario(user);
      
      return { access_token: token, user: user };
    }
    
    return response;
  },

  // Login de usuario
  login: async (email, password) => {
    try {
      const response = await http.post('auth/login', {
        email: email,
        password: password
      });
      
      // Si estamos usando datos mock, simular login exitoso
      if (response || true) { // Siempre exitoso en mock
        const token = 'mock_token_' + Math.random().toString(36);
        
        // Buscar usuario por email en datos mock o crear uno temporal
        const usuarios = await usuarioCrud.getAll();
        let user = usuarios.find(u => u.email === email);
        
        if (!user) {
          // Determinar rol basado en el email para testing
          let rol = 'Cliente';
          if (email.includes('admin')) rol = 'Administrador';
          else if (email.includes('vendor') || email.includes('vendedor')) rol = 'Vendedor';
          else if (email.includes('delivery') || email.includes('repartidor')) rol = 'Repartidor';
          
          user = {
            id: Math.floor(Math.random() * 1000) + 100,
            nombre: email.split('@')[0],
            email: email,
            rol: rol,
            estado: 'Activo'
          };
        }
        
        UsuarioService.guardarToken(token);
        UsuarioService.guardarUsuario(user);
        
        return { access_token: token, user: user };
      }
      
      return response;
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error('Credenciales incorrectas');
    }
  },

  // Logout
  logout: () => {
    UsuarioService.eliminarToken();
    UsuarioService.eliminarUsuario();
  },

  // ==================== LOCAL STORAGE ====================
  
  // Guardar token
  guardarToken: (token) => {
    localStorage.setItem('rappi_token', token);
  },

  // Obtener token
  obtenerToken: () => {
    return localStorage.getItem('rappi_token');
  },

  // Eliminar token
  eliminarToken: () => {
    localStorage.removeItem('rappi_token');
  },

  // Guardar usuario
  guardarUsuario: (usuario) => {
    localStorage.setItem('rappi_usuario', JSON.stringify(usuario));
  },

  // Obtener usuario
  obtenerUsuario: () => {
    const data = localStorage.getItem('rappi_usuario');
    return data ? JSON.parse(data) : null;
  },

  // Eliminar usuario
  eliminarUsuario: () => {
    localStorage.removeItem('rappi_usuario');
  },

  // Verificar autenticación
  estaAutenticado: () => {
    return !!UsuarioService.obtenerToken();
  },

  // ==================== UTILIDADES DE ROL ====================
  
  // Obtener rol
  obtenerRol: () => {
    const usuario = UsuarioService.obtenerUsuario();
    return usuario?.rol || null;
  },

  // Obtener usuario ID
  obtenerUsuarioId: () => {
    const usuario = UsuarioService.obtenerUsuario();
    return usuario?.id || null;
  },

  // Verificar roles
  esAdmin: () => UsuarioService.obtenerRol() === 'Administrador',
  esVendedor: () => UsuarioService.obtenerRol() === 'Vendedor',
  esRepartidor: () => UsuarioService.obtenerRol() === 'Repartidor',
  esCliente: () => UsuarioService.obtenerRol() === 'Cliente',

  // ==================== VALIDACIONES ====================
  
  // Validar email
  validarEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Validar password
  validarPassword: (password) => {
    return password.length >= 6;
  },

  // Validar registro completo
  validarRegistro: (datos) => {
    const errores = [];

    // Validar nombre
    if (!datos.nombre || datos.nombre.trim().length < 3) {
      errores.push('El nombre debe tener al menos 3 caracteres');
    }

    // Validar email
    if (!datos.email || !UsuarioService.validarEmail(datos.email)) {
      errores.push('El email no es válido');
    }

    // Validar password
    if (!datos.password || !UsuarioService.validarPassword(datos.password)) {
      errores.push('La contraseña debe tener al menos 6 caracteres');
    }

    // Validar dirección
    if (!datos.direccion || datos.direccion.trim().length < 10) {
      errores.push('La dirección debe tener al menos 10 caracteres');
    }

    return {
      valido: errores.length === 0,
      errores: errores
    };
  },

  // ==================== GESTIÓN DE USUARIOS ====================
  
  // Obtener todos los usuarios
  getUsuarios: async () => {
    return await usuarioCrud.getAll();
  },

  // Obtener usuario por ID
  getUsuarioById: async (id) => {
    return await usuarioCrud.getById(id);
  },

  // Buscar por email
  buscarPorEmail: async (email) => {
    const usuarios = await usuarioCrud.getAll();
    return usuarios.find(u => u.email === email);
  }
};
