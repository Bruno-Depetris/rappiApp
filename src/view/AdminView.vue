<template>
  <div class="admin-layout">
    <header class="admin-header">
      <h1>Panel de Administración</h1>
      <div class="usuario-info">
        <span>{{ nombreAdmin }}</span>
        <button @click="logout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </header>

    <nav class="admin-nav">
      <button 
        @click="seccionActiva = 'dashboard'" 
        :class="{ active: seccionActiva === 'dashboard' }"
      >
        Dashboard
      </button>
      <button 
        @click="seccionActiva = 'negocios'" 
        :class="{ active: seccionActiva === 'negocios' }"
      >
        Negocios
      </button>
      <button 
        @click="seccionActiva = 'categorias-negocios'" 
        :class="{ active: seccionActiva === 'categorias-negocios' }"
      >
        Categorías Negocios
      </button>
      <button 
        @click="seccionActiva = 'categorias-productos'" 
        :class="{ active: seccionActiva === 'categorias-productos' }"
      >
        Categorías Productos
      </button>
      <button 
        @click="seccionActiva = 'usuarios'" 
        :class="{ active: seccionActiva === 'usuarios' }"
      >
        Usuarios
      </button>
    </nav>

    <main class="admin-content">
      <div v-if="seccionActiva === 'dashboard'" class="dashboard">
        <h2>Dashboard General</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>{{ estadisticas.usuarios.total }}</h3>
            <p>Usuarios Totales</p>
            <small>{{ estadisticas.usuarios.clientes }} clientes</small>
          </div>
          <div class="stat-card">
            <h3>{{ estadisticas.vendedores.total }}</h3>
            <p>Vendedores</p>
            <small>{{ estadisticas.vendedores.pendientes }} pendientes</small>
          </div>
          <div class="stat-card">
            <h3>{{ estadisticas.productos.total }}</h3>
            <p>Productos</p>
            <small>{{ estadisticas.productos.disponibles }} disponibles</small>
          </div>
          <div class="stat-card">
            <h3>${{ estadisticas.ventas.total }}</h3>
            <p>Ventas Totales</p>
            <small>{{ estadisticas.pedidos.total }} pedidos</small>
          </div>
        </div>
      </div>

      <div v-if="seccionActiva === 'usuarios'" class="usuarios-section">
        <h2>Gestión de Usuarios</h2>
        <div class="usuarios-grid">
          <div 
            v-for="usuario in usuarios" 
            :key="usuario.usuarioId"
            class="usuario-card"
          >
            <h4>{{ usuario.nombre }}</h4>
            <p>{{ usuario.email }}</p>
            <span class="rol-badge" :class="usuario.rol">{{ usuario.rol }}</span>
            <div class="acciones">
              <button @click="cambiarRol(usuario, 'vendedor')" class="btn-vendedor">
                Hacer Vendedor
              </button>
              <button @click="cambiarRol(usuario, 'repartidor')" class="btn-repartidor">
                Hacer Repartidor
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Negocios -->
      <div v-if="seccionActiva === 'negocios'" class="negocios-section">
        <h2>Gestión de Negocios</h2>
        <div class="section-header">
          <div class="search-box">
            <input v-model="busquedaNegocio" placeholder="Buscar negocio..." />
          </div>
        </div>
        <div class="negocios-grid">
          <div v-for="negocio in negociosFiltrados" :key="negocio.id" class="negocio-card">
            <img :src="negocio.imagen" :alt="negocio.nombreNegocio" />
            <div class="negocio-info">
              <h4>{{ negocio.nombreNegocio }}</h4>
              <p>{{ negocio.descripcion }}</p>
              <p><strong>Vendedor:</strong> {{ negocio.vendedor?.nombre }}</p>
              <p><strong>Estado:</strong> {{ negocio.estado }}</p>
              <p><strong>Categoría:</strong> {{ negocio.categoria?.categoria }}</p>
            </div>
            <div class="negocio-acciones">
              <button @click="cambiarEstadoNegocio(negocio)" 
                      :class="negocio.estado === 'Activo' ? 'btn-suspender' : 'btn-activar'">
                {{ negocio.estado === 'Activo' ? 'Suspender' : 'Activar' }}
              </button>
              <button @click="eliminarNegocio(negocio)" class="btn-eliminar">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Categorías de Negocios -->
      <div v-if="seccionActiva === 'categorias-negocios'" class="categorias-negocios-section">
        <h2>Categorías de Negocios</h2>
        <div class="section-header">
          <button @click="mostrarModalCategoriaNegocio = true" class="btn-primary">
            + Nueva Categoría
          </button>
        </div>
        <div class="categorias-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Negocios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="categoria in categoriasNegocios" :key="categoria.id">
                <td>{{ categoria.id }}</td>
                <td>{{ categoria.categoria }}</td>
                <td>{{ categoria.descripcion || 'Sin descripción' }}</td>
                <td>{{ contarNegociosPorCategoria(categoria.id) }}</td>
                <td class="acciones-td">
                  <button @click="editarCategoriaNegocio(categoria)" class="btn-editar">
                    Editar
                  </button>
                  <button @click="eliminarCategoriaNegocio(categoria)" class="btn-eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sección de Categorías de Productos -->
      <div v-if="seccionActiva === 'categorias-productos'" class="categorias-productos-section">
        <h2>Categorías de Productos</h2>
        <div class="section-header">
          <button @click="mostrarModalCategoriaProducto = true" class="btn-primary">
            + Nueva Categoría de Producto
          </button>
        </div>
        <div class="categorias-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="categoria in categoriasProductos" :key="categoria.id">
                <td>{{ categoria.id }}</td>
                <td>{{ categoria.nombre }}</td>
                <td>{{ categoria.descripcion || 'Sin descripción' }}</td>
                <td>{{ contarProductosPorCategoria(categoria.nombre) }}</td>
                <td class="acciones-td">
                  <button @click="editarCategoriaProducto(categoria)" class="btn-editar">
                    Editar
                  </button>
                  <button @click="eliminarCategoriaProducto(categoria)" class="btn-eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sección de Usuarios mejorada -->
      <div v-if="seccionActiva === 'usuarios'" class="usuarios-section">
        <h2>Gestión de Usuarios</h2>
        <div class="section-header">
          <div class="search-box">
            <input v-model="busquedaUsuario" placeholder="Buscar usuario..." />
          </div>
          <select v-model="filtroRol" class="filter-select">
            <option value="">Todos los roles</option>
            <option value="Cliente">Clientes</option>
            <option value="Vendedor">Vendedores</option>
            <option value="Repartidor">Repartidores</option>
            <option value="Administrador">Administradores</option>
          </select>
        </div>
        <div class="usuarios-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
                <td>{{ usuario.id }}</td>
                <td>{{ usuario.nombre }}</td>
                <td>{{ usuario.email }}</td>
                <td>
                  <select v-model="usuario.rol" @change="cambiarRolUsuario(usuario)" 
                          class="rol-select">
                    <option value="Cliente">Cliente</option>
                    <option value="Vendedor">Vendedor</option>
                    <option value="Repartidor">Repartidor</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </td>
                <td>
                  <span :class="'estado-' + usuario.estado.toLowerCase()">
                    {{ usuario.estado }}
                  </span>
                </td>
                <td class="acciones-td">
                  <button @click="cambiarEstadoUsuario(usuario)" 
                          :class="usuario.estado === 'Activo' ? 'btn-suspender' : 'btn-activar'">
                    {{ usuario.estado === 'Activo' ? 'Suspender' : 'Activar' }}
                  </button>
                  <button @click="eliminarUsuario(usuario)" class="btn-eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modales -->
      <div v-if="mostrarModalCategoriaNegocio" class="modal">
        <div class="modal-content">
          <h3>{{ categoriaEditando ? 'Editar' : 'Nueva' }} Categoría de Negocio</h3>
          <form @submit.prevent="guardarCategoriaNegocio">
            <div class="form-group">
              <label>Nombre:</label>
              <input v-model="formularioCategoriaNegocio.categoria" required />
            </div>
            <div class="form-group">
              <label>Descripción:</label>
              <textarea v-model="formularioCategoriaNegocio.descripcion"></textarea>
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn-primary">Guardar</button>
              <button type="button" @click="cerrarModalCategoriaNegocio" class="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="mostrarModalCategoriaProducto" class="modal">
        <div class="modal-content">
          <h3>{{ categoriaProductoEditando ? 'Editar' : 'Nueva' }} Categoría de Producto</h3>
          <form @submit.prevent="guardarCategoriaProducto">
            <div class="form-group">
              <label>Nombre:</label>
              <input v-model="formularioCategoriaProducto.nombre" required />
            </div>
            <div class="form-group">
              <label>Descripción:</label>
              <textarea v-model="formularioCategoriaProducto.descripcion"></textarea>
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn-primary">Guardar</button>
              <button type="button" @click="cerrarModalCategoriaProducto" class="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="seccionActiva === 'vendedores'" class="vendedores-section">
        <h2>Solicitudes de Vendedores</h2>
        <div v-if="solicitudesVendedor.length === 0" class="empty-state">
          <p>No hay solicitudes pendientes</p>
        </div>
        <div v-else class="solicitudes-grid">
          <div 
            v-for="solicitud in solicitudesVendedor" 
            :key="solicitud.negocioId"
            class="solicitud-card"
          >
            <h4>{{ solicitud.nombreNegocio }}</h4>
            <p>{{ solicitud.vendedor?.nombre }}</p>
            <p>{{ solicitud.vendedor?.email }}</p>
            <div class="acciones">
              <button @click="aprobarVendedor(solicitud)" class="btn-aprobar">
                Aprobar
              </button>
              <button @click="rechazarVendedor(solicitud)" class="btn-rechazar">
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <p>Cargando datos...</p>
      </div>
    </main>
  </div>
</template>

<script>
import { UsuarioService, AdministradorService } from '../../private/services';
import { Notificar } from '../utils/notificaciones';

export default {
  name: 'AdminView',
  data() {
    return {
      loading: false,
      nombreAdmin: '',
      seccionActiva: 'dashboard',
      estadisticas: {
        usuarios: { total: 0, clientes: 0 },
        vendedores: { total: 0, pendientes: 0 },
        productos: { total: 0, disponibles: 0 },
        pedidos: { total: 0 },
        ventas: { total: 0 }
      },
      usuarios: [],
      solicitudesVendedor: [],
      negocios: [],
      categoriasNegocios: [],
      categoriasProductos: [],
      productos: [],
      
      // Filtros y búsquedas
      busquedaNegocio: '',
      busquedaUsuario: '',
      filtroRol: '',
      
      // Modales y formularios
      mostrarModalCategoriaNegocio: false,
      mostrarModalCategoriaProducto: false,
      categoriaEditando: null,
      categoriaProductoEditando: null,
      formularioCategoriaNegocio: {
        categoria: '',
        descripcion: ''
      },
      formularioCategoriaProducto: {
        nombre: '',
        descripcion: ''
      }
    };
  },
  
  computed: {
    negociosFiltrados() {
      return this.negocios.filter(negocio => 
        negocio.nombreNegocio.toLowerCase().includes(this.busquedaNegocio.toLowerCase())
      );
    },
    
    usuariosFiltrados() {
      return this.usuarios.filter(usuario => {
        const coincideBusqueda = usuario.nombre.toLowerCase().includes(this.busquedaUsuario.toLowerCase()) ||
                               usuario.email.toLowerCase().includes(this.busquedaUsuario.toLowerCase());
        const coincideRol = !this.filtroRol || usuario.rol === this.filtroRol;
        return coincideBusqueda && coincideRol;
      });
    }
  },
  
  async mounted() {
    await this.verificarAutenticacion();
    await this.cargarDatos();
  },
  
  methods: {
    async verificarAutenticacion() {
      if (!UsuarioService.estaAutenticado()) {
        console.log('❌ No autenticado, redirigiendo a login');
        this.$router.push('/login');
        return;
      }
      
      const rol = UsuarioService.obtenerRol();
      const usuario = UsuarioService.obtenerUsuario();
      
      console.log('🔍 AdminView - Rol detectado:', rol);
      console.log('🔍 AdminView - Usuario:', usuario);
      
      if (rol !== 'Administrador') {
        console.log('❌ Acceso denegado a AdminView, rol:', rol);
        // Redirigir según el rol correcto
        switch(rol) {
          case 'Vendedor':
            this.$router.push('/vendedor/dashboard');
            break;
          case 'Repartidor':
            this.$router.push('/repartidor/pedidos');
            break;
          case 'Cliente':
          default:
            this.$router.push('/');
            break;
        }
        return;
      }
      
      console.log('✅ Acceso autorizado a AdminView');
      this.nombreAdmin = usuario?.nombre || 'Administrador';
    },
    
    async cargarDatos() {
      try {
        this.loading = true;
        
        await Promise.all([
          this.cargarEstadisticas(),
          this.cargarUsuarios(),
          this.cargarSolicitudesVendedor(),
          this.cargarNegocios(),
          this.cargarCategoriasNegocios(),
          this.cargarCategoriasProductos(),
          this.cargarProductos()
        ]);
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        Notificar.error('Error al cargar los datos');
      } finally {
        this.loading = false;
      }
    },
    
    async cargarEstadisticas() {
      try {
        this.estadisticas = await AdministradorService.getDashboard();
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    },
    
    async cargarUsuarios() {
      try {
        const response = await AdministradorService.getUsuarios();
        this.usuarios = response.data || [];
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        this.usuarios = [];
      }
    },
    
    async cargarSolicitudesVendedor() {
      try {
        this.solicitudesVendedor = await AdministradorService.getSolicitudesVendedor();
      } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        this.solicitudesVendedor = [];
      }
    },
    
    async cambiarRol(usuario, nuevoRol) {
      try {
        await AdministradorService.updateUsuario(usuario.usuarioId, {
          rol: nuevoRol
        });
        
        await this.cargarUsuarios();
        Notificar.exito(`Usuario actualizado a ${nuevoRol}`);
        
      } catch (error) {
        console.error('Error al cambiar rol:', error);
        Notificar.error('Error al cambiar el rol del usuario');
      }
    },
    
    async cargarNegocios() {
      try {
        const { AppServices } = await import('../../private/services');
        this.negocios = await AppServices.negocio.getAll();
      } catch (error) {
        console.error('Error al cargar negocios:', error);
        this.negocios = [];
      }
    },
    
    async cargarCategoriasNegocios() {
      try {
        const { AppServices } = await import('../../private/services');
        this.categoriasNegocios = await AppServices.categoria.getAll();
      } catch (error) {
        console.error('Error al cargar categorías de negocios:', error);
        this.categoriasNegocios = [];
      }
    },
    
    async cargarCategoriasProductos() {
      try {
        const categorias = ['Pizzas', 'Bebidas Calientes', 'Repostería', 'Comida Rápida', 'Ensaladas', 'Postres'];
        this.categoriasProductos = categorias.map((cat, index) => ({
          id: index + 1,
          nombre: cat,
          descripcion: `Categoría de ${cat}`
        }));
      } catch (error) {
        console.error('Error al cargar categorías de productos:', error);
        this.categoriasProductos = [];
      }
    },
    
    async cargarProductos() {
      try {
        const { AppServices } = await import('../../private/services');
        this.productos = await AppServices.producto.getAll();
      } catch (error) {
        console.error('Error al cargar productos:', error);
        this.productos = [];
      }
    },
    
    contarNegociosPorCategoria(categoriaId) {
      return this.negocios.filter(n => n.categoria?.id === categoriaId).length;
    },
    
    contarProductosPorCategoria(categoriaNombre) {
      return this.productos.filter(p => p.categoria === categoriaNombre).length;
    },
    
    // Métodos de gestión de negocios
    async cambiarEstadoNegocio(negocio) {
      try {
        const nuevoEstado = negocio.estado === 'Activo' ? 'Suspendido' : 'Activo';
        const { AppServices } = await import('../../private/services');
        await AppServices.negocio.update(negocio.id, { estado: nuevoEstado });
        negocio.estado = nuevoEstado;
        this.mostrarNotificacion(`Negocio ${nuevoEstado.toLowerCase()} exitosamente`, 'success');
      } catch (error) {
        console.error('Error al cambiar estado del negocio:', error);
        this.mostrarNotificacion('Error al cambiar el estado del negocio', 'error');
      }
    },
    
    async eliminarNegocio(negocio) {
      if (!confirm(`¿Está seguro de eliminar el negocio "${negocio.nombreNegocio}"?`)) return;
      
      try {
        const { AppServices } = await import('../../private/services');
        await AppServices.negocio.delete(negocio.id);
        this.negocios = this.negocios.filter(n => n.id !== negocio.id);
        this.mostrarNotificacion('Negocio eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar negocio:', error);
        this.mostrarNotificacion('Error al eliminar el negocio', 'error');
      }
    },
    
    // Métodos de gestión de usuarios
    async cambiarRolUsuario(usuario) {
      try {
        const { AppServices } = await import('../../private/services');
        await AppServices.usuario.update(usuario.id, { rol: usuario.rol });
        this.mostrarNotificacion(`Rol cambiado a ${usuario.rol} exitosamente`, 'success');
      } catch (error) {
        console.error('Error al cambiar rol:', error);
        this.mostrarNotificacion('Error al cambiar el rol del usuario', 'error');
      }
    },
    
    async cambiarEstadoUsuario(usuario) {
      try {
        const nuevoEstado = usuario.estado === 'Activo' ? 'Suspendido' : 'Activo';
        const { AppServices } = await import('../../private/services');
        await AppServices.usuario.update(usuario.id, { estado: nuevoEstado });
        usuario.estado = nuevoEstado;
        this.mostrarNotificacion(`Usuario ${nuevoEstado.toLowerCase()} exitosamente`, 'success');
      } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        this.mostrarNotificacion('Error al cambiar el estado del usuario', 'error');
      }
    },
    
    async eliminarUsuario(usuario) {
      if (!confirm(`¿Está seguro de eliminar al usuario "${usuario.nombre}"?`)) return;
      
      try {
        const { AppServices } = await import('../../private/services');
        await AppServices.usuario.delete(usuario.id);
        this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
        this.mostrarNotificacion('Usuario eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        this.mostrarNotificacion('Error al eliminar el usuario', 'error');
      }
    },
    
    // Métodos de categorías de negocios
    editarCategoriaNegocio(categoria) {
      this.categoriaEditando = categoria;
      this.formularioCategoriaNegocio = { ...categoria };
      this.mostrarModalCategoriaNegocio = true;
    },
    
    async guardarCategoriaNegocio() {
      try {
        const { AppServices } = await import('../../private/services');
        
        if (this.categoriaEditando) {
          await AppServices.categoria.update(this.categoriaEditando.id, this.formularioCategoriaNegocio);
          const index = this.categoriasNegocios.findIndex(c => c.id === this.categoriaEditando.id);
          if (index !== -1) {
            this.categoriasNegocios[index] = { ...this.categoriaEditando, ...this.formularioCategoriaNegocio };
          }
        } else {
          const nueva = await AppServices.categoria.create(this.formularioCategoriaNegocio);
          this.categoriasNegocios.push(nueva);
        }
        
        this.cerrarModalCategoriaNegocio();
        this.mostrarNotificacion('Categoría guardada exitosamente', 'success');
      } catch (error) {
        console.error('Error al guardar categoría:', error);
        this.mostrarNotificacion('Error al guardar la categoría', 'error');
      }
    },
    
    async eliminarCategoriaNegocio(categoria) {
      if (!confirm(`¿Está seguro de eliminar la categoría "${categoria.categoria}"?`)) return;
      
      try {
        const { AppServices } = await import('../../private/services');
        await AppServices.categoria.delete(categoria.id);
        this.categoriasNegocios = this.categoriasNegocios.filter(c => c.id !== categoria.id);
        this.mostrarNotificacion('Categoría eliminada exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        this.mostrarNotificacion('Error al eliminar la categoría', 'error');
      }
    },
    
    cerrarModalCategoriaNegocio() {
      this.mostrarModalCategoriaNegocio = false;
      this.categoriaEditando = null;
      this.formularioCategoriaNegocio = { categoria: '', descripcion: '' };
    },
    
    // Métodos de categorías de productos
    editarCategoriaProducto(categoria) {
      this.categoriaProductoEditando = categoria;
      this.formularioCategoriaProducto = { ...categoria };
      this.mostrarModalCategoriaProducto = true;
    },
    
    async guardarCategoriaProducto() {
      try {
        if (this.categoriaProductoEditando) {
          const index = this.categoriasProductos.findIndex(c => c.id === this.categoriaProductoEditando.id);
          if (index !== -1) {
            this.categoriasProductos[index] = { ...this.categoriaProductoEditando, ...this.formularioCategoriaProducto };
          }
        } else {
          const nuevaId = Math.max(...this.categoriasProductos.map(c => c.id)) + 1;
          this.categoriasProductos.push({
            id: nuevaId,
            ...this.formularioCategoriaProducto
          });
        }
        
        this.cerrarModalCategoriaProducto();
        this.mostrarNotificacion('Categoría de producto guardada exitosamente', 'success');
      } catch (error) {
        console.error('Error al guardar categoría de producto:', error);
        this.mostrarNotificacion('Error al guardar la categoría de producto', 'error');
      }
    },
    
    async eliminarCategoriaProducto(categoria) {
      if (!confirm(`¿Está seguro de eliminar la categoría "${categoria.nombre}"?`)) return;
      
      this.categoriasProductos = this.categoriasProductos.filter(c => c.id !== categoria.id);
      this.mostrarNotificacion('Categoría de producto eliminada exitosamente', 'success');
    },
    
    cerrarModalCategoriaProducto() {
      this.mostrarModalCategoriaProducto = false;
      this.categoriaProductoEditando = null;
      this.formularioCategoriaProducto = { nombre: '', descripcion: '' };
    },
    
    mostrarNotificacion(mensaje, tipo = 'info') {
      // Método simple de notificación
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 9999;
        max-width: 300px;
        opacity: 0;
        transition: opacity 0.3s ease;
        ${tipo === 'error' ? 'background-color: #f44336;' : 
          tipo === 'warning' ? 'background-color: #ff9800;' : 
          'background-color: #4caf50;'}
      `;
      notification.textContent = mensaje;
      
      document.body.appendChild(notification);
      
      setTimeout(() => notification.style.opacity = '1', 100);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);
    },

    async aprobarVendedor(solicitud) {
      try {
        await AdministradorService.aprobarVendedor(solicitud.vendedor.usuarioId);
        await this.cargarSolicitudesVendedor();
        await this.cargarEstadisticas();
        
        Notificar.exito('Vendedor aprobado correctamente');
        
      } catch (error) {
        console.error('Error al aprobar vendedor:', error);
        Notificar.error('Error al aprobar el vendedor');
      }
    },
    
    async rechazarVendedor(solicitud) {
      try {
        const motivo = prompt('Motivo del rechazo (opcional):');
        await AdministradorService.rechazarVendedor(solicitud.vendedor.usuarioId, motivo);
        await this.cargarSolicitudesVendedor();
        
        Notificar.exito('Vendedor rechazado');
        
      } catch (error) {
        console.error('Error al rechazar vendedor:', error);
        Notificar.error('Error al rechazar el vendedor');
      }
    },
    
    logout() {
      UsuarioService.logout();
      this.$router.push('/login');
    }
  }
};
</script>

<style>
.admin-layout {
  min-height: 100vh;
  background: #f8f9fa;
}

.admin-header {
  background: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-header h1 {
  margin: 0;
  color: #333;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-logout {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.admin-nav {
  background: white;
  padding: 0 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 20px;
  overflow-x: auto;
}

.admin-nav button {
  background: none;
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #666;
}

.admin-nav button.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.admin-nav button:hover {
  color: #007bff;
}

.admin-content {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard h2 {
  margin: 0 0 25px 0;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
  color: #007bff;
}

.stat-card p {
  margin: 0 0 5px 0;
  font-weight: 500;
  color: #333;
}

.stat-card small {
  color: #666;
}

.usuarios-section h2,
.vendedores-section h2 {
  margin: 0 0 25px 0;
  color: #333;
}

.usuarios-grid,
.solicitudes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.usuario-card,
.solicitud-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.usuario-card h4,
.solicitud-card h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.usuario-card p,
.solicitud-card p {
  margin: 5px 0;
  color: #666;
}

.rol-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
  margin: 10px 0;
}

.rol-badge.cliente {
  background: #e3f2fd;
  color: #1976d2;
}

.rol-badge.vendedor {
  background: #fff3e0;
  color: #f57c00;
}

.rol-badge.repartidor {
  background: #e8f5e8;
  color: #388e3c;
}

.rol-badge.admin {
  background: #fce4ec;
  color: #c2185b;
}

.acciones {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.acciones button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
}

.btn-vendedor {
  background: #ff9800;
  color: white;
}

.btn-repartidor {
  background: #4caf50;
  color: white;
}

.btn-aprobar {
  background: #28a745;
  color: white;
}

.btn-rechazar {
  background: #dc3545;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .admin-nav {
    padding: 0 15px;
  }
  
  .admin-content {
    padding: 15px;
  }
  
  .stats-grid,
  .usuarios-grid,
  .solicitudes-grid {
    grid-template-columns: 1fr;
  }
}
</style>