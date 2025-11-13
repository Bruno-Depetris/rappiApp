<template>
  <div class="admin-container">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-content">
        <h1>Panel de Administración</h1>
        <div class="header-actions">
          <span class="admin-info">{{ adminNombre }}</span>
          <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="admin-main">
      <!-- Sidebar -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <button 
            v-for="seccion in secciones" 
            :key="seccion.id"
            :class="['nav-item', { active: seccionActiva === seccion.id }]"
            @click="cambiarSeccion(seccion.id)"
          >
            <span class="nav-icon">{{ seccion.icono }}</span>
            <span class="nav-text">{{ seccion.nombre }}</span>
          </button>
        </nav>
      </aside>

      <!-- Content Area -->
      <main class="content">
        <!-- Dashboard -->
        <section v-if="seccionActiva === 'dashboard'" class="section">
          <h2>Dashboard General</h2>
          
          <div v-if="cargando" class="loading">Cargando estadísticas...</div>
          
          <div v-else class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <h3>Usuarios</h3>
                <p class="stat-number">{{ dashboard.usuarios?.total || 0 }}</p>
                <p class="stat-detail">
                  {{ dashboard.usuarios?.clientes || 0 }} clientes, 
                  {{ dashboard.usuarios?.vendedores || 0 }} vendedores
                </p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🏪</div>
              <div class="stat-info">
                <h3>Negocios</h3>
                <p class="stat-number">{{ dashboard.negocios?.total || 0 }}</p>
                <p class="stat-detail">
                  {{ dashboard.negocios?.pendientes || 0 }} pendientes de aprobación
                </p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📦</div>
              <div class="stat-info">
                <h3>Productos</h3>
                <p class="stat-number">{{ dashboard.productos?.total || 0 }}</p>
                <p class="stat-detail">
                  {{ dashboard.productos?.sinStock || 0 }} sin stock
                </p>
              </div>
            </div>

            <div class="stat-card highlight">
              <div class="stat-icon">🎟️</div>
              <div class="stat-info">
                <h3>Cupones</h3>
                <p class="stat-number">{{ dashboard.cupones?.total || 0 }}</p>
                <p class="stat-detail">
                  {{ dashboard.cupones?.activos || 0 }} activos
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Usuarios -->
        <section v-if="seccionActiva === 'usuarios'" class="section">
          <div class="section-header">
            <h2>Gestión de Usuarios</h2>
            <div class="filters">
              <select v-model="filtroRol" @change="cargarUsuarios" class="select-filter">
                <option value="">Todos los roles</option>
                <option value="cliente">Clientes</option>
                <option value="vendedor">Vendedores</option>
                <option value="repartidor">Repartidores</option>
              </select>
            </div>
          </div>

          <div v-if="cargando" class="loading">Cargando usuarios...</div>
          
          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="usuario in usuariosFiltrados" :key="usuario.usuarioId">
                  <td>{{ usuario.usuarioId }}</td>
                  <td>{{ usuario.nombre }}</td>
                  <td>{{ usuario.email }}</td>
                  <td>
                    <span :class="['badge', 'badge-' + usuario.rol]">{{ usuario.rol }}</span>
                  </td>
                  <td>{{ usuario.direccion }}</td>
                  <td>
                    <button 
                      @click="eliminarUsuario(usuario.usuarioId)"
                      class="btn-delete"
                      :disabled="procesando"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Solicitudes de Vendedor -->
        <section v-if="seccionActiva === 'solicitudes'" class="section">
          <h2>Solicitudes de Vendedor Pendientes</h2>

          <div v-if="cargando" class="loading">Cargando solicitudes...</div>

          <div v-else-if="solicitudesVendedor.length === 0" class="empty-state">
            No hay solicitudes pendientes
          </div>

          <div v-else class="solicitudes-grid">
            <div 
              v-for="negocio in solicitudesVendedor" 
              :key="negocio.negocioId"
              class="solicitud-card"
            >
              <div class="solicitud-header">
                <h3>{{ negocio.nombreNegocio }}</h3>
                <span class="badge badge-pendiente">Pendiente</span>
              </div>
              <div class="solicitud-body">
                <p><strong>Vendedor:</strong> {{ negocio.vendedor?.nombre || 'N/A' }}</p>
                <p><strong>Categoría:</strong> {{ negocio.categoria?.nombre || 'N/A' }}</p>
                <p><strong>Dirección:</strong> {{ negocio.vendedor?.direccion || 'N/A' }}</p>
                <p><strong>Teléfono:</strong> {{ negocio.vendedor?.telefono || 'N/A' }}</p>
                <p><strong>Horario:</strong> {{ negocio.vendedor?.horario || 'N/A' }}</p>
                <p><strong>Comisión:</strong> {{ negocio.vendedor?.comision }}%</p>
              </div>
              <div class="solicitud-actions">
                <button 
                  @click="aprobarVendedor(negocio.vendedor?.vendedorId)"
                  class="btn-approve"
                  :disabled="procesando"
                >
                  Aprobar
                </button>
                <button 
                  @click="mostrarModalRechazo(negocio.vendedor?.vendedorId)"
                  class="btn-reject"
                  :disabled="procesando"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Negocios -->
        <section v-if="seccionActiva === 'negocios'" class="section">
          <div class="section-header">
            <h2>Gestión de Negocios</h2>
            <div class="filters">
              <select v-model="filtroEstadoNegocio" @change="cargarNegocios" class="select-filter">
                <option value="">Todos los estados</option>
                <option value="Aprobado">Aprobados</option>
                <option value="Pendiente">Pendientes</option>
                <option value="Rechazado">Rechazados</option>
              </select>
            </div>
          </div>

          <div v-if="cargando" class="loading">Cargando negocios...</div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Vendedor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="negocio in negociosFiltrados" :key="negocio.negocioId">
                  <td>{{ negocio.negocioId }}</td>
                  <td>{{ negocio.nombreNegocio }}</td>
                  <td>{{ negocio.categoria?.nombre || 'N/A' }}</td>
                  <td>
                    <span :class="['badge', 'badge-' + ((negocio.estado || '').toString().toLowerCase())]">
                      {{ negocio.estado || 'N/A' }}
                    </span>
                  </td>
                  <td>{{ negocio.vendedor?.nombre || 'N/A' }}</td>
                  <td>
                    <button 
                      @click="eliminarNegocio(negocio.negocioId)"
                      class="btn-delete"
                      :disabled="procesando"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Categorías -->
        <section v-if="seccionActiva === 'categorias'" class="section">
          <h2>Gestión de Categorías</h2>

          <div class="tabs-secondary">
            <button 
              :class="['tab', { active: tipoCategoria === 'negocios' }]"
              @click="tipoCategoria = 'negocios'; cargarCategorias()"
            >
              Categorías de Negocios
            </button>
            <button 
              :class="['tab', { active: tipoCategoria === 'productos' }]"
              @click="tipoCategoria = 'productos'; cargarCategorias()"
            >
              Categorías de Productos
            </button>
          </div>

          <!-- Formulario para crear categoría -->
          <div class="form-card">
            <h3>{{ editandoCategoria ? 'Editar' : 'Crear Nueva' }} Categoría</h3>
            <form @submit.prevent="guardarCategoria" class="form-inline">
              <input 
                v-model="nuevaCategoria.nombre"
                type="text"
                placeholder="Nombre de la categoría"
                required
                class="input-form"
              />
              <button type="submit" class="btn-primary" :disabled="procesando">
                {{ editandoCategoria ? 'Actualizar' : 'Crear' }}
              </button>
              <button 
                v-if="editandoCategoria"
                @click="cancelarEdicion"
                type="button"
                class="btn-secondary"
              >
                Cancelar
              </button>
            </form>
          </div>

          <div v-if="cargando" class="loading">Cargando categorías...</div>

          <div v-else class="categorias-grid">
            <div 
              v-for="categoria in categorias" 
              :key="categoria.categoriaId"
              class="categoria-card"
            >
              <h4>{{ categoria.nombre }}</h4>
              <div class="categoria-actions">
                <button 
                  @click="editarCategoria(categoria)"
                  class="btn-edit"
                >
                  Editar
                </button>
                <button 
                  @click="eliminarCategoria(categoria.categoriaId)"
                  class="btn-delete"
                  :disabled="procesando"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Cupones -->
        <section v-if="seccionActiva === 'cupones'" class="section">
          <div class="section-header">
            <h2>Gestión de Cupones</h2>
            <button @click="mostrarFormularioCupon" class="btn-primary">
              Crear Cupón
            </button>
          </div>

          <!-- Formulario de cupón (modal) -->
          <div v-if="mostrarFormCupon" class="modal-overlay" @click="cerrarFormularioCupon">
            <div class="modal-content" @click.stop>
              <h3>{{ editandoCupon ? 'Editar' : 'Crear Nuevo' }} Cupón</h3>
              <form @submit.prevent="guardarCupon">
                <div class="form-group">
                  <label>Código</label>
                  <input 
                    v-model="nuevoCupon.codigo"
                    type="text"
                    placeholder="VERANO2025"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Tipo de Descuento</label>
                  <select v-model="nuevoCupon.tipoDescuento" required>
                    <option value="porcentaje">Porcentaje</option>
                    <option value="monto">Monto Fijo</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Descuento</label>
                  <input 
                    v-model.number="nuevoCupon.descuento"
                    type="number"
                    :placeholder="nuevoCupon.tipoDescuento === 'porcentaje' ? '20' : '5000'"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Fecha de Expiración (opcional)</label>
                  <input 
                    v-model="nuevoCupon.fechaExpiracion"
                    type="date"
                  />
                </div>
                <div class="form-group">
                  <label>Usos Máximos (opcional)</label>
                  <input 
                    v-model.number="nuevoCupon.usosMaximos"
                    type="number"
                    placeholder="100"
                  />
                </div>
                <div class="modal-actions">
                  <button type="submit" class="btn-primary" :disabled="procesando">
                    {{ editandoCupon ? 'Actualizar' : 'Crear' }}
                  </button>
                  <button 
                    @click="cerrarFormularioCupon"
                    type="button"
                    class="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div v-if="cargando" class="loading">Cargando cupones...</div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descuento</th>
                  <th>Tipo</th>
                  <th>Usos</th>
                  <th>Expiración</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cupon in cupones" :key="cupon.cuponId">
                  <td><strong>{{ cupon.codigo }}</strong></td>
                  <td>{{ formatearDescuento(cupon) }}</td>
                  <td>{{ cupon.tipoDescuento }}</td>
                  <td>{{ cupon.usosActuales || 0 }} / {{ cupon.usosMaximos || '∞' }}</td>
                  <td>{{ cupon.fechaExpiracion ? new Date(cupon.fechaExpiracion).toLocaleDateString() : 'Sin expiración' }}</td>
                  <td>
                    <span :class="['badge', esActivo(cupon) ? 'badge-aprobado' : 'badge-rechazado']">
                      {{ esActivo(cupon) ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <button 
                      @click="editarCupon(cupon)"
                      class="btn-edit"
                    >
                      Editar
                    </button>
                    <button 
                      @click="eliminarCupon(cupon.cuponId)"
                      class="btn-delete"
                      :disabled="procesando"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Métodos de Pago -->
        <section v-if="seccionActiva === 'metodos-pago'" class="section">
          <h2>Gestión de Métodos de Pago</h2>

          <!-- Formulario para crear método -->
          <div class="form-card">
            <h3>{{ editandoMetodo ? 'Editar' : 'Crear Nuevo' }} Método de Pago</h3>
            <form @submit.prevent="guardarMetodoPago" class="form-inline">
              <input 
                v-model="nuevoMetodo.nombre"
                type="text"
                placeholder="Nombre del método (ej: PayPal)"
                required
                class="input-form"
              />
              <button type="submit" class="btn-primary" :disabled="procesando">
                {{ editandoMetodo ? 'Actualizar' : 'Crear' }}
              </button>
              <button 
                v-if="editandoMetodo"
                @click="cancelarEdicionMetodo"
                type="button"
                class="btn-secondary"
              >
                Cancelar
              </button>
            </form>
          </div>

          <div v-if="cargando" class="loading">Cargando métodos de pago...</div>

          <div v-else class="metodos-grid">
            <div 
              v-for="metodo in metodosPago" 
              :key="metodo.metodoId"
              class="metodo-card"
            >
              <h4>{{ metodo.metodo }}</h4>
              <div class="metodo-actions">
                <button 
                  @click="editarMetodoPago(metodo)"
                  class="btn-edit"
                >
                  Editar
                </button>
                <button 
                  @click="eliminarMetodoPago(metodo.metodoId)"
                  class="btn-delete"
                  :disabled="procesando"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Productos -->
        <section v-if="seccionActiva === 'productos'" class="section">
          <h2>Gestión de Productos</h2>

          <div v-if="cargando" class="loading">Cargando productos...</div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Categoría</th>
                  <th>Vendedor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="producto in productos" :key="producto.productoId">
                  <td>{{ producto.productoId }}</td>
                  <td>{{ producto.nombre }}</td>
                  <td>{{ formatearPrecio(producto.precio) }}</td>
                  <td>
                    <span :class="producto.disponibilidad === 0 ? 'text-danger' : ''">
                      {{ producto.disponibilidad }}
                    </span>
                  </td>
                  <td>{{ producto.categoria?.nombre || 'N/A' }}</td>
                  <td>ID: {{ producto.vendedorId }}</td>
                  <td>
                    <button 
                      @click="eliminarProducto(producto.productoId)"
                      class="btn-delete"
                      :disabled="procesando"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>

    <!-- Modal de Rechazo -->
    <div v-if="modalRechazo" class="modal-overlay" @click="cerrarModalRechazo">
      <div class="modal-content" @click.stop>
        <h3>Rechazar Solicitud de Vendedor</h3>
        <form @submit.prevent="confirmarRechazo">
          <div class="form-group">
            <label>Motivo del rechazo</label>
            <textarea 
              v-model="motivoRechazo"
              rows="4"
              placeholder="Explica por qué se rechaza la solicitud..."
              required
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-reject" :disabled="procesando">
              Rechazar
            </button>
            <button 
              @click="cerrarModalRechazo"
              type="button"
              class="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Notificación -->
    <div v-if="notificacion.mostrar" :class="['notificacion', notificacion.tipo]">
      {{ notificacion.mensaje }}
    </div>
  </div>
</template>

<script>
import { AdministradorService } from '../../private/services/administradorService';

export default {
  name: 'AdminView',
  data() {
    return {
      seccionActiva: 'dashboard',
      cargando: false,
      procesando: false,
      
      // Datos
      dashboard: {},
      usuarios: [],
      solicitudesVendedor: [],
      negocios: [],
      categorias: [],
      cupones: [],
      metodosPago: [],
      productos: [],
      
      // Filtros
      filtroRol: '',
      filtroEstadoNegocio: '',
      tipoCategoria: 'negocios',
      
      // Formularios
      nuevaCategoria: { nombre: '' },
      editandoCategoria: false,
      categoriaEditando: null,
      
      nuevoCupon: {
        codigo: '',
        descuento: 0,
        tipoDescuento: 'porcentaje',
        fechaExpiracion: '',
        usosMaximos: null
      },
      editandoCupon: false,
      cuponEditando: null,
      mostrarFormCupon: false,
      
      nuevoMetodo: { nombre: '' },
      editandoMetodo: false,
      metodoEditando: null,
      
      // Modales
      modalRechazo: false,
      vendedorRechazo: null,
      motivoRechazo: '',
      
      // Notificación
      notificacion: {
        mostrar: false,
        mensaje: '',
        tipo: 'success'
      },
      
      // Secciones del menú
      secciones: [
        { id: 'dashboard', nombre: 'Dashboard', icono: '📊' },
        { id: 'usuarios', nombre: 'Usuarios', icono: '👥' },
        { id: 'solicitudes', nombre: 'Solicitudes', icono: '📝' },
        { id: 'negocios', nombre: 'Negocios', icono: '🏪' },
        { id: 'categorias', nombre: 'Categorías', icono: '📁' },
        { id: 'cupones', nombre: 'Cupones', icono: '🎟️' },
        { id: 'metodos-pago', nombre: 'Métodos de Pago', icono: '💳' },
        { id: 'productos', nombre: 'Productos', icono: '📦' }
      ]
    }
  },
  computed: {
    adminNombre() {
      const admin = AdministradorService.obtenerAdmin();
      return admin?.usuario || 'Admin';
    },
    usuariosFiltrados() {
      if (!this.filtroRol) return this.usuarios;
      return this.usuarios.filter(u => u.rol === this.filtroRol);
    },
    negociosFiltrados() {
      if (!this.filtroEstadoNegocio) return this.negocios;
      return this.negocios.filter(n => n.estado === this.filtroEstadoNegocio);
    }
  },
  async mounted() {
    await this.verificarAutenticacion();
    await this.inicializarDatos();
  },
  methods: {
    async verificarAutenticacion() {
      try {
        if (!AdministradorService.estaAutenticado()) {
          this.$router.push('/admin/login');
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        this.$router.push('/admin/login');
      }
    },

    async inicializarDatos() {
      try {
        this.cargando = true;
        await this.cargarDashboard();
      } catch (error) {
        console.error('Error al inicializar datos:', error);
        this.mostrarNotificacion('Error al cargar datos iniciales', 'error');
      } finally {
        this.cargando = false;
      }
    },

    async cambiarSeccion(seccion) {
      this.seccionActiva = seccion;
      this.cargando = true;

      try {
        switch(seccion) {
          case 'dashboard':
            await this.cargarDashboard();
            break;
          case 'usuarios':
            await this.cargarUsuarios();
            break;
          case 'solicitudes':
            await this.cargarSolicitudesVendedor();
            break;
          case 'negocios':
            await this.cargarNegocios();
            break;
          case 'categorias':
            await this.cargarCategorias();
            break;
          case 'cupones':
            await this.cargarCupones();
            break;
          case 'metodos-pago':
            await this.cargarMetodosPago();
            break;
          case 'productos':
            await this.cargarProductos();
            break;
        }
      } catch (error) {
        console.error('Error al cambiar sección:', error);
        this.mostrarNotificacion('Error al cargar datos', 'error');
      } finally {
        this.cargando = false;
      }
    },

    // ==================== CARGA DE DATOS ====================

    async cargarDashboard() {
      try {
        this.dashboard = await AdministradorService.getDashboard();
      } catch (error) {
        console.error('Error al cargar dashboard:', error);
      }
    },

    async cargarUsuarios() {
      try {
        const resp = await AdministradorService.getUsuarios();
        this.usuarios = resp?.data || resp || [];
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    },

    async cargarSolicitudesVendedor() {
      try {
        this.solicitudesVendedor = await AdministradorService.getSolicitudesVendedor();
      } catch (error) {
        console.error('Error al cargar solicitudes:', error);
      }
    },

    async cargarNegocios() {
      try {
        const resp = await AdministradorService.getNegocios();
        this.negocios = resp?.data || resp || [];
      } catch (error) {
        console.error('Error al cargar negocios:', error);
      }
    },

    async cargarCategorias() {
      try {
        if (this.tipoCategoria === 'negocios') {
          this.categorias = await AdministradorService.getCategorias();
        } else {
          this.categorias = await AdministradorService.getCategoriasProducto();
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    },

    async cargarCupones() {
      try {
        const resp = await AdministradorService.getCupones();
        this.cupones = resp?.data || resp || [];
      } catch (error) {
        console.error('Error al cargar cupones:', error);
      }
    },

    async cargarMetodosPago() {
      try {
        this.metodosPago = await AdministradorService.getMetodosPago();
      } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
      }
    },

    async cargarProductos() {
      try {
        const resp = await AdministradorService.getProductos();
        this.productos = resp?.data || resp || [];
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    },

    // ==================== USUARIOS ====================

    async eliminarUsuario(id) {
      if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

      try {
        this.procesando = true;
        await AdministradorService.deleteUsuario(id);
        await this.cargarUsuarios();
        this.mostrarNotificacion('Usuario eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        this.mostrarNotificacion('Error al eliminar usuario', 'error');
      } finally {
        this.procesando = false;
      }
    },

    // ==================== VENDEDORES ====================

    async aprobarVendedor(vendedorId) {
      if (!confirm('¿Aprobar esta solicitud de vendedor?')) return;

      try {
        this.procesando = true;
        await AdministradorService.aprobarVendedor(vendedorId);
        await this.cargarSolicitudesVendedor();
        await this.cargarDashboard();
        this.mostrarNotificacion('Vendedor aprobado exitosamente', 'success');
      } catch (error) {
        console.error('Error al aprobar vendedor:', error);
        this.mostrarNotificacion('Error al aprobar vendedor', 'error');
      } finally {
        this.procesando = false;
      }
    },

    mostrarModalRechazo(vendedorId) {
      this.vendedorRechazo = vendedorId;
      this.motivoRechazo = '';
      this.modalRechazo = true;
    },

    cerrarModalRechazo() {
      this.modalRechazo = false;
      this.vendedorRechazo = null;
      this.motivoRechazo = '';
    },

    async confirmarRechazo() {
      try {
        this.procesando = true;
        await AdministradorService.rechazarVendedor(this.vendedorRechazo, this.motivoRechazo);
        await this.cargarSolicitudesVendedor();
        this.cerrarModalRechazo();
        this.mostrarNotificacion('Solicitud rechazada', 'success');
      } catch (error) {
        console.error('Error al rechazar vendedor:', error);
        this.mostrarNotificacion('Error al rechazar solicitud', 'error');
      } finally {
        this.procesando = false;
      }
    },

    // ==================== NEGOCIOS ====================

    async eliminarNegocio(id) {
      if (!confirm('¿Estás seguro de eliminar este negocio?')) return;

      try {
        this.procesando = true;
        await AdministradorService.deleteNegocio(id);
        await this.cargarNegocios();
        this.mostrarNotificacion('Negocio eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar negocio:', error);
        this.mostrarNotificacion('Error al eliminar negocio', 'error');
      } finally {
        this.procesando = false;
      }
    },

    // ==================== CATEGORÍAS ====================

    async guardarCategoria() {
      try {
        this.procesando = true;

        if (this.editandoCategoria) {
          if (this.tipoCategoria === 'negocios') {
            await AdministradorService.updateCategoria(
              this.categoriaEditando.categoriaId,
              this.nuevaCategoria.nombre
            );
          } else {
            await AdministradorService.updateCategoriaProducto(
              this.categoriaEditando.categoriaId,
              this.nuevaCategoria.nombre
            );
          }
          this.mostrarNotificacion('Categoría actualizada exitosamente', 'success');
        } else {
          if (this.tipoCategoria === 'negocios') {
            await AdministradorService.createCategoria(this.nuevaCategoria.nombre);
          } else {
            await AdministradorService.createCategoriaProducto(this.nuevaCategoria.nombre);
          }
          this.mostrarNotificacion('Categoría creada exitosamente', 'success');
        }

        await this.cargarCategorias();
        this.cancelarEdicion();
      } catch (error) {
        console.error('Error al guardar categoría:', error);
        this.mostrarNotificacion('Error al guardar categoría', 'error');
      } finally {
        this.procesando = false;
      }
    },

    editarCategoria(categoria) {
      this.editandoCategoria = true;
      this.categoriaEditando = categoria;
      this.nuevaCategoria.nombre = categoria.nombre;
    },

    cancelarEdicion() {
      this.editandoCategoria = false;
      this.categoriaEditando = null;
      this.nuevaCategoria.nombre = '';
    },

    async eliminarCategoria(id) {
      if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

      try {
        this.procesando = true;
        if (this.tipoCategoria === 'negocios') {
          await AdministradorService.deleteCategoria(id);
        } else {
          await AdministradorService.deleteCategoriaProducto(id);
        }
        await this.cargarCategorias();
        this.mostrarNotificacion('Categoría eliminada exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        this.mostrarNotificacion('Error al eliminar categoría', 'error');
      } finally {
        this.procesando = false;
      }
    },

    // ==================== CUPONES ====================

    mostrarFormularioCupon() {
      this.mostrarFormCupon = true;
      this.editandoCupon = false;
      this.nuevoCupon = {
        codigo: '',
        descuento: 0,
        tipoDescuento: 'porcentaje',
        fechaExpiracion: '',
        usosMaximos: null
      };
    },

    cerrarFormularioCupon() {
      this.mostrarFormCupon = false;
      this.editandoCupon = false;
      this.cuponEditando = null;
      this.nuevoCupon = {
        codigo: '',
        descuento: 0,
        tipoDescuento: 'porcentaje',
        fechaExpiracion: '',
        usosMaximos: null
      };
    },

    async guardarCupon() {
      try {
        this.procesando = true;

        const cuponData = {
          Codigo: this.nuevoCupon.codigo,
          Descuento: this.nuevoCupon.descuento,
          TipoDescuento: this.nuevoCupon.tipoDescuento,
          FechaExpiracion: this.nuevoCupon.fechaExpiracion || null,
          UsosMaximos: this.nuevoCupon.usosMaximos || null
        };

        if (this.editandoCupon) {
          await AdministradorService.updateCupon(this.cuponEditando.cuponId, cuponData);
          this.mostrarNotificacion('Cupón actualizado exitosamente', 'success');
        } else {
          await AdministradorService.createCupon(cuponData);
          this.mostrarNotificacion('Cupón creado exitosamente', 'success');
        }

        await this.cargarCupones();
        this.cerrarFormularioCupon();
      } catch (error) {
        console.error('Error al guardar cupón:', error);
        this.mostrarNotificacion('Error al guardar cupón', 'error');
      } finally {
        this.procesando = false;
      }
    },

    editarCupon(cupon) {
      this.editandoCupon = true;
      this.cuponEditando = cupon;
      this.nuevoCupon = {
        codigo: cupon.codigo,
        descuento: cupon.descuento,
        tipoDescuento: cupon.tipoDescuento,
        fechaExpiracion: cupon.fechaExpiracion ? cupon.fechaExpiracion.split('T')[0] : '',
        usosMaximos: cupon.usosMaximos
      };
      this.mostrarFormCupon = true;
    },

    async eliminarCupon(id) {
      if (!confirm('¿Estás seguro de eliminar este cupón?')) return;

      try {
        this.procesando = true;
        await AdministradorService.deleteCupon(id);
        await this.cargarCupones();
        this.mostrarNotificacion('Cupón eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar cupón:', error);
        this.mostrarNotificacion('Error al eliminar cupón', 'error');
      } finally {
        this.procesando = false;
      }
    },

    esActivo(cupon) {
      const ahora = new Date();
      const vigente = !cupon.fechaExpiracion || new Date(cupon.fechaExpiracion) > ahora;
      const conUsos = !cupon.usosMaximos || cupon.usosActuales < cupon.usosMaximos;
      return vigente && conUsos;
    },

    // ==================== MÉTODOS DE PAGO ====================

    async guardarMetodoPago() {
      try {
        this.procesando = true;

        if (this.editandoMetodo) {
          await AdministradorService.updateMetodoPago(
            this.metodoEditando.metodoId,
            this.nuevoMetodo.nombre
          );
          this.mostrarNotificacion('Método de pago actualizado exitosamente', 'success');
        } else {
          await AdministradorService.createMetodoPago(this.nuevoMetodo.nombre);
          this.mostrarNotificacion('Método de pago creado exitosamente', 'success');
        }

        await this.cargarMetodosPago();
        this.cancelarEdicionMetodo();
      } catch (error) {
        console.error('Error al guardar método de pago:', error);
        this.mostrarNotificacion('Error al guardar método de pago', 'error');
      } finally {
        this.procesando = false;
      }
    },

    editarMetodoPago(metodo) {
      this.editandoMetodo = true;
      this.metodoEditando = metodo;
      this.nuevoMetodo.nombre = metodo.metodo;
    },

    cancelarEdicionMetodo() {
      this.editandoMetodo = false;
      this.metodoEditando = null;
      this.nuevoMetodo.nombre = '';
    },

    async eliminarMetodoPago(id) {
      if (!confirm('¿Estás seguro de eliminar este método de pago?')) return;

      try {
        this.procesando = true;
        await AdministradorService.deleteMetodoPago(id);
        await this.cargarMetodosPago();
        this.mostrarNotificacion('Método de pago eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar método de pago:', error);
        this.mostrarNotificacion('Error al eliminar método de pago', 'error');
      } finally {
        this.procesando = false;
      }
    },

    // ==================== PRODUCTOS ====================

    async eliminarProducto(id) {
      if (!confirm('¿Estás seguro de eliminar este producto?')) return;

      try {
        this.procesando = true;
        await AdministradorService.deleteProducto(id);
        await this.cargarProductos();
        this.mostrarNotificacion('Producto eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        this.mostrarNotificacion('Error al eliminar producto', 'error');
      } finally {
        this.procesando = false;
      }
    },

    // ==================== UTILIDADES ====================

    handleLogout() {
      AdministradorService.logout();
      this.$router.push('/admin/login');
    },

    formatearPrecio(precio) {
      return `$${precio.toLocaleString('es-AR')}`;
    },

    formatearDescuento(cupon) {
      if (cupon.tipoDescuento === 'porcentaje') {
        return `${cupon.descuento}%`;
      }
      return this.formatearPrecio(cupon.descuento);
    },

    mostrarNotificacion(mensaje, tipo = 'success') {
      this.notificacion = {
        mostrar: true,
        mensaje,
        tipo
      };

      setTimeout(() => {
        this.notificacion.mostrar = false;
      }, 3000);
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Oswald', sans-serif;
}

.admin-container {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header */
.admin-header {
  background-color: rgba(73, 32, 5, 0.58);
  color: white;
  padding: 20px 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-info {
  font-weight: 500;
}

.btn-logout {
  background-color: #ff9900;
  color: white;
  font-weight: 700;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-logout:hover {
  background-color: #e08c00;
}

/* Main Layout */
.admin-main {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: white;
  padding: 20px 0;
  box-shadow: 2px 0 10px rgba(0,0,0,0.05);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  font-size: 15px;
  color: #666;
}

.nav-item:hover {
  background: #fff8ef;
  color: #ff9900;
}

.nav-item.active {
  background: rgba(255, 153, 0, 0.1);
  color: #ff9900;
  font-weight: 700;
  border-left: 3px solid #ff9900;
}

.nav-icon {
  font-size: 20px;
}

/* Content */
.content {
  flex: 1;
  padding: 30px;
}

.section h2 {
  margin: 0 0 30px 0;
  color: #ff9900;
  font-size: 1.8rem;
  font-weight: 700;
  border-bottom: 2px solid #ff9900;
  padding-bottom: 8px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card.highlight {
  background-color: rgba(73, 32, 5, 0.58);
  color: white;
}

.stat-icon {
  font-size: 48px;
  opacity: 0.9;
}

.stat-info h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  text-transform: uppercase;
  opacity: 0.8;
  font-weight: 500;
}

.stat-number {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
}

.stat-detail {
  margin: 0;
  font-size: 13px;
  opacity: 0.7;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filters {
  display: flex;
  gap: 12px;
}

.select-filter {
  padding: 10px 16px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.select-filter:focus {
  outline: none;
  border-color: #ff9900;
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f8f8f8;
}

.data-table th {
  padding: 16px;
  text-align: left;
  font-weight: 700;
  color: #333;
  font-size: 14px;
  text-transform: uppercase;
}

.data-table td {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.data-table tbody tr:hover {
  background: #fff8ef;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}

.badge-cliente { background: #e3f2fd; color: #1976d2; }
.badge-vendedor { background: #f3e5f5; color: #7b1fa2; }
.badge-repartidor { background: #e8f5e9; color: #388e3c; }
.badge-pendiente { background: #fff3e0; color: #f57c00; }
.badge-aprobado { background: #e8f5e9; color: #388e3c; }
.badge-rechazado { background: #ffebee; color: #d32f2f; }

/* Buttons */
.btn-primary {
  background-color: #ff9900;
  color: white;
  font-weight: 700;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e08c00;
  transform: scale(1.05);
}

.btn-secondary {
  background: #e0e0e0;
  color: #666;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-delete {
  background: #ffebee;
  color: #d32f2f;
  border: 1px solid #d32f2f;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete:hover:not(:disabled) {
  background: #d32f2f;
  color: white;
  transform: scale(1.05);
}

.btn-edit {
  background: #fff8ef;
  color: #ff9900;
  border: 1px solid #ff9900;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 8px;
}

.btn-edit:hover:not(:disabled) {
  background: #ff9900;
  color: white;
  transform: scale(1.05);
}

.btn-approve {
  background: #e8f5e9;
  color: #388e3c;
  border: 1px solid #388e3c;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-approve:hover:not(:disabled) {
  background: #388e3c;
  color: white;
  transform: scale(1.05);
}

.btn-reject {
  background: #ffebee;
  color: #d32f2f;
  border: 1px solid #d32f2f;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-reject:hover:not(:disabled) {
  background: #d32f2f;
  color: white;
  transform: scale(1.05);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Solicitudes Grid */
.solicitudes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.solicitud-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.solicitud-card:hover {
  transform: translateY(-4px);
}

.solicitud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.solicitud-header h3 {
  margin: 0;
  color: #ff9900;
  font-size: 1.3rem;
  font-weight: 700;
}

.solicitud-body {
  margin-bottom: 20px;
}

.solicitud-body p {
  margin: 8px 0;
  font-size: 0.95rem;
  color: #666;
}

.solicitud-actions {
  display: flex;
  gap: 12px;
}

.solicitud-actions button {
  flex: 1;
}

/* Tabs Secondary */
.tabs-secondary {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.tabs-secondary .tab {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.tabs-secondary .tab.active {
  background: #ff9900;
  color: white;
}

/* Form Card */
.form-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  margin-bottom: 24px;
}

.form-card h3 {
  margin: 0 0 16px 0;
  color: #ff9900;
  font-weight: 700;
}

.form-inline {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-form {
  flex: 1;
  padding: 10px 16px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input-form:focus {
  outline: none;
  border-color: #ff9900;
}

/* Categorías Grid */
.categorias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.categoria-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s;
}

.categoria-card:hover {
  transform: translateY(-4px);
}

.categoria-card h4 {
  margin: 0;
  color: #333;
  font-weight: 700;
}

.categoria-actions {
  display: flex;
  gap: 8px;
}

/* Métodos Grid */
.metodos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.metodo-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s;
}

.metodo-card:hover {
  transform: translateY(-4px);
}

.metodo-card h4 {
  margin: 0;
  color: #333;
  font-weight: 700;
}

.metodo-actions {
  display: flex;
  gap: 8px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 6px 18px rgba(0,0,0,0.3);
}

.modal-content h3 {
  margin: 0 0 24px 0;
  color: #ff9900;
  font-weight: 700;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 16px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  font-family: 'Oswald', sans-serif;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ff9900;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions button {
  flex: 1;
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px 20px;
  color: #888;
  font-style: italic;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

/* Text Utilities */
.text-danger {
  color: #d32f2f;
  font-weight: 700;
}

/* Notificación */
.notificacion {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 2000;
  animation: slideInRight 0.3s ease;
  font-weight: 700;
}

.notificacion.success {
  background: #28a745;
  color: white;
}

.notificacion.error {
  background: #d32f2f;
  color: white;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-main {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .nav-item {
    white-space: nowrap;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
  }

  .header-content h1 {
    font-size: 1.6rem;
  }

  .section h2 {
    font-size: 1.4rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .solicitudes-grid {
    grid-template-columns: 1fr;
  }

  .categorias-grid,
  .metodos-grid {
    grid-template-columns: 1fr;
  }

  .table-container {
    overflow-x: auto;
  }

  .data-table {
    min-width: 800px;
  }

  .modal-content {
    padding: 20px;
    }
}
</style>