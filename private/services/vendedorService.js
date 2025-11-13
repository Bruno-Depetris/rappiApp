import * as http from '../api/httpClient.js';
import { createCrud } from '../api/crudFactory.js';

const usuarioCrud = createCrud('usuarios');
const negocioCrud = createCrud('negocios');
const productoCrud = createCrud('productos');
const pedidoCrud = createCrud('pedidos');

export const VendedorService = {
  getMiNegocio: async () => {
    return await http.get('negocios/mi-negocio');
  },

  // Actualizar mi negocio (PUT /negocios/:id)
  actualizarMiNegocio: async (negocioId, negocioData) => {
    return await http.put(`negocios/${negocioId}`, {
      Nombre: negocioData.nombre,
      Direccion: negocioData.direccion,
      Telefono: negocioData.telefono,
      HorarioApertura: negocioData.horarioApertura,
      HorarioCierre: negocioData.horarioCierre,
      CategoriaId: negocioData.categoriaId,
    });
  },

  // Eliminar mi negocio (DELETE /negocios/:id)
  eliminarMiNegocio: async (negocioId) => {
    return await http.del(`negocios/${negocioId}`);
  },

  // ==================== MIS PRODUCTOS ====================
  
  // Obtener mis productos usando el endpoint correcto (GET /productos/mis-productos)
  getMisProductos: async () => {
    return await http.get('productos/mis-productos');
  },

  // Obtener productos disponibles (con stock) - filtrado local
  getProductosDisponibles: (productos) => {
    return productos.filter(p => p.disponibilidad > 0);
  },

  // Obtener productos sin stock - filtrado local
  getProductosSinStock: (productos) => {
    return productos.filter(p => p.disponibilidad === 0);
  },

  // Contar productos activos
  contarProductosActivos: (productos) => {
    return productos.filter(p => p.disponibilidad > 0).length;
  },

  // Subir imagen de producto (POST /productos/subir-imagen)
  subirImagenProducto: async (file) => {
    const formData = new FormData();
    formData.append('imagen', file);

    const token = localStorage.getItem('rappi_token');
    const API_BASE = "https://rapi-api-rest-production.up.railway.app/api";
    
    const response = await fetch(`${API_BASE}/productos/subir-imagen`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error al subir imagen');
    }

    return response.json();
  },

  // Crear producto (POST /productos)
  crearProducto: async (productoData) => {
    return await http.post('productos', {
      Nombre: productoData.nombre,
      Descripcion: productoData.descripcion,
      Precio: productoData.precio,
      Disponibilidad: productoData.disponibilidad,
      ImagenUrl: productoData.imagenUrl,
      CategoriaProductoId: productoData.categoriaProductoId,
    });
  },

  // Actualizar producto (PUT /productos/:id)
  actualizarProducto: async (productoId, productoData) => {
    return await http.put(`productos/${productoId}`, {
      Nombre: productoData.nombre,
      Descripcion: productoData.descripcion,
      Precio: productoData.precio,
      Disponibilidad: productoData.disponibilidad,
      ImagenUrl: productoData.imagenUrl,
      CategoriaProductoId: productoData.categoriaProductoId,
    });
  },

  // Eliminar producto (DELETE /productos/:id)
  eliminarProducto: async (productoId) => {
    return await http.del(`productos/${productoId}`);
  },

  // ==================== MIS PEDIDOS ====================
  
  // Obtener pedidos con mis productos usando el endpoint correcto (GET /pedidos/vendedor/mis-pedidos)
  getMisPedidos: async (estado = null, page = 1, limit = 10) => {
    const estadoQuery = estado ? `&estado=${estado}` : '';
    return await http.get(`pedidos/vendedor/mis-pedidos?page=${page}&limit=${limit}${estadoQuery}`);
  },

  // Obtener pedidos por estado
  getMisPedidosByEstado: async (estado, page = 1, limit = 10) => {
    return await VendedorService.getMisPedidos(estado, page, limit);
  },

  // Obtener pedidos pendientes
  getMisPedidosPendientes: async (page = 1, limit = 10) => {
    return await VendedorService.getMisPedidos('Pendiente', page, limit);
  },

  // Obtener pedidos en camino
  getMisPedidosEnCamino: async (page = 1, limit = 10) => {
    return await VendedorService.getMisPedidos('EnCamino', page, limit);
  },

  // Obtener pedidos entregados
  getMisPedidosEntregados: async (page = 1, limit = 10) => {
    return await VendedorService.getMisPedidos('Entregado', page, limit);
  },

  // Obtener solo MIS productos de un pedido - filtrado local
  getMisProductosDelPedido: (pedido) => {
    if (!pedido.misProductos) return [];
    return pedido.misProductos;
  },

  // ==================== ADMIN - GESTIÓN DE VENDEDORES ====================
  
  // Obtener vendedor por ID de usuario - filtrado local
  getVendedorById: async (usuarioId) => {
    const vendedores = await usuarioCrud.getAll();
    return vendedores.find(v => v.usuarioId === usuarioId && v.rol === 'vendedor');
  },

  // Obtener todos los vendedores por estado - filtrado local
  getVendedoresByEstado: async (estado) => {
    const vendedores = await usuarioCrud.getAll();
    return vendedores.filter(v => v.rol === 'vendedor' && v.estado === estado);
  },

  // Obtener vendedores aprobados
  getVendedoresAprobados: async () => {
    return await VendedorService.getVendedoresByEstado('Aprobado');
  },

  // Obtener vendedores pendientes (para admin) - usar endpoint correcto
  getVendedoresPendientes: async () => {
    return await http.get('usuarios/solicitudes-vendedor');
  },

  // ==================== ESTADÍSTICAS Y ANÁLISIS ====================
  
  // Obtener productos más vendidos (basado en pedidos del backend)
  getProductosMasVendidos: (pedidos, limite = 10) => {
    const conteo = {};
    
    // El backend ya devuelve pedidos.data con misProductos
    const todosPedidos = pedidos.data || pedidos;
    
    todosPedidos.forEach(pedido => {
      if (pedido.misProductos) {
        pedido.misProductos.forEach(producto => {
          const id = producto.productoId;
          if (!conteo[id]) {
            conteo[id] = {
              productoId: id,
              nombre: producto.nombre,
              cantidad: 0,
              totalVentas: 0
            };
          }
          conteo[id].cantidad += producto.cantidad;
          conteo[id].totalVentas += producto.subtotal;
        });
      }
    });

    return Object.values(conteo)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, limite);
  },

  // Calcular total de ventas
  calcularTotalVentas: (pedidos) => {
    const todosPedidos = pedidos.data || pedidos;
    return todosPedidos.reduce((total, pedido) => {
      const misProductos = pedido.misProductos || [];
      const subtotal = misProductos.reduce((sum, prod) => sum + prod.subtotal, 0);
      return total + subtotal;
    }, 0);
  },

  // ==================== UTILIDADES DE NEGOCIO ====================
  
  // Verificar si el negocio está abierto
  negocioEstaAbierto: (negocio) => {
    if (!negocio.horarioApertura || !negocio.horarioCierre) return false;
    
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    
    const [aperturaH, aperturaM] = negocio.horarioApertura.split(':').map(Number);
    const [cierreH, cierreM] = negocio.horarioCierre.split(':').map(Number);
    
    const apertura = aperturaH * 60 + aperturaM;
    const cierre = cierreH * 60 + cierreM;
    
    return horaActual >= apertura && horaActual <= cierre;
  },

  // Formatear horario del negocio
  formatearHorario: (negocio) => {
    if (!negocio.horarioApertura || !negocio.horarioCierre) return 'No especificado';
    return `${negocio.horarioApertura} - ${negocio.horarioCierre}`;
  },

  // ==================== UTILIDADES DE PRODUCTOS ====================
  
  // Contar productos con stock
  contarProductosConStock: (productos) => {
    return productos.filter(p => p.disponibilidad > 0).length;
  },

  // Contar productos sin stock
  contarProductosSinStock: (productos) => {
    return productos.filter(p => p.disponibilidad === 0).length;
  },

  // Verificar si el producto necesita restock
  necesitaRestock: (producto, umbral = 5) => {
    return producto.disponibilidad <= umbral && producto.disponibilidad > 0;
  },

  // Obtener productos que necesitan restock
  getProductosNecesitanRestock: (productos, umbral = 5) => {
    return productos.filter(p => VendedorService.necesitaRestock(p, umbral));
  },

  // Obtener estado del producto (para badges en UI)
  getEstadoProducto: (producto) => {
    if (producto.disponibilidad === 0) {
      return { texto: 'Sin stock', color: 'danger' };
    } else if (producto.disponibilidad <= 5) {
      return { texto: 'Stock bajo', color: 'warning' };
    } else {
      return { texto: 'Disponible', color: 'success' };
    }
  },

  // Verificar si tiene productos
  tieneProductos: (productos) => {
    return productos && productos.length > 0;
  },

  // ==================== FORMATEO Y PRESENTACIÓN ====================
  
  // Formatear precio
  formatearPrecio: (precio) => {
    return `$${Number(precio).toLocaleString('es-AR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  },

  // ==================== VALIDACIONES ====================
  
  // Validar datos de producto antes de crear/actualizar
  validarProducto: (productoData) => {
    const errores = [];

    if (!productoData.nombre || productoData.nombre.trim() === '') {
      errores.push('El nombre es obligatorio');
    }

    if (!productoData.precio || productoData.precio <= 0) {
      errores.push('El precio debe ser mayor a 0');
    }

    if (productoData.disponibilidad === undefined || productoData.disponibilidad < 0) {
      errores.push('La disponibilidad debe ser mayor o igual a 0');
    }

    if (!productoData.categoriaProductoId) {
      errores.push('La categoría es obligatoria');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  },

  // Validar datos de negocio
  validarNegocio: (negocioData) => {
    const errores = [];

    if (!negocioData.nombre || negocioData.nombre.trim() === '') {
      errores.push('El nombre del negocio es obligatorio');
    }

    if (!negocioData.direccion || negocioData.direccion.trim() === '') {
      errores.push('La dirección es obligatoria');
    }

    if (!negocioData.telefono || negocioData.telefono.trim() === '') {
      errores.push('El teléfono es obligatorio');
    }

    if (!negocioData.horarioApertura || !negocioData.horarioCierre) {
      errores.push('Los horarios son obligatorios');
    }

    if (!negocioData.categoriaId) {
      errores.push('La categoría es obligatoria');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  },

  // ==================== RESUMEN COMPLETO ====================
  
  // Obtener resumen completo del vendedor
  getResumen: async () => {
    try {
      const [negocio, productos, pedidos] = await Promise.all([
        VendedorService.getMiNegocio(),
        VendedorService.getMisProductos(),
        VendedorService.getMisPedidos(null, 1, 100) 
      ]);

      const todosPedidos = pedidos.data || [];

      return {
        negocio: {
          ...negocio,
          estaAbierto: VendedorService.negocioEstaAbierto(negocio),
          horarioFormateado: VendedorService.formatearHorario(negocio),
        },
        productos: {
          total: productos.length,
          conStock: VendedorService.contarProductosConStock(productos),
          sinStock: VendedorService.contarProductosSinStock(productos),
          necesitanRestock: VendedorService.getProductosNecesitanRestock(productos).length,
          masVendidos: VendedorService.getProductosMasVendidos(pedidos, 5),
        },
        pedidos: {
          total: pedidos.total || todosPedidos.length,
          pendientes: todosPedidos.filter(p => p.estado === 'Pendiente').length,
          enCamino: todosPedidos.filter(p => p.estado === 'EnCamino').length,
          entregados: todosPedidos.filter(p => p.estado === 'Entregado').length,
          totalVentas: VendedorService.calcularTotalVentas(pedidos),
        },
      };
    } catch (error) {
      console.error('Error al obtener resumen del vendedor:', error);
      throw error;
    }
  },
};