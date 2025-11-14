<template>
  <div class="repartidor-layout">
    <header class="repartidor-header">
      <h1>Panel de Repartidor</h1>
      <div class="usuario-info">
        <span>{{ nombreRepartidor }}</span>
        <span class="estado" :class="estadoRepartidor">{{ estadoRepartidor }}</span>
        <button @click="logout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </header>

    <div class="estadisticas">
      <div class="stat-card">
        <span class="stat-number">{{ pedidosDisponibles.length }}</span>
        <span class="stat-label">Pedidos Disponibles</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ pedidosEnCamino.length }}</span>
        <span class="stat-label">En Camino</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ pedidosEntregados.length }}</span>
        <span class="stat-label">Entregados Hoy</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${{ gananciasHoy }}</span>
        <span class="stat-label">Ganancias Hoy</span>
      </div>
    </div>

    <div class="filtros">
      <button 
        @click="vistaActiva = 'disponibles'" 
        :class="{ active: vistaActiva === 'disponibles' }"
      >
        Pedidos Disponibles ({{ pedidosDisponibles.length }})
      </button>
      <button 
        @click="vistaActiva = 'encamino'" 
        :class="{ active: vistaActiva === 'encamino' }"
      >
        En Camino ({{ pedidosEnCamino.length }})
      </button>
      <button 
        @click="vistaActiva = 'entregados'" 
        :class="{ active: vistaActiva === 'entregados' }"
      >
        Entregados
      </button>
    </div>

    <div class="pedidos-container">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Cargando pedidos...</p>
      </div>

      <div v-else-if="pedidosActuales.length === 0" class="empty-state">
        <span class="material-icons">assignment</span>
        <p>No hay pedidos {{ vistaActiva === 'disponibles' ? 'disponibles' : vistaActiva }}</p>
      </div>

      <div v-else class="pedidos-lista">
        <div
          v-for="pedido in pedidosActuales"
          :key="pedido.pedidoId"
          class="pedido-card"
          :class="{ 'en-camino': pedido.estado === 'EnCamino' }"
        >
          <div class="pedido-header">
            <div class="pedido-info">
              <h3>Pedido #{{ pedido.pedidoId }}</h3>
              <span class="estado-badge" :class="pedido.estado.toLowerCase()">
                {{ estadoTexto(pedido.estado) }}
              </span>
            </div>
            <div class="pedido-tiempo">
              <span class="tiempo">{{ formatearFecha(pedido.fechaCreacion) }}</span>
              <span class="distancia" v-if="pedido.distancia">{{ pedido.distancia }}km</span>
            </div>
          </div>

          <div class="cliente-info">
            <h4>{{ pedido.cliente?.nombre || 'Cliente' }}</h4>
            <p class="direccion">
              <span class="material-icons">location_on</span>
              {{ pedido.direccionEntrega }}
            </p>
            <p class="telefono" v-if="pedido.cliente?.telefono">
              <span class="material-icons">phone</span>
              {{ pedido.cliente.telefono }}
            </p>
          </div>

          <div class="pedido-productos">
            <h4>Productos ({{ pedido.detalles?.length || 0 }} items)</h4>
            <div class="productos-lista">
              <div 
                v-for="item in (pedido.detalles || [])" 
                :key="item.itemPedidoId"
                class="producto-item"
              >
                <span>{{ item.nombreProducto }} x{{ item.cantidad }}</span>
                <span class="vendedor-tag">{{ item.vendedor || 'Vendedor' }}</span>
              </div>
            </div>
          </div>

          <div class="pedido-footer">
            <div class="total">
              <strong>Total: ${{ pedido.total || 0 }}</strong>
              <small>Comisión: ${{ calcularComision(pedido.total) }}</small>
            </div>
            
            <div class="acciones">
              <button 
                v-if="vistaActiva === 'disponibles'"
                @click="tomarPedido(pedido)"
                class="btn-tomar"
                :disabled="pedidosEnCamino.length >= maxPedidosSimultaneos"
              >
                <span class="material-icons">directions_bike</span>
                Tomar Pedido
              </button>
              
              <button 
                v-if="vistaActiva === 'encamino'"
                @click="marcarEntregado(pedido)"
                class="btn-entregar"
              >
                <span class="material-icons">check_circle</span>
                Marcar Entregado
              </button>
              
              <button 
                v-if="vistaActiva === 'encamino'"
                @click="verRuta(pedido)"
                class="btn-ruta"
              >
                <span class="material-icons">map</span>
                Ver Ruta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalRuta" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Ruta al Cliente</h3>
          <button @click="mostrarModalRuta = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="ruta-info">
            <p><strong>Destino:</strong> {{ pedidoSeleccionado?.direccionEntrega }}</p>
            <p><strong>Cliente:</strong> {{ pedidoSeleccionado?.cliente?.nombre }}</p>
            <p><strong>Teléfono:</strong> {{ pedidoSeleccionado?.cliente?.telefono }}</p>
          </div>
          <div class="mapa-placeholder">
            <span class="material-icons">map</span>
            <p>Integración con Google Maps</p>
            <a 
              :href="generarEnlaceMaps(pedidoSeleccionado?.direccionEntrega)" 
              target="_blank"
              class="btn-maps"
            >
              Abrir en Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { UsuarioService, PedidoService, RepartidorService } from '../../private/services';
import { Notificar } from '../utils/notificaciones';

export default {
  name: 'RepartidorView',
  data() {
    return {
      loading: true,
      nombreRepartidor: '',
      repartidorId: null,
      estadoRepartidor: 'disponible',
      vistaActiva: 'disponibles',
      maxPedidosSimultaneos: 3,
      
      pedidosDisponibles: [],
      pedidosEnCamino: [],
      pedidosEntregados: [],
      
      mostrarModalRuta: false,
      pedidoSeleccionado: null,
      
      actualizacionInterval: null
    };
  },
  
  computed: {
    pedidosActuales() {
      switch (this.vistaActiva) {
        case 'disponibles':
          return this.pedidosDisponibles;
        case 'encamino':
          return this.pedidosEnCamino;
        case 'entregados':
          return this.pedidosEntregados;
        default:
          return [];
      }
    },
    
    gananciasHoy() {
      return this.pedidosEntregados
        .filter(p => this.esDehoy(p.fechaEntrega))
        .reduce((total, pedido) => total + this.calcularComision(pedido.total), 0)
        .toFixed(2);
    }
  },
  
  async mounted() {
    await this.verificarAutenticacion();
    await this.inicializarDatos();
    this.iniciarActualizacionAutomatica();
  },
  
  beforeUnmount() {
    if (this.actualizacionInterval) {
      clearInterval(this.actualizacionInterval);
    }
  },
  
  methods: {
    async verificarAutenticacion() {
      if (!UsuarioService.estaAutenticado()) {
        this.$router.push('/login');
        return;
      }
      
      const rol = UsuarioService.obtenerRol();
      if (rol !== 'repartidor' && rol !== 'admin') {
        this.$router.push('/');
        return;
      }
      
      const usuario = UsuarioService.obtenerUsuario();
      this.nombreRepartidor = usuario?.nombre || 'Repartidor';
      this.repartidorId = usuario?.usuarioId;
    },
    
    async inicializarDatos() {
      try {
        this.loading = true;
        await this.cargarPedidos();
        Notificar.exito('Panel de repartidor cargado');
      } catch (error) {
        console.error('Error al cargar datos:', error);
        Notificar.error('Error al cargar los pedidos');
      } finally {
        this.loading = false;
      }
    },
    
    async cargarPedidos() {
      try {
        const [disponibles, enCamino, entregados] = await Promise.all([
          RepartidorService.getPedidosDisponibles(),
          RepartidorService.getPedidosActivosDeRepartidor(this.repartidorId),
          RepartidorService.getMisPedidos(this.repartidorId)
        ]);
        
        this.pedidosDisponibles = disponibles;
        this.pedidosEnCamino = enCamino;
        this.pedidosEntregados = entregados.filter(p => p.estado === 'Entregado');
        
        this.estadoRepartidor = this.pedidosEnCamino.length > 0 ? 'ocupado' : 'disponible';
        
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        this.pedidosDisponibles = [];
        this.pedidosEnCamino = [];
        this.pedidosEntregados = [];
      }
    },
    
    async tomarPedido(pedido) {
      try {
        if (this.pedidosEnCamino.length >= this.maxPedidosSimultaneos) {
          Notificar.error('No puedes tomar más pedidos');
          return;
        }
        
        await PedidoService.update(pedido.pedidoId, {
          repartidorId: this.repartidorId,
          estado: 'EnCamino'
        });
        
        await this.cargarPedidos();
        this.vistaActiva = 'encamino';
        
        Notificar.exito('Pedido tomado exitosamente');
        
      } catch (error) {
        console.error('Error al tomar pedido:', error);
        Notificar.error('Error al tomar el pedido');
      }
    },
    
    async marcarEntregado(pedido) {
      try {
        await PedidoService.update(pedido.pedidoId, {
          estado: 'Entregado',
          fechaEntrega: new Date().toISOString()
        });
        
        await this.cargarPedidos();
        
        Notificar.exito('Pedido marcado como entregado');
        
      } catch (error) {
        console.error('Error al marcar como entregado:', error);
        Notificar.error('Error al actualizar el pedido');
      }
    },
    
    verRuta(pedido) {
      this.pedidoSeleccionado = pedido;
      this.mostrarModalRuta = true;
    },
    
    generarEnlaceMaps(direccion) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    },
    
    calcularComision(total) {
      return (total * 0.15).toFixed(2);
    },
    
    esDehoy(fecha) {
      if (!fecha) return false;
      const hoy = new Date().toDateString();
      return new Date(fecha).toDateString() === hoy;
    },
    
    formatearFecha(fecha) {
      return new Date(fecha).toLocaleString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      });
    },
    
    estadoTexto(estado) {
      const estados = {
        'Pendiente': 'Pendiente',
        'EnCamino': 'En Camino',
        'Entregado': 'Entregado'
      };
      return estados[estado] || estado;
    },
    
    iniciarActualizacionAutomatica() {
      this.actualizacionInterval = setInterval(() => {
        this.cargarPedidos();
      }, 30000);
    },
    
    logout() {
      UsuarioService.logout();
      this.$router.push('/login');
    }
  }
};
</script>

<style>
.repartidor-layout {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

.repartidor-header {
  background: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.repartidor-header h1 {
  margin: 0;
  color: #333;
  font-size: 2em;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.usuario-info span {
  font-weight: 500;
}

.estado {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;
}

.estado.disponible {
  background: #d4edda;
  color: #155724;
}

.estado.ocupado {
  background: #fff3cd;
  color: #856404;
}

.btn-logout {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.estadisticas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-number {
  display: block;
  font-size: 2.5em;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
  text-transform: uppercase;
}

.filtros {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  overflow-x: auto;
  padding: 10px 0;
}

.filtros button {
  background: white;
  border: 1px solid #ddd;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  font-weight: 500;
}

.filtros button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.filtros button:hover:not(.active) {
  background: #f8f9fa;
}

.pedidos-container {
  min-height: 400px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
  color: #666;
  gap: 15px;
}

.empty-state .material-icons {
  font-size: 48px;
  color: #ccc;
}

.pedidos-lista {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.pedido-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.pedido-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.pedido-card.en-camino {
  border-left: 4px solid #007bff;
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.pedido-info h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.estado-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.pendiente {
  background: #fff3cd;
  color: #856404;
}

.estado-badge.encamino {
  background: #cce5ff;
  color: #004085;
}

.estado-badge.entregado {
  background: #d4edda;
  color: #155724;
}

.pedido-tiempo {
  text-align: right;
  color: #666;
  font-size: 0.9em;
}

.distancia {
  display: block;
  margin-top: 5px;
  font-weight: bold;
  color: #007bff;
}

.cliente-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.cliente-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.direccion, .telefono {
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9em;
}

.direccion .material-icons,
.telefono .material-icons {
  font-size: 16px;
  color: #007bff;
}

.pedido-productos {
  margin-bottom: 20px;
}

.pedido-productos h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1em;
}

.productos-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.producto-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9em;
}

.vendedor-tag {
  background: #e9ecef;
  color: #666;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8em;
}

.pedido-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
  flex-wrap: wrap;
  gap: 15px;
}

.total {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.total strong {
  font-size: 1.2em;
  color: #333;
}

.total small {
  color: #28a745;
  font-weight: 500;
}

.acciones {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.acciones button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.btn-tomar {
  background: #28a745;
  color: white;
}

.btn-tomar:hover:not(:disabled) {
  background: #218838;
}

.btn-tomar:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-entregar {
  background: #007bff;
  color: white;
}

.btn-entregar:hover {
  background: #0056b3;
}

.btn-ruta {
  background: #6c757d;
  color: white;
}

.btn-ruta:hover {
  background: #545b62;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 25px;
}

.ruta-info {
  margin-bottom: 20px;
}

.ruta-info p {
  margin: 10px 0;
  display: flex;
  gap: 10px;
}

.ruta-info strong {
  min-width: 80px;
}

.mapa-placeholder {
  background: #f8f9fa;
  padding: 40px;
  text-align: center;
  border-radius: 8px;
  color: #666;
}

.mapa-placeholder .material-icons {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 15px;
}

.btn-maps {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
}

.btn-maps:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .repartidor-layout {
    padding: 10px;
  }
  
  .repartidor-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .estadisticas {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pedidos-lista {
    grid-template-columns: 1fr;
  }
  
  .pedido-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .acciones {
    justify-content: center;
  }
}
</style>