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
        @click="seccionActiva = 'usuarios'" 
        :class="{ active: seccionActiva === 'usuarios' }"
      >
        Usuarios
      </button>
      <button 
        @click="seccionActiva = 'vendedores'" 
        :class="{ active: seccionActiva === 'vendedores' }"
      >
        Vendedores
      </button>
      <button 
        @click="seccionActiva = 'productos'" 
        :class="{ active: seccionActiva === 'productos' }"
      >
        Productos
      </button>
      <button 
        @click="seccionActiva = 'pedidos'" 
        :class="{ active: seccionActiva === 'pedidos' }"
      >
        Pedidos
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
      solicitudesVendedor: []
    };
  },
  
  async mounted() {
    await this.verificarAutenticacion();
    await this.cargarDatos();
  },
  
  methods: {
    async verificarAutenticacion() {
      if (!UsuarioService.estaAutenticado()) {
        this.$router.push('/login');
        return;
      }
      
      const rol = UsuarioService.obtenerRol();
      if (rol !== 'admin') {
        this.$router.push('/');
        return;
      }
      
      const usuario = UsuarioService.obtenerUsuario();
      this.nombreAdmin = usuario?.nombre || 'Administrador';
    },
    
    async cargarDatos() {
      try {
        this.loading = true;
        
        await Promise.all([
          this.cargarEstadisticas(),
          this.cargarUsuarios(),
          this.cargarSolicitudesVendedor()
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