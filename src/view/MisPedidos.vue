<template>
  <div class="mis-pedidos">
    <h1 class="page-title">Mis Pedidos</h1>

    <!-- Filtros -->
    <div class="filters">
      <button 
        v-for="filtro in filtros" 
        :key="filtro.value"
        @click="filtroActivo = filtro.value"
        class="filter-btn"
        :class="{ active: filtroActivo === filtro.value }"
      >
        {{ filtro.label }} ({{ contarPedidos(filtro.value) }})
      </button>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="loading">
      <p>Cargando pedidos...</p>
    </div>

    <!-- Lista de pedidos -->
    <div v-else-if="pedidosFiltrados.length > 0" class="pedidos-lista">
      <div 
        v-for="pedido in pedidosFiltrados" 
        :key="pedido.id" 
        class="pedido-card"
        :class="`estado-${pedido.estado.toLowerCase()}`"
      >
        <!-- Header del pedido -->
        <div class="pedido-header">
          <div class="pedido-info">
            <h3>Pedido #{{ pedido.id }}</h3>
            <p class="fecha">{{ formatearFecha(pedido.fechaCreacion) }}</p>
          </div>
          <div class="estado-badge" :class="`estado-${pedido.estado.toLowerCase()}`">
            {{ obtenerTextoEstado(pedido.estado) }}
          </div>
        </div>

        <!-- Detalles del pedido -->
        <div class="pedido-detalles">
          <div class="productos">
            <div v-for="detalle in pedido.detalles" :key="detalle.id" class="producto-item">
              <span class="cantidad">{{ detalle.cantidad }}x</span>
              <span class="nombre">{{ obtenerNombreProducto(detalle.productoId) }}</span>
              <span class="precio">${{ (detalle.cantidad * detalle.precioUnitario).toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="direccion">
            <strong>Dirección:</strong> {{ pedido.direccionEntrega }}
          </div>
          
          <div class="totales">
            <div class="total-final">
              <strong>Total: ${{ pedido.total.toFixed(2) }}</strong>
            </div>
          </div>
        </div>

        <!-- Timeline del pedido -->
        <div v-if="pedido.estado !== 'Cancelado'" class="pedido-timeline">
          <div class="timeline-item" :class="{ completed: true }">
            <div class="timeline-icon">✓</div>
            <span>Pedido confirmado</span>
            <span class="timestamp">{{ formatearHora(pedido.fechaCreacion) }}</span>
          </div>
          
          <div class="timeline-item" :class="{ completed: pedido.estado !== 'Pendiente' }">
            <div class="timeline-icon">{{ pedido.estado !== 'Pendiente' ? '✓' : '○' }}</div>
            <span>Asignado a repartidor</span>
            <span v-if="pedido.fechaAsignacion" class="timestamp">{{ formatearHora(pedido.fechaAsignacion) }}</span>
          </div>
          
          <div class="timeline-item" :class="{ completed: pedido.estado === 'EnCamino' || pedido.estado === 'Entregado' }">
            <div class="timeline-icon">{{ (pedido.estado === 'EnCamino' || pedido.estado === 'Entregado') ? '✓' : '○' }}</div>
            <span>En camino</span>
            <span v-if="pedido.fechaDespacho" class="timestamp">{{ formatearHora(pedido.fechaDespacho) }}</span>
          </div>
          
          <div class="timeline-item" :class="{ completed: pedido.estado === 'Entregado' }">
            <div class="timeline-icon">{{ pedido.estado === 'Entregado' ? '✓' : '○' }}</div>
            <span>Entregado</span>
            <span v-if="pedido.fechaEntrega" class="timestamp">{{ formatearHora(pedido.fechaEntrega) }}</span>
          </div>
        </div>

        <!-- Acciones del pedido -->
        <div class="pedido-acciones">
          <button 
            v-if="pedido.estado === 'Pendiente'" 
            @click="cancelarPedido(pedido.id)"
            class="btn btn-secondary"
          >
            Cancelar pedido
          </button>
          
          <button 
            v-if="pedido.estado === 'Entregado' && !pedido.reseña" 
            @click="abrirModalReseña(pedido)"
            class="btn btn-primary"
          >
            Calificar pedido
          </button>
          
          <button 
            @click="repetirPedido(pedido)"
            class="btn btn-outline"
          >
            Repetir pedido
          </button>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <h3>No tienes pedidos{{ filtroActivo !== 'todos' ? ' ' + filtros.find(f => f.value === filtroActivo)?.label.toLowerCase() : '' }}</h3>
      <p>¡Explora nuestros productos y haz tu primer pedido!</p>
      <button @click="$router.push('/productos')" class="btn btn-primary">
        Explorar productos
      </button>
    </div>

    <!-- Modal de reseña -->
    <div v-if="mostrarModalReseña" class="modal-overlay" @click="cerrarModalReseña">
      <div class="modal" @click.stop>
        <div class="modal-content">
          <h3>Calificar pedido #{{ pedidoParaReseña?.id }}</h3>
          
          <div class="form-group">
            <label>Calificación:</label>
            <div class="rating">
              <span 
                v-for="n in 5" 
                :key="n"
                @click="calificacion = n"
                class="star"
                :class="{ active: n <= calificacion }"
              >
                ⭐
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="comentario">Comentario (opcional):</label>
            <textarea 
              id="comentario"
              v-model="comentarioReseña"
              placeholder="Cuéntanos sobre tu experiencia..."
              rows="4"
            ></textarea>
          </div>
          
          <div class="modal-actions">
            <button @click="cerrarModalReseña" class="btn btn-secondary">
              Cancelar
            </button>
            <button @click="enviarReseña" class="btn btn-primary">
              Enviar calificación
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PedidoService } from '../../private/services/pedidoService.js'
import { ProductoService } from '../../private/services/productoService.js'
import { CarritoService } from '../../private/services/carritoService.js'
import { mostrarNotificacion } from '../utils/notificaciones.js'

export default {
  name: 'MisPedidos',
  data() {
    return {
      pedidos: [],
      productos: [],
      cargando: true,
      filtroActivo: 'todos',
      mostrarModalReseña: false,
      pedidoParaReseña: null,
      calificacion: 0,
      comentarioReseña: '',
      filtros: [
        { value: 'todos', label: 'Todos' },
        { value: 'Pendiente', label: 'Pendientes' },
        { value: 'EnProceso', label: 'En proceso' },
        { value: 'EnCamino', label: 'En camino' },
        { value: 'Entregado', label: 'Entregados' },
        { value: 'Cancelado', label: 'Cancelados' }
      ]
    }
  },
  computed: {
    pedidosFiltrados() {
      if (this.filtroActivo === 'todos') {
        return this.pedidos
      }
      return this.pedidos.filter(pedido => pedido.estado === this.filtroActivo)
    }
  },
  async mounted() {
    await this.cargarDatos()
  },
  methods: {
    async cargarDatos() {
      try {
        this.cargando = true
        
        // Obtener usuario actual
        const token = localStorage.getItem('rappi_token')
        if (!token) {
          this.$router.push('/login')
          return
        }
        
        const usuario = JSON.parse(localStorage.getItem('rappi_user'))
        
        // Cargar pedidos y productos
        const [pedidos, productos] = await Promise.all([
          PedidoService.getPedidosUsuario(usuario.id),
          ProductoService.getAll()
        ])
        
        this.pedidos = pedidos.sort((a, b) => 
          new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
        )
        this.productos = productos
        
      } catch (error) {
        console.error('Error al cargar pedidos:', error)
        mostrarNotificacion('Error al cargar los pedidos', 'error')
      } finally {
        this.cargando = false
      }
    },

    contarPedidos(estado) {
      if (estado === 'todos') {
        return this.pedidos.length
      }
      return this.pedidos.filter(p => p.estado === estado).length
    },

    obtenerTextoEstado(estado) {
      const estados = {
        'Pendiente': 'Pendiente',
        'EnProceso': 'En proceso',
        'EnCamino': 'En camino',
        'Entregado': 'Entregado',
        'Cancelado': 'Cancelado'
      }
      return estados[estado] || estado
    },

    obtenerNombreProducto(productoId) {
      const producto = this.productos.find(p => p.id === productoId)
      return producto ? producto.nombre : `Producto ${productoId}`
    },

    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    formatearHora(fecha) {
      if (!fecha) return ''
      return new Date(fecha).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    async cancelarPedido(pedidoId) {
      if (!confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
        return
      }

      try {
        await PedidoService.cancelarPedido(pedidoId, 'Cancelado por el usuario')
        await this.cargarDatos()
        mostrarNotificacion('Pedido cancelado exitosamente', 'success')
      } catch (error) {
        console.error('Error al cancelar pedido:', error)
        mostrarNotificacion('Error al cancelar el pedido', 'error')
      }
    },

    abrirModalReseña(pedido) {
      this.pedidoParaReseña = pedido
      this.calificacion = 0
      this.comentarioReseña = ''
      this.mostrarModalReseña = true
    },

    cerrarModalReseña() {
      this.mostrarModalReseña = false
      this.pedidoParaReseña = null
      this.calificacion = 0
      this.comentarioReseña = ''
    },

    async enviarReseña() {
      if (this.calificacion === 0) {
        mostrarNotificacion('Por favor selecciona una calificación', 'warning')
        return
      }

      try {
        const reseña = {
          calificacion: this.calificacion,
          comentario: this.comentarioReseña
        }

        await PedidoService.agregarReseña(this.pedidoParaReseña.id, JSON.stringify(reseña))
        await this.cargarDatos()
        this.cerrarModalReseña()
        mostrarNotificacion('Gracias por tu calificación', 'success')
      } catch (error) {
        console.error('Error al enviar reseña:', error)
        mostrarNotificacion('Error al enviar la calificación', 'error')
      }
    },

    async repetirPedido(pedido) {
      try {
        // Agregar productos del pedido al carrito actual
        for (const detalle of pedido.detalles) {
          await CarritoService.agregarProducto(detalle.productoId, detalle.cantidad)
        }
        
        mostrarNotificacion('Productos agregados al carrito', 'success')
        this.$router.push('/carrito')
      } catch (error) {
        console.error('Error al repetir pedido:', error)
        mostrarNotificacion('Error al agregar productos al carrito', 'error')
      }
    }
  }
}
</script>

<style scoped>
.mis-pedidos {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.filter-btn {
  padding: 10px 20px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.filter-btn:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}

.filter-btn.active {
  background-color: #e74c3c;
  border-color: #e74c3c;
  color: white;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.pedidos-lista {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pedido-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-left: 4px solid #ddd;
}

.pedido-card.estado-pendiente {
  border-left-color: #f39c12;
}

.pedido-card.estado-enproceso {
  border-left-color: #3498db;
}

.pedido-card.estado-encamino {
  border-left-color: #9b59b6;
}

.pedido-card.estado-entregado {
  border-left-color: #27ae60;
}

.pedido-card.estado-cancelado {
  border-left-color: #e74c3c;
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.pedido-info h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.fecha {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

.estado-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.estado-pendiente {
  background-color: #fef9e7;
  color: #f39c12;
}

.estado-badge.estado-enproceso {
  background-color: #ebf3fd;
  color: #3498db;
}

.estado-badge.estado-encamino {
  background-color: #f4ecf7;
  color: #9b59b6;
}

.estado-badge.estado-entregado {
  background-color: #eafaf1;
  color: #27ae60;
}

.estado-badge.estado-cancelado {
  background-color: #fdedec;
  color: #e74c3c;
}

.pedido-detalles {
  margin-bottom: 20px;
}

.productos {
  margin-bottom: 15px;
}

.producto-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.producto-item:last-child {
  border-bottom: none;
}

.cantidad {
  font-weight: 600;
  color: #e74c3c;
  min-width: 40px;
}

.nombre {
  flex: 1;
  margin: 0 15px;
}

.precio {
  font-weight: 600;
  color: #333;
}

.direccion {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  color: #666;
}

.totales {
  text-align: right;
  border-top: 2px solid #eee;
  padding-top: 10px;
}

.total-final {
  font-size: 1.1rem;
  color: #333;
}

.pedido-timeline {
  margin: 20px 0;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.timeline-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.timeline-item.completed {
  opacity: 1;
}

.timeline-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ddd;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  margin-right: 10px;
}

.timeline-item.completed .timeline-icon {
  background-color: #27ae60;
}

.timestamp {
  margin-left: auto;
  font-size: 0.8rem;
  color: #666;
}

.pedido-acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #e74c3c;
  color: white;
}

.btn-primary:hover {
  background-color: #c0392b;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn-outline {
  background-color: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.btn-outline:hover {
  background-color: #e74c3c;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #333;
}

.empty-state p {
  margin-bottom: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content {
  padding: 30px;
}

.modal-content h3 {
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.rating {
  display: flex;
  gap: 5px;
}

.star {
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.star.active {
  opacity: 1;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .mis-pedidos {
    padding: 10px;
  }
  
  .pedido-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .producto-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .pedido-acciones {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>