import { createCrud } from '../api/crudFactory.js';
import * as http from '../api/httpClient.js';

const usuarioCrud = createCrud('usuarios');
const negocioCrud = createCrud('negocios');
const categoriaCrud = createCrud('categorias');
const categoriaProductoCrud = createCrud('categorias-productos');
const cuponCrud = createCrud('cupones');
const metodoPagoCrud = createCrud('metodos-pago');
const productoCrud = createCrud('productos');
// Para pedidos, usar endpoints específicos de admin o general
const pedidoCrud = createCrud('pedidos');
const pedidosAdminCrud = createCrud('pedidos/admin'); // alternativa si pedidos falla

// Función auxiliar para normalizar respuestas (array o { data: [] })
const normalizarRespuesta = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
};

// Función auxiliar para obtener pedidos con fallback
const obtenerPedidos = async () => {
  try {
    const response = await pedidoCrud.getAll();
    return normalizarRespuesta(response);
  } catch (err1) {
    console.warn('No se pudo obtener pedidos de /pedidos, intentando /pedidos/admin:', err1.message);
    try {
      const response = await pedidosAdminCrud.getAll();
      return normalizarRespuesta(response);
    } catch (err2) {
      console.warn('No se pudo obtener pedidos de /pedidos/admin tampoco:', err2.message);
      return [];
    }
  }
};

export const AdministradorService = {
  // ==================== AUTENTICACIÓN ====================
  
  // Login de administrador
  login: async (usuario, password) => {
    // Enviar sólo las claves que la API espera: Usuario y Password
    const payload = {
      Usuario: usuario,
      Password: password
    };

    try {
      const response = await http.post('auth/admin/login', payload);

      // Aceptar distintos formatos de token/usuario en la respuesta
      const token = response?.access_token || response?.token || response?.data?.access_token || response?.data?.token;
      const adminObj = response?.admin || response?.user || response?.data?.admin || response?.data?.user;

      if (token) {
        AdministradorService.guardarToken(token);
      }
      if (adminObj) {
        AdministradorService.guardarAdmin(adminObj);
      }

      return response;
    } catch (err) {
      // Si falla con JSON (400), intentar enviar como form-urlencoded por compatibilidad
      try {
        const API_BASE = 'https://rapi-api-rest-production.up.railway.app/api';
        const form = new URLSearchParams();
        form.append('Usuario', usuario);
        form.append('Password', password);

        const res = await fetch(`${API_BASE}/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString()
        });

        if (!res.ok) {
          let errBody = null;
          try { errBody = await res.json(); } catch(e) { /* ignore */ }
          const msg = errBody?.message || errBody?.error || `${res.status} ${res.statusText}`;
          throw new Error(`auth/admin/login failed: ${msg}`);
        }

        const response = await res.json();
        const token = response?.access_token || response?.token || response?.data?.access_token || response?.data?.token;
        const adminObj = response?.admin || response?.user || response?.data?.admin || response?.data?.user;

        if (token) AdministradorService.guardarToken(token);
        if (adminObj) AdministradorService.guardarAdmin(adminObj);

        return response;
      } catch (err2) {
        // Re-lanzar el error original si la alternativa también falla
        throw err2 || err;
      }
    }
  },

  // Logout
  logout: () => {
    AdministradorService.eliminarToken();
    AdministradorService.eliminarAdmin();
  },

  // ==================== LOCAL STORAGE ====================
  
  // Guardar token de admin (se guarda como rappi_token para compatibilidad con httpClient)
  guardarToken: (token) => {
    localStorage.setItem('rappi_token', token);
  },

  // Obtener token de admin (se lee de rappi_token)
  obtenerToken: () => {
    return localStorage.getItem('rappi_token');
  },

  // Eliminar token
  eliminarToken: () => {
    localStorage.removeItem('rappi_token');
  },

  // Guardar datos de admin
  guardarAdmin: (admin) => {
    localStorage.setItem('rappi_admin', JSON.stringify(admin));
  },

  // Obtener datos de admin
  obtenerAdmin: () => {
    const data = localStorage.getItem('rappi_admin');
    return data ? JSON.parse(data) : null;
  },

  // Eliminar datos de admin
  eliminarAdmin: () => {
    localStorage.removeItem('rappi_admin');
  },

  // Verificar autenticación
  estaAutenticado: () => {
    return !!AdministradorService.obtenerToken();
  },

  // Obtener ID del admin
  obtenerAdminId: () => {
    const admin = AdministradorService.obtenerAdmin();
    return admin?.adminId || null;
  },

  // ==================== GESTIÓN DE USUARIOS ====================
  
  // Obtener todos los usuarios
  getUsuarios: async (page = 1, limit = 10) => {
    try {
      const usuariosResp = await usuarioCrud.getAll();
      const usuarios = normalizarRespuesta(usuariosResp);
      // Simular paginación
      const inicio = (page - 1) * limit;
      const fin = inicio + limit;
      return {
        data: usuarios.slice(inicio, fin),
        total: usuarios.length,
        page,
        limit,
        totalPages: Math.ceil(usuarios.length / limit)
      };
    } catch (err) {
      console.warn('No se pudo cargar usuarios:', err.message);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // Obtener usuario por ID
  getUsuarioById: async (id) => {
    return await usuarioCrud.getById(id);
  },

  // Eliminar usuario
  deleteUsuario: async (id) => {
    return await usuarioCrud.delete(id);
  },

  // Obtener usuarios por rol
  getUsuariosByRol: async (rol) => {
    try {
      const usuariosResp = await usuarioCrud.getAll();
      const usuarios = normalizarRespuesta(usuariosResp);
      return usuarios.filter(usuario => usuario.rol === rol);
    } catch (err) {
      console.warn(`No se pudo cargar usuarios por rol ${rol}:`, err.message);
      return [];
    }
  },

  // Estadísticas de usuarios
  getEstadisticasUsuarios: async () => {
    try {
      const usuariosResp = await usuarioCrud.getAll();
      const usuarios = normalizarRespuesta(usuariosResp);
      return {
        total: usuarios.length,
        clientes: usuarios.filter(u => u.rol === 'cliente').length,
        vendedores: usuarios.filter(u => u.rol === 'vendedor').length,
        repartidores: usuarios.filter(u => u.rol === 'repartidor').length
      };
    } catch (err) {
      console.warn('No se pudo cargar estadísticas de usuarios:', err.message);
      return { total: 0, clientes: 0, vendedores: 0, repartidores: 0 };
    }
  },

  // ==================== GESTIÓN DE VENDEDORES ====================
  
  // Listar solicitudes de vendedor pendientes
  getSolicitudesVendedor: async () => {
    try {
      const negociosResp = await negocioCrud.getAll();
      const negocios = normalizarRespuesta(negociosResp);
      return negocios.filter(negocio => negocio.estado === 'Pendiente');
    } catch (err) {
      console.warn('No se pudo cargar solicitudes de vendedor:', err.message);
      return [];
    }
  },

  // Aprobar vendedor
  aprobarVendedor: async (vendedorId) => {
    return await http.put(`usuarios/aprobar-vendedor/${vendedorId}`, {});
  },

  // Rechazar vendedor
  rechazarVendedor: async (vendedorId, motivo) => {
    return await http.put(`usuarios/rechazar-vendedor/${vendedorId}`, { motivo });
  },

  // Obtener vendedores por estado
  getVendedoresByEstado: async (estado) => {
    try {
      const negociosResp = await negocioCrud.getAll();
      const negocios = normalizarRespuesta(negociosResp);
      return negocios.filter(n => n.estado === estado);
    } catch (err) {
      console.warn(`No se pudo cargar vendedores por estado ${estado}:`, err.message);
      return [];
    }
  },

  // ==================== GESTIÓN DE NEGOCIOS ====================
  
  // Obtener todos los negocios
  getNegocios: async (page = 1, limit = 10) => {
    try {
      const negociosResp = await negocioCrud.getAll();
      const negocios = normalizarRespuesta(negociosResp);
      const inicio = (page - 1) * limit;
      const fin = inicio + limit;
      return {
        data: negocios.slice(inicio, fin),
        total: negocios.length,
        page,
        limit,
        totalPages: Math.ceil(negocios.length / limit)
      };
    } catch (err) {
      console.warn('No se pudo cargar negocios:', err.message);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // Obtener negocio por ID
  getNegocioById: async (id) => {
    return await negocioCrud.getById(id);
  },

  // Actualizar negocio
  updateNegocio: async (id, data) => {
    return await negocioCrud.update(id, data);
  },

  // Eliminar negocio
  deleteNegocio: async (id) => {
    return await negocioCrud.delete(id);
  },

  // Estadísticas de negocios
  getEstadisticasNegocios: async () => {
    try {
      const negociosResp = await negocioCrud.getAll();
      const negocios = normalizarRespuesta(negociosResp);
      return {
        total: negocios.length,
        aprobados: negocios.filter(n => n.estado === 'Aprobado').length,
        pendientes: negocios.filter(n => n.estado === 'Pendiente').length,
        rechazados: negocios.filter(n => n.estado === 'Rechazado').length
      };
    } catch (err) {
      console.warn('No se pudo cargar estadísticas de negocios:', err.message);
      return { total: 0, aprobados: 0, pendientes: 0, rechazados: 0 };
    }
  },

  // ==================== CATEGORÍAS DE NEGOCIOS ====================
  
  // Obtener todas las categorías
  getCategorias: async () => {
    try {
      const categoriasResp = await categoriaCrud.getAll();
      return normalizarRespuesta(categoriasResp);
    } catch (err) {
      console.warn('No se pudo cargar categorías:', err.message);
      return [];
    }
  },

  // Crear categoría
  createCategoria: async (nombre) => {
    return await categoriaCrud.create({ Categoria: nombre });
  },

  // Actualizar categoría
  updateCategoria: async (id, nombre) => {
    return await categoriaCrud.update(id, { Categoria: nombre });
  },

  // Eliminar categoría
  deleteCategoria: async (id) => {
    return await categoriaCrud.delete(id);
  },

  // ==================== CATEGORÍAS DE PRODUCTOS ====================
  
  // Obtener todas las categorías de productos
  getCategoriasProducto: async () => {
    try {
      const categoriasResp = await categoriaProductoCrud.getAll();
      return normalizarRespuesta(categoriasResp);
    } catch (err) {
      console.warn('No se pudo cargar categorías de productos:', err.message);
      return [];
    }
  },

  // Crear categoría de producto
  createCategoriaProducto: async (nombre) => {
    return await categoriaProductoCrud.create({ Categoria: nombre });
  },

  // Actualizar categoría de producto
  updateCategoriaProducto: async (id, nombre) => {
    return await categoriaProductoCrud.update(id, { Categoria: nombre });
  },

  // Eliminar categoría de producto
  deleteCategoriaProducto: async (id) => {
    return await categoriaProductoCrud.delete(id);
  },

  // ==================== GESTIÓN DE CUPONES ====================
  
  // Obtener todos los cupones
  getCupones: async (page = 1, limit = 10) => {
    try {
      const cuponesResp = await cuponCrud.getAll();
      const cupones = normalizarRespuesta(cuponesResp);
      const inicio = (page - 1) * limit;
      const fin = inicio + limit;
      return {
        data: cupones.slice(inicio, fin),
        total: cupones.length,
        page,
        limit,
        totalPages: Math.ceil(cupones.length / limit)
      };
    } catch (err) {
      console.warn('No se pudo cargar cupones:', err.message);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // Obtener cupón por ID
  getCuponById: async (id) => {
    return await cuponCrud.getById(id);
  },

  // Crear cupón
  createCupon: async (cuponData) => {
    return await cuponCrud.create(cuponData);
  },

  // Actualizar cupón
  updateCupon: async (id, cuponData) => {
    return await cuponCrud.update(id, cuponData);
  },

  // Eliminar cupón
  deleteCupon: async (id) => {
    return await cuponCrud.delete(id);
  },

  // Estadísticas de cupones
  getEstadisticasCupones: async () => {
    try {
      const cuponesResp = await cuponCrud.getAll();
      const cupones = normalizarRespuesta(cuponesResp);
      const ahora = new Date();
      const activos = cupones.filter(c => {
        const vigente = !c.fechaExpiracion || new Date(c.fechaExpiracion) > ahora;
        const conUsos = !c.usosMaximos || c.usosActuales < c.usosMaximos;
        return vigente && conUsos;
      });

      return {
        total: cupones.length,
        activos: activos.length,
        expirados: cupones.filter(c => c.fechaExpiracion && new Date(c.fechaExpiracion) < ahora).length,
        totalUsos: cupones.reduce((sum, c) => sum + (c.usosActuales || 0), 0)
      };
    } catch (err) {
      console.warn('No se pudo cargar estadísticas de cupones:', err.message);
      return { total: 0, activos: 0, expirados: 0, totalUsos: 0 };
    }
  },

  // ==================== MÉTODOS DE PAGO ====================
  
  // Obtener todos los métodos de pago
  getMetodosPago: async () => {
    try {
      const metodosResp = await metodoPagoCrud.getAll();
      return normalizarRespuesta(metodosResp);
    } catch (err) {
      console.warn('No se pudo cargar métodos de pago:', err.message);
      return [];
    }
  },

  // Obtener método de pago por ID
  getMetodoPagoById: async (id) => {
    return await metodoPagoCrud.getById(id);
  },

  // Crear método de pago
  createMetodoPago: async (metodo) => {
    return await metodoPagoCrud.create({ Metodo: metodo });
  },

  // Actualizar método de pago
  updateMetodoPago: async (id, metodo) => {
    return await metodoPagoCrud.update(id, { Metodo: metodo });
  },

  // Eliminar método de pago
  deleteMetodoPago: async (id) => {
    return await metodoPagoCrud.delete(id);
  },

  // ==================== GESTIÓN DE PRODUCTOS ====================
  
  // Obtener todos los productos
  getProductos: async (page = 1, limit = 10) => {
    try {
      const productosResp = await productoCrud.getAll();
      const productos = normalizarRespuesta(productosResp);
      const inicio = (page - 1) * limit;
      const fin = inicio + limit;
      return {
        data: productos.slice(inicio, fin),
        total: productos.length,
        page,
        limit,
        totalPages: Math.ceil(productos.length / limit)
      };
    } catch (err) {
      console.warn('No se pudo cargar productos:', err.message);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // Eliminar producto
  deleteProducto: async (id) => {
    return await productoCrud.delete(id);
  },

  // Estadísticas de productos
  getEstadisticasProductos: async () => {
    try {
      const productosResp = await productoCrud.getAll();
      const productos = normalizarRespuesta(productosResp);
      return {
        total: productos.length,
        disponibles: productos.filter(p => p.disponibilidad > 0).length,
        sinStock: productos.filter(p => p.disponibilidad === 0).length,
        promedioStock: productos.length > 0 
          ? productos.reduce((sum, p) => sum + p.disponibilidad, 0) / productos.length 
          : 0
      };
    } catch (err) {
      console.warn('No se pudo cargar estadísticas de productos:', err.message);
      return { total: 0, disponibles: 0, sinStock: 0, promedioStock: 0 };
    }
  },

  // ==================== GESTIÓN DE PEDIDOS ====================
  
  // Obtener todos los pedidos
  getPedidos: async (page = 1, limit = 10) => {
    try {
      const pedidos = await obtenerPedidos();
      const inicio = (page - 1) * limit;
      const fin = inicio + limit;
      return {
        data: pedidos.slice(inicio, fin),
        total: pedidos.length,
        page,
        limit,
        totalPages: Math.ceil(pedidos.length / limit)
      };
    } catch (err) {
      console.warn('No se pudo cargar pedidos:', err.message);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // Obtener pedido por ID
  getPedidoById: async (id) => {
    return await pedidoCrud.getById(id);
  },

  // Cancelar pedido
  cancelarPedido: async (id) => {
    return await pedidoCrud.delete(id);
  },

  // Obtener pedidos por estado
  getPedidosByEstado: async (estado) => {
    try {
      const pedidos = await obtenerPedidos();
      return pedidos.filter(pedido => pedido.estado === estado);
    } catch (err) {
      console.warn(`No se pudo cargar pedidos por estado ${estado}:`, err.message);
      return [];
    }
  },

  // Estadísticas de pedidos
  getEstadisticasPedidos: async () => {
    try {
      const pedidos = await obtenerPedidos();
      const entregados = pedidos.filter(p => p.estado === 'Entregado');
      const totalVentas = entregados.reduce((sum, p) => sum + p.total, 0);

      return {
        total: pedidos.length,
        pendientes: pedidos.filter(p => p.estado === 'Pendiente').length,
        enCamino: pedidos.filter(p => p.estado === 'EnCamino').length,
        entregados: entregados.length,
        cancelados: pedidos.filter(p => p.estado === 'Cancelado').length,
        totalVentas,
        promedioTicket: entregados.length > 0 ? totalVentas / entregados.length : 0
      };
    } catch (err) {
      console.warn('No se pudo cargar estadísticas de pedidos:', err.message);
      return {
        total: 0,
        pendientes: 0,
        enCamino: 0,
        entregados: 0,
        cancelados: 0,
        totalVentas: 0,
        promedioTicket: 0
      };
    }
  },

  // ==================== DASHBOARD ====================
  
  // Obtener dashboard completo
  getDashboard: async () => {
    const [usuarios, negocios, productos, pedidos, cupones] = await Promise.all([
      AdministradorService.getEstadisticasUsuarios(),
      AdministradorService.getEstadisticasNegocios(),
      AdministradorService.getEstadisticasProductos(),
      AdministradorService.getEstadisticasPedidos(),
      AdministradorService.getEstadisticasCupones()
    ]);

    return {
      usuarios,
      negocios,
      productos,
      pedidos,
      cupones,
      resumen: {
        solicitudesPendientes: negocios.pendientes,
        pedidosActivos: pedidos.pendientes + pedidos.enCamino,
        totalVentas: pedidos.totalVentas,
        cuponesActivos: cupones.activos
      }
    };
  },

  // Obtener actividad reciente
  getActividadReciente: async (limite = 10) => {
    try {
      const pedidos = await obtenerPedidos();
      return pedidos
        .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
        .slice(0, limite);
    } catch (err) {
      console.warn('No se pudo cargar actividad reciente:', err.message);
      return [];
    }
  },

  // ==================== REPORTES ====================
  
  // Reporte de ventas por período
  getReporteVentas: async (fechaInicio, fechaFin) => {
    const pedidos = await pedidoCrud.getAll();
    const pedidosFiltrados = pedidos.filter(p => {
      const fecha = new Date(p.fechaCreacion);
      return fecha >= new Date(fechaInicio) && 
             fecha <= new Date(fechaFin) && 
             p.estado === 'Entregado';
    });

    const totalVentas = pedidosFiltrados.reduce((sum, p) => sum + p.total, 0);

    return {
      cantidadPedidos: pedidosFiltrados.length,
      totalVentas,
      promedioTicket: pedidosFiltrados.length > 0 
        ? totalVentas / pedidosFiltrados.length 
        : 0,
      periodo: { fechaInicio, fechaFin }
    };
  },

  // Productos más vendidos
  getProductosMasVendidos: async (limite = 10) => {
    const pedidos = await pedidoCrud.getAll();
    const conteo = {};

    pedidos.filter(p => p.estado === 'Entregado').forEach(pedido => {
      if (pedido.detalles) {
        pedido.detalles.forEach(detalle => {
          const id = detalle.productoId;
          if (!conteo[id]) {
            conteo[id] = {
              productoId: id,
              nombre: detalle.nombreProducto,
              cantidad: 0,
              totalVentas: 0
            };
          }
          conteo[id].cantidad += detalle.cantidad;
          conteo[id].totalVentas += detalle.subtotal;
        });
      }
    });

    return Object.values(conteo)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, limite);
  },

  // Negocios más activos
  getNegociosMasActivos: async (limite = 10) => {
    const negocios = await negocioCrud.getAll();
    const productos = await productoCrud.getAll();

    return negocios
      .filter(n => n.estado === 'Aprobado')
      .map(negocio => ({
        ...negocio,
        cantidadProductos: productos.filter(p => 
          p.vendedorId === negocio.vendedor?.usuarioId
        ).length
      }))
      .sort((a, b) => b.cantidadProductos - a.cantidadProductos)
      .slice(0, limite);
  },

  // ==================== VALIDACIONES ====================
  
  // Validar datos de login
  validarLogin: (usuario, password) => {
    const errores = [];

    if (!usuario || usuario.length < 3) {
      errores.push('El usuario debe tener al menos 3 caracteres');
    }
    if (!password || password.length < 6) {
      errores.push('La contraseña debe tener al menos 6 caracteres');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  },

  // ==================== UTILIDADES ====================
  
  // Formatear precio
  formatearPrecio: (precio) => {
    return `$${precio.toLocaleString('es-AR')}`;
  },

  // Formatear fecha
  formatearFecha: (fecha) => {
    return fecha ? new Date(fecha).toLocaleString('es-AR') : 'N/A';
  }
};