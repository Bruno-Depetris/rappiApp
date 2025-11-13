import { createCrud } from '../api/crudFactory.js';
import * as http from '../api/httpClient.js';

const usuarioCrud = createCrud('usuarios');
const negocioCrud = createCrud('negocios');
const categoriaCrud = createCrud('categorias');
const categoriaProductoCrud = createCrud('categorias-productos');
const cuponCrud = createCrud('cupones');
const metodoPagoCrud = createCrud('metodos-pago');
const productoCrud = createCrud('productos');
const pedidoCrud = createCrud('pedidos');

export const AdministradorService = {
  // ==================== AUTENTICACIÓN ====================
  
  // Login de administrador
  login: async (usuario, password) => {
    const response = await http.post('auth/admin/login', {
      Usuario: usuario,
      Password: password
    });
    
    if (response.access_token) {
      AdministradorService.guardarToken(response.access_token);
      AdministradorService.guardarAdmin(response.admin);
    }
    
    return response;
  },

  // Logout
  logout: () => {
    AdministradorService.eliminarToken();
    AdministradorService.eliminarAdmin();
  },

  // ==================== LOCAL STORAGE ====================
  
  // Guardar token de admin
  guardarToken: (token) => {
    localStorage.setItem('rappi_admin_token', token);
  },

  // Obtener token de admin
  obtenerToken: () => {
    return localStorage.getItem('rappi_admin_token');
  },

  // Eliminar token
  eliminarToken: () => {
    localStorage.removeItem('rappi_admin_token');
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
    const usuarios = await usuarioCrud.getAll();
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
    const usuarios = await usuarioCrud.getAll();
    return usuarios.filter(usuario => usuario.rol === rol);
  },

  // Estadísticas de usuarios
  getEstadisticasUsuarios: async () => {
    const usuarios = await usuarioCrud.getAll();
    return {
      total: usuarios.length,
      clientes: usuarios.filter(u => u.rol === 'cliente').length,
      vendedores: usuarios.filter(u => u.rol === 'vendedor').length,
      repartidores: usuarios.filter(u => u.rol === 'repartidor').length
    };
  },

  // ==================== GESTIÓN DE VENDEDORES ====================
  
  // Listar solicitudes de vendedor pendientes
  getSolicitudesVendedor: async () => {
    const negocios = await negocioCrud.getAll();
    return negocios.filter(negocio => negocio.estado === 'Pendiente');
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
    const negocios = await negocioCrud.getAll();
    return negocios.filter(n => n.estado === estado);
  },

  // ==================== GESTIÓN DE NEGOCIOS ====================
  
  // Obtener todos los negocios
  getNegocios: async (page = 1, limit = 10) => {
    const negocios = await negocioCrud.getAll();
    const inicio = (page - 1) * limit;
    const fin = inicio + limit;
    return {
      data: negocios.slice(inicio, fin),
      total: negocios.length,
      page,
      limit,
      totalPages: Math.ceil(negocios.length / limit)
    };
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
    const negocios = await negocioCrud.getAll();
    return {
      total: negocios.length,
      aprobados: negocios.filter(n => n.estado === 'Aprobado').length,
      pendientes: negocios.filter(n => n.estado === 'Pendiente').length,
      rechazados: negocios.filter(n => n.estado === 'Rechazado').length
    };
  },

  // ==================== CATEGORÍAS DE NEGOCIOS ====================
  
  // Obtener todas las categorías
  getCategorias: async () => {
    return await categoriaCrud.getAll();
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
    return await categoriaProductoCrud.getAll();
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
    const cupones = await cuponCrud.getAll();
    const inicio = (page - 1) * limit;
    const fin = inicio + limit;
    return {
      data: cupones.slice(inicio, fin),
      total: cupones.length,
      page,
      limit,
      totalPages: Math.ceil(cupones.length / limit)
    };
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
    const cupones = await cuponCrud.getAll();
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
  },

  // ==================== MÉTODOS DE PAGO ====================
  
  // Obtener todos los métodos de pago
  getMetodosPago: async () => {
    return await metodoPagoCrud.getAll();
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
    const productos = await productoCrud.getAll();
    const inicio = (page - 1) * limit;
    const fin = inicio + limit;
    return {
      data: productos.slice(inicio, fin),
      total: productos.length,
      page,
      limit,
      totalPages: Math.ceil(productos.length / limit)
    };
  },

  // Eliminar producto
  deleteProducto: async (id) => {
    return await productoCrud.delete(id);
  },

  // Estadísticas de productos
  getEstadisticasProductos: async () => {
    const productos = await productoCrud.getAll();
    return {
      total: productos.length,
      disponibles: productos.filter(p => p.disponibilidad > 0).length,
      sinStock: productos.filter(p => p.disponibilidad === 0).length,
      promedioStock: productos.length > 0 
        ? productos.reduce((sum, p) => sum + p.disponibilidad, 0) / productos.length 
        : 0
    };
  },

  // ==================== GESTIÓN DE PEDIDOS ====================
  
  // Obtener todos los pedidos
  getPedidos: async (page = 1, limit = 10) => {
    const pedidos = await pedidoCrud.getAll();
    const inicio = (page - 1) * limit;
    const fin = inicio + limit;
    return {
      data: pedidos.slice(inicio, fin),
      total: pedidos.length,
      page,
      limit,
      totalPages: Math.ceil(pedidos.length / limit)
    };
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
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => pedido.estado === estado);
  },

  // Estadísticas de pedidos
  getEstadisticasPedidos: async () => {
    const pedidos = await pedidoCrud.getAll();
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
    const pedidos = await pedidoCrud.getAll();
    return pedidos
      .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
      .slice(0, limite);
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