<template>
  <div class="mis-pedidos-background">
    <!-- Hero Banner -->
    <div class="pedidos-hero-banner">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">Mis Pedidos</h1>
        <p class="hero-subtitle">Revisa el estado de tus compras</p>
      </div>
    </div>

    <div class="container pedidos-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container text-center">
        <div class="spinner"></div>
        <p class="loading-text">Cargando tus pedidos...</p>
      </div>

      <!-- Sin Pedidos -->
      <div v-else-if="pedidos.length === 0" class="pedidos-vacio">
        <div class="empty-icon">📦</div>
        <h3 class="empty-title">¡No tienes pedidos aún!</h3>
        <p class="empty-subtitle">Realiza tu primera compra y aparecerá aquí</p>
        <button @click="irAHome" class="btn-explorar">
          <span>Ver Productos</span>
          <span class="icono-flecha">→</span>
        </button>
      </div>

      <!-- Lista de Pedidos -->
      <div v-else>
        <!-- Filtros -->
        <div class="filtros-container">
          <h2 class="filtros-titulo">Filtrar por estado:</h2>
          <div class="filtros-botones">
            <button 
              :class="['filtro-btn', { active: filtroEstado === null }]"
              @click="filtroEstado = null"
            >
              Todos ({{ pedidos.length }})
            </button>
            <button 
              :class="['filtro-btn', { active: filtroEstado === 'Pendiente' }]"
              @click="filtroEstado = 'Pendiente'"
            >
              Pendientes ({{ contarPorEstado('Pendiente') }})
            </button>
            <button 
              :class="['filtro-btn', { active: filtroEstado === 'EnCamino' }]"
              @click="filtroEstado = 'EnCamino'"
            >
              En Camino ({{ contarPorEstado('EnCamino') }})
            </button>
            <button 
              :class="['filtro-btn', { active: filtroEstado === 'Entregado' }]"
              @click="filtroEstado = 'Entregado'"
            >
              Entregados ({{ contarPorEstado('Entregado') }})
            </button>
          </div>
        </div>

        <!-- Lista de Pedidos Filtrados -->
        <div class="pedidos-lista">
          <div 
            v-for="pedido in pedidosFiltrados" 
            :key="pedido.pedidoId"
            class="pedido-card"
          >
            <div class="pedido-header">
              <div class="pedido-info-principal">
                <h3 class="pedido-numero">Pedido #{{ pedido.pedidoId }}</h3>
                <p class="pedido-fecha">{{ formatearFecha(pedido.fechaCreacion) }}</p>
              </div>
              <span :class="['pedido-estado', `estado-${pedido.estado.toLowerCase()}`]">
                {{ getTextoEstado(pedido.estado) }}
              </span>
            </div>

            <div class="pedido-productos">
              <h4 class="productos-titulo">Productos:</h4>
              <div class="productos-grid">
                <div 
                  v-for="detalle in pedido.detalles" 
                  :key="detalle.pedidoDetalleId"
                  class="producto-item"
                >
                  <div class="producto-info-item">
                    <span class="producto-nombre">{{ detalle.producto?.nombre || 'Producto' }}</span>
                    <span class="producto-cantidad">x{{ detalle.cantidad }}</span>
                  </div>
                  <span class="producto-subtotal">{{ formatearPrecio(detalle.subtotal) }}</span>
                </div>
              </div>
            </div>

            <div class="pedido-footer">
              <div class="pedido-total">
                <span class="total-label">Total:</span>
                <span class="total-valor">{{ formatearPrecio(pedido.total) }}</span>
              </div>

              <div class="pedido-acciones">
                <button 
                  @click="verDetalle(pedido)" 
                  class="btn-ver-detalle"
                >
                  👁️ Ver Detalle
                </button>
                <button 
                  v-if="puedeCancelar(pedido.estado)"
                  @click="cancelarPedido(pedido.pedidoId)" 
                  class="btn-cancelar-pedido"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>

            <!-- Indicador de Estado Visual -->
            <div class="estado-visual">
              <div :class="['estado-step', { active: true }]">
                <div class="step-icon">✅</div>
                <span class="step-texto">Pendiente</span>
              </div>
              <div class="estado-linea" :class="{ active: pedido.estado !== 'Pendiente' }"></div>
              <div :class="['estado-step', { active: pedido.estado === 'EnCamino' || pedido.estado === 'Entregado' }]">
                <div class="step-icon">🚚</div>
                <span class="step-texto">En Camino</span>
              </div>
              <div class="estado-linea" :class="{ active: pedido.estado === 'Entregado' }"></div>
              <div :class="['estado-step', { active: pedido.estado === 'Entregado' }]">
                <div class="step-icon">📦</div>
                <span class="step-texto">Entregado</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="paginacion">
          <button 
            @click="cambiarPagina(paginaActual - 1)"
            :disabled="paginaActual <= 1"
            class="btn-pagina"
          >
            ← Anterior
          </button>
          <span class="pagina-actual">Página {{ paginaActual }} de {{ totalPages }}</span>
          <button 
            @click="cambiarPagina(paginaActual + 1)"
            :disabled="paginaActual >= totalPages"
            class="btn-pagina"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Detalle -->
    <div v-if="pedidoSeleccionado" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detalle del Pedido #{{ pedidoSeleccionado.pedidoId }}</h3>
          <button @click="cerrarModal" class="btn-cerrar-modal">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="detalle-seccion">
            <h4>Estado</h4>
            <span :class="['pedido-estado', `estado-${pedidoSeleccionado.estado.toLowerCase()}`]">
              {{ getTextoEstado(pedidoSeleccionado.estado) }}
            </span>
          </div>

          <div class="detalle-seccion">
            <h4>Fecha de Pedido</h4>
            <p>{{ formatearFecha(pedidoSeleccionado.fechaCreacion) }}</p>
          </div>

          <div class="detalle-seccion">
            <h4>Productos</h4>
            <div class="detalle-productos">
              <div 
                v-for="detalle in pedidoSeleccionado.detalles" 
                :key="detalle.pedidoDetalleId"
                class="detalle-producto-item"
              >
                <span class="nombre">{{ detalle.producto?.nombre || 'Producto' }}</span>
                <span class="cantidad">x{{ detalle.cantidad }}</span>
                <span class="precio">{{ formatearPrecio(detalle.subtotal) }}</span>
              </div>
            </div>
          </div>

          <div class="detalle-total">
            <span>Total del Pedido:</span>
            <span class="total-modal">{{ formatearPrecio(pedidoSeleccionado.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PedidoService } from '../../private/services/PedidoService';
import { Notificar } from '../utils/notificaciones';

export default {
  name: 'MisPedidosView',
  setup() {
    const router = useRouter();
    
    const loading = ref(true);
    const pedidos = ref([]);
    const filtroEstado = ref(null);
    const paginaActual = ref(1);
    const totalPages = ref(1);
    const pedidoSeleccionado = ref(null);

    // Computed
    const pedidosFiltrados = computed(() => {
      if (!filtroEstado.value) return pedidos.value;
      return pedidos.value.filter(p => p.estado === filtroEstado.value);
    });

    // Métodos
    const cargarPedidos = async (page = 1) => {
      try {
        loading.value = true;
        const response = await PedidoService.getMisPedidos(page, 10);
        
        pedidos.value = response.data || [];
        paginaActual.value = response.page || 1;
        totalPages.value = response.totalPages || 1;

      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        Notificar.error('Error al cargar tus pedidos');
      } finally {
        loading.value = false;
      }
    };

    const cambiarPagina = (nuevaPagina) => {
      if (nuevaPagina < 1 || nuevaPagina > totalPages.value) return;
      cargarPedidos(nuevaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const contarPorEstado = (estado) => {
      return pedidos.value.filter(p => p.estado === estado).length;
    };

    const verDetalle = (pedido) => {
      pedidoSeleccionado.value = pedido;
    };

    const cerrarModal = () => {
      pedidoSeleccionado.value = null;
    };

    const cancelarPedido = async (pedidoId) => {
      if (!confirm('¿Estás seguro de cancelar este pedido?')) return;

      try {
        await PedidoService.cancelarPedido(pedidoId);
        await cargarPedidos(paginaActual.value);
        Notificar.exito('Pedido cancelado exitosamente');
      } catch (error) {
        console.error('Error al cancelar:', error);
        Notificar.error('No se pudo cancelar el pedido');
      }
    };

    const puedeCancelar = (estado) => {
      return PedidoService.puedeCancelar(estado);
    };

    const getTextoEstado = (estado) => {
      return PedidoService.getTextoEstado(estado);
    };

    const formatearFecha = (fecha) => {
      return PedidoService.formatearFecha(fecha);
    };

    const formatearPrecio = (precio) => {
      return `$${Number(precio).toLocaleString('es-AR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    };

    const irAHome = () => {
      router.push({ name: 'MainView' });
    };

    onMounted(() => {
      cargarPedidos();
    });

    return {
      loading,
      pedidos,
      filtroEstado,
      paginaActual,
      totalPages,
      pedidoSeleccionado,
      pedidosFiltrados,
      cargarPedidos,
      cambiarPagina,
      contarPorEstado,
      verDetalle,
      cerrarModal,
      cancelarPedido,
      puedeCancelar,
      getTextoEstado,
      formatearFecha,
      formatearPrecio,
      irAHome,
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

* {
  box-sizing: border-box;
}

.mis-pedidos-background {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  padding-bottom: 60px;
}

/* Hero Banner */
.pedidos-hero-banner {
  background-image: url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200');
  background-size: cover;
  background-position: center;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 3rem;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
}

.hero-title {
  font-family: 'Permanent Marker', sans-serif;
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.4);
  animation: fadeInUp 0.6s ease-out;
}

.hero-subtitle {
  font-size: 1.3rem;
  font-weight: 300;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.8s ease-out;
}

/* Container */
.pedidos-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Loading */
.loading-container {
  padding: 5rem 0;
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #666;
  font-size: 1.2rem;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Estado Vacío */
.pedidos-vacio {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.5s ease-out;
}

.empty-icon {
  font-size: 6rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

.empty-title {
  color: #333;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
}

.empty-subtitle {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.btn-explorar {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  color: white;
  border: none;
  padding: 14px 40px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 153, 0, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn-explorar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 153, 0, 0.4);
}

.icono-flecha {
  transition: transform 0.3s ease;
}

.btn-explorar:hover .icono-flecha {
  transform: translateX(5px);
}

/* Filtros */
.filtros-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filtros-titulo {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.filtros-botones {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filtro-btn {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filtro-btn:hover {
  border-color: #ff9900;
  color: #ff9900;
  transform: translateY(-2px);
}

.filtro-btn.active {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  color: white;
  border-color: #ff9900;
}

/* Lista de Pedidos */
.pedidos-lista {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pedido-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out;
}

.pedido-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.pedido-numero {
  font-size: 1.5rem;
  font-weight: 800;
  color: #333;
  margin: 0 0 4px 0;
}

.pedido-fecha {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
}

.pedido-estado {
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.95rem;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado-pendiente { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); }
.estado-encamino { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); }
.estado-entregado { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); }
.estado-cancelado { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); }

/* Productos */
.productos-titulo {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.productos-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.producto-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.producto-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.producto-info-item {
  display: flex;
  gap: 12px;
  flex: 1;
}

.producto-nombre {
  font-weight: 600;
  color: #333;
  flex: 1;
}

.producto-cantidad {
  color: #666;
  font-weight: 600;
}

.producto-subtotal {
  font-weight: 700;
  color: #ff9900;
  font-size: 1.1rem;
}

/* Footer del Pedido */
.pedido-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 2px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.pedido-total {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 1.3rem;
}

.total-label {
  font-weight: 600;
  color: #333;
}

.total-valor {
  font-weight: 800;
  color: #ff9900;
  font-size: 1.5rem;
}

.pedido-acciones {
  display: flex;
  gap: 10px;
}

.btn-ver-detalle,
.btn-cancelar-pedido {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ver-detalle {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-ver-detalle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
}

.btn-cancelar-pedido {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.btn-cancelar-pedido:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

/* Estado Visual */
.estado-visual {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.estado-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.estado-step.active {
  opacity: 1;
}

.step-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.estado-step.active .step-icon {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  box-shadow: 0 4px 12px rgba(255, 153, 0, 0.3);
}

.step-texto {
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
}

.estado-step.active .step-texto {
  color: #ff9900;
}

.estado-linea {
  width: 80px;
  height: 4px;
  background: #e0e0e0;
  transition: all 0.3s ease;
}

.estado-linea.active {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
}

/* Paginación */
.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 3rem;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.btn-pagina {
  padding: 12px 24px;
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 153, 0, 0.3);
}

.btn-pagina:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 153, 0, 0.4);
}

.btn-pagina:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagina-actual {
  font-weight: 700;
  color: #333;
  font-size: 1.1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  padding: 24px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
}

.modal-header h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.btn-cerrar-modal {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.8rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cerrar-modal:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 30px;
}

.detalle-seccion {
  margin-bottom: 24px;
}

.detalle-seccion h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.detalle-productos {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detalle-producto-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #fafafa;
  border-radius: 10px;
}

.detalle-producto-item .nombre {
  font-weight: 600;
  color: #333;
  flex: 1;
}

.detalle-producto-item .cantidad {
  color: #666;
  margin: 0 16px;
}

.detalle-producto-item .precio {
  font-weight: 700;
  color: #ff9900;
}

.detalle-total {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 700;
}

.total-modal {
  color: #ff9900;
  font-size: 1.6rem;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .filtros-botones {
    flex-direction: column;
  }

  .filtro-btn {
    width: 100%;
  }

  .pedido-header,
  .pedido-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .pedido-acciones {
    width: 100%;
    flex-direction: column;
  }

  .btn-ver-detalle,
  .btn-cancelar-pedido {
    width: 100%;
  }

  .estado-visual {
    flex-wrap: wrap;
  }

  .estado-linea {
    width: 40px;
  }
}
</style>