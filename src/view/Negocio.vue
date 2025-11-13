<template>
  <div class="vendedor-dashboard-background">
    <!-- Hero Banner -->
    <div class="vendedor-hero-banner">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">Panel de Vendedor</h1>
        <p class="hero-subtitle">Gestiona tu negocio y productos</p>
      </div>
    </div>

    <div class="container dashboard-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container text-center">
        <div class="spinner"></div>
        <p class="loading-text">Cargando dashboard...</p>
      </div>

      <!-- Dashboard Content -->
      <div v-else>
        <!-- Resumen de Estadísticas -->
        <div class="row g-4 mb-4">
          <div class="col-md-3 col-sm-6">
            <div class="stat-card stat-productos">
              <div class="stat-icon">📦</div>
              <div class="stat-info">
                <h3 class="stat-number">{{ resumen?.productos.total || 0 }}</h3>
                <p class="stat-label">Productos Totales</p>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-sm-6">
            <div class="stat-card stat-stock">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <h3 class="stat-number">{{ resumen?.productos.conStock || 0 }}</h3>
                <p class="stat-label">Con Stock</p>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-sm-6">
            <div class="stat-card stat-pedidos">
              <div class="stat-icon">🛍️</div>
              <div class="stat-info">
                <h3 class="stat-number">{{ resumen?.pedidos.total || 0 }}</h3>
                <p class="stat-label">Pedidos Totales</p>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-sm-6">
            <div class="stat-card stat-ventas">
              <div class="stat-icon">💰</div>
              <div class="stat-info">
                <h3 class="stat-number">{{ formatearPrecio(resumen?.pedidos.totalVentas || 0) }}</h3>
                <p class="stat-label">Total Ventas</p>
              </div>
            </div>
          </div>
        </div>

        <div class="tabs-container">
          <div class="tabs-header">
            <button 
              :class="['tab-btn', { active: tabActiva === 'productos' }]"
              @click="tabActiva = 'productos'"
            >
              📦 Mis Productos
            </button>
            <button 
              :class="['tab-btn', { active: tabActiva === 'pedidos' }]"
              @click="tabActiva = 'pedidos'"
            >
              🛍️ Mis Pedidos
            </button>
            <button 
              :class="['tab-btn', { active: tabActiva === 'agregar' }]"
              @click="tabActiva = 'agregar'"
            >
              ➕ Agregar Producto
            </button>
          </div>

          <!-- Tab: Mis Productos -->
          <div v-show="tabActiva === 'productos'" class="tab-content">
            <div v-if="productos.length === 0" class="empty-state">
              <div class="empty-icon">📦</div>
              <h3>No tienes productos</h3>
              <p>Comienza agregando tu primer producto</p>
              <button @click="tabActiva = 'agregar'" class="btn-agregar-producto">
                Agregar Producto
              </button>
            </div>

            <div v-else class="productos-grid">
              <div 
                v-for="producto in productos" 
                :key="producto.productoId"
                class="producto-card"
              >
                <div class="producto-imagen-wrapper">
                  <img 
                    :src="producto.imagenUrl || 'https://via.placeholder.com/200'" 
                    :alt="producto.nombre"
                    class="producto-imagen"
                  />
                  <span 
                    :class="['producto-badge', `badge-${getEstadoProducto(producto).color}`]"
                  >
                    {{ getEstadoProducto(producto).texto }}
                  </span>
                </div>
                
                <div class="producto-contenido">
                  <h3 class="producto-nombre">{{ producto.nombre }}</h3>
                  <p class="producto-descripcion">{{ producto.descripcion }}</p>
                  
                  <div class="producto-detalles">
                    <div class="producto-precio">
                      {{ formatearPrecio(producto.precio) }}
                    </div>
                    <div class="producto-stock">
                      Stock: {{ producto.disponibilidad }}
                    </div>
                  </div>

                  <div class="producto-acciones">
                    <button 
                      @click="editarProducto(producto)" 
                      class="btn-editar"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      @click="confirmarEliminar(producto.productoId)" 
                      class="btn-eliminar-producto"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Mis Pedidos -->
          <div v-show="tabActiva === 'pedidos'" class="tab-content">
            <div v-if="pedidos.length === 0" class="empty-state">
              <div class="empty-icon">🛍️</div>
              <h3>No tienes pedidos aún</h3>
              <p>Los pedidos que incluyan tus productos aparecerán aquí</p>
            </div>

            <div v-else class="pedidos-lista">
              <div 
                v-for="pedido in pedidos" 
                :key="pedido.pedidoId"
                class="pedido-card"
              >
                <div class="pedido-header">
                  <div>
                    <h4 class="pedido-numero">Pedido #{{ pedido.pedidoId }}</h4>
                    <p class="pedido-fecha">{{ formatearFecha(pedido.fechaCreacion) }}</p>
                  </div>
                  <span :class="['pedido-estado', `estado-${pedido.estado.toLowerCase()}`]">
                    {{ pedido.estado }}
                  </span>
                </div>

                <div class="pedido-productos">
                  <h5 class="productos-titulo">Tus productos en este pedido:</h5>
                  <div 
                    v-for="producto in pedido.misProductos" 
                    :key="producto.productoId"
                    class="pedido-producto-item"
                  >
                    <span class="producto-nombre-pedido">{{ producto.nombre }}</span>
                    <span class="producto-cantidad">x{{ producto.cantidad }}</span>
                    <span class="producto-subtotal">{{ formatearPrecio(producto.subtotal) }}</span>
                  </div>
                </div>

                <div class="pedido-total">
                  <span>Total de tus productos:</span>
                  <span class="total-valor">
                    {{ formatearPrecio(calcularTotalMisProductos(pedido.misProductos)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Agregar Producto -->
          <div v-show="tabActiva === 'agregar'" class="tab-content">
            <div class="form-card">
              <h3 class="form-titulo">
                {{ productoEditando ? 'Editar Producto' : 'Nuevo Producto' }}
              </h3>
              
              <form @submit.prevent="guardarProducto" class="producto-form">
                <div class="form-group">
                  <label class="form-label">Nombre del Producto</label>
                  <input 
                    v-model="formularioProducto.nombre" 
                    type="text"
                    class="form-input"
                    placeholder="Ej: Pizza Margarita"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Descripción</label>
                  <textarea 
                    v-model="formularioProducto.descripcion" 
                    class="form-textarea"
                    placeholder="Describe tu producto..."
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="form-group">
                      <label class="form-label">Precio</label>
                      <input 
                        v-model.number="formularioProducto.precio" 
                        type="number"
                        step="0.01"
                        class="form-input"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="form-group">
                      <label class="form-label">Stock Disponible</label>
                      <input 
                        v-model.number="formularioProducto.disponibilidad" 
                        type="number"
                        class="form-input"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="form-group">
                      <label class="form-label">Categoría</label>
                      <select 
                        v-model="formularioProducto.categoriaProductoId" 
                        class="form-select"
                        required
                      >
                        <option value="">Seleccionar</option>
                        <option 
                          v-for="categoria in categorias" 
                          :key="categoria.categoriaProductoId"
                          :value="categoria.categoriaProductoId"
                        >
                          {{ categoria.nombre }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Imagen del Producto</label>
                  <input 
                    @change="seleccionarImagen" 
                    type="file"
                    accept="image/*"
                    class="form-input-file"
                  />
                  <p v-if="formularioProducto.imagenUrl" class="imagen-actual">
                    ✅ Imagen cargada
                  </p>
                </div>

                <div class="form-acciones">
                  <button 
                    type="submit" 
                    :disabled="guardando"
                    class="btn-guardar"
                  >
                    {{ guardando ? 'Guardando...' : (productoEditando ? 'Actualizar' : 'Guardar Producto') }}
                  </button>
                  
                  <button 
                    v-if="productoEditando"
                    type="button"
                    @click="cancelarEdicion"
                    class="btn-cancelar"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { VendedorService } from '../../private/services/vendedorService.js';
import { CategoriaProductoService } from '../../private/services/categoriaProductoService.js';
import { Notificar } from '../utils/notificaciones.js';

export default {
  name: 'VendedorDashboard',
  setup() {
    const loading = ref(true);
    const guardando = ref(false);
    const tabActiva = ref('productos');
    
    const resumen = ref(null);
    const negocio = ref(null);
    const productos = ref([]);
    const pedidos = ref([]);
    const categorias = ref([]);
    
    const productoEditando = ref(null);
    const formularioProducto = ref({
      nombre: '',
      descripcion: '',
      precio: 0,
      disponibilidad: 0,
      imagenUrl: '',
      categoriaProductoId: '',
    });

    // Computed
    const negocioEstaAbierto = computed(() => {
      if (!negocio.value) return false;
      return VendedorService.negocioEstaAbierto(negocio.value);
    });

    const horarioFormateado = computed(() => {
      if (!negocio.value) return 'No especificado';
      return VendedorService.formatearHorario(negocio.value);
    });

    // Métodos
    const cargarDatos = async () => {
      try {
        loading.value = true;

        // Cargar resumen, productos, pedidos y categorías
        const [resumenData, productosData, pedidosData, categoriasData] = await Promise.all([
          VendedorService.getResumen(),
          VendedorService.getMisProductos(),
          VendedorService.getMisPedidos(null, 1, 20),
          CategoriaProductoService.getAll(),
        ]);

        resumen.value = resumenData;
        negocio.value = resumenData.negocio;
        productos.value = productosData;
        pedidos.value = pedidosData.data || pedidosData;
        categorias.value = categoriasData;

      } catch (error) {
        console.error('Error al cargar datos:', error);
        Notificar.error('Error al cargar el dashboard');
      } finally {
        loading.value = false;
      }
    };

    const seleccionarImagen = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const response = await VendedorService.subirImagenProducto(file);
        formularioProducto.value.imagenUrl = response.imagenUrl;
        Notificar.exito('Imagen subida correctamente');
      } catch (error) {
        console.error('Error al subir imagen:', error);
        Notificar.error('Error al subir la imagen');
      }
    };

    const guardarProducto = async () => {
      // Validar
      const validacion = VendedorService.validarProducto(formularioProducto.value);
      if (!validacion.valido) {
        Notificar.error(validacion.errores.join(', '));
        return;
      }

      guardando.value = true;

      try {
        if (productoEditando.value) {
          // Actualizar
          await VendedorService.actualizarProducto(
            productoEditando.value.productoId,
            formularioProducto.value
          );
          Notificar.exito('Producto actualizado');
        } else {
          // Crear
          await VendedorService.crearProducto(formularioProducto.value);
          Notificar.exito('Producto creado');
        }

        // Recargar productos
        productos.value = await VendedorService.getMisProductos();
        
        // Resetear formulario
        limpiarFormulario();
        tabActiva.value = 'productos';

      } catch (error) {
        console.error('Error al guardar producto:', error);
        Notificar.error('Error al guardar el producto');
      } finally {
        guardando.value = false;
      }
    };

    const editarProducto = (producto) => {
      productoEditando.value = producto;
      formularioProducto.value = {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        disponibilidad: producto.disponibilidad,
        imagenUrl: producto.imagenUrl,
        categoriaProductoId: producto.categoriaProductoId,
      };
      tabActiva.value = 'agregar';
    };

    const cancelarEdicion = () => {
      limpiarFormulario();
      tabActiva.value = 'productos';
    };

    const limpiarFormulario = () => {
      productoEditando.value = null;
      formularioProducto.value = {
        nombre: '',
        descripcion: '',
        precio: 0,
        disponibilidad: 0,
        imagenUrl: '',
        categoriaProductoId: '',
      };
    };

    const confirmarEliminar = async (productoId) => {
      if (!confirm('¿Estás seguro de eliminar este producto?')) return;

      try {
        await VendedorService.eliminarProducto(productoId);
        productos.value = await VendedorService.getMisProductos();
        Notificar.exito('Producto eliminado');
      } catch (error) {
        console.error('Error al eliminar:', error);
        Notificar.error('Error al eliminar el producto');
      }
    };

    const getEstadoProducto = (producto) => {
      return VendedorService.getEstadoProducto(producto);
    };

    const formatearPrecio = (precio) => {
      return VendedorService.formatearPrecio(precio);
    };

    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const calcularTotalMisProductos = (productos) => {
      return productos.reduce((sum, p) => sum + p.subtotal, 0);
    };

    onMounted(() => {
      cargarDatos();
    });

    return {
      loading,
      guardando,
      tabActiva,
      resumen,
      negocio,
      productos,
      pedidos,
      categorias,
      productoEditando,
      formularioProducto,
      negocioEstaAbierto,
      horarioFormateado,
      seleccionarImagen,
      guardarProducto,
      editarProducto,
      cancelarEdicion,
      confirmarEliminar,
      getEstadoProducto,
      formatearPrecio,
      formatearFecha,
      calcularTotalMisProductos,
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

* {
  box-sizing: border-box;
}

.vendedor-dashboard-background {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  padding-bottom: 60px;
}

/* Hero Banner */
.vendedor-hero-banner {
  background-image: url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200');
  background-size: cover;
  background-position: center;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 3rem;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.8) 100%);
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
}

.hero-title {
  font-family: 'Permanent Marker', sans-serif;
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.4);
}

.hero-subtitle {
  font-size: 1.2rem;
  font-weight: 300;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Container */
.dashboard-container {
  max-width: 1400px;
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

/* Stat Cards */
.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 3rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
}

.stat-productos .stat-icon { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); }
.stat-stock .stat-icon { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); }
.stat-pedidos .stat-icon { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); }
.stat-ventas .stat-icon { background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%); }

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #333;
  margin: 0;
}

.stat-label {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
}

/* Negocio Card */
.negocio-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.negocio-header {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.negocio-titulo {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.negocio-estado {
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.95rem;
}

.estado-abierto {
  background: #4CAF50;
  color: white;
}

.estado-cerrado {
  background: #f44336;
  color: white;
}

.negocio-body {
  padding: 24px 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.negocio-info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  color: #333;
}

.info-icon {
  font-size: 1.3rem;
}

/* Tabs */
.tabs-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 2px solid #f0f0f0;
  background: #fafafa;
}

.tab-btn {
  flex: 1;
  padding: 18px 24px;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  background: #f5f5f5;
  color: #ff9900;
}

.tab-btn.active {
  color: #ff9900;
  border-bottom-color: #ff9900;
  background: white;
}

.tab-content {
  padding: 30px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h3 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.btn-agregar-producto {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 153, 0, 0.3);
}

.btn-agregar-producto:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 153, 0, 0.4);
}

/* Productos Grid */
.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.producto-card {
  background: #fafafa;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.producto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.producto-imagen-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.producto-imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.producto-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
}

.badge-success { background: #4CAF50; }
.badge-warning { background: #FF9800; }
.badge-danger { background: #f44336; }

.producto-contenido {
  padding: 20px;
}

.producto-nombre {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.producto-descripcion {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.producto-detalles {
  display: flex; 
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.producto-precio {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ff9900;
}

.producto-stock {
  font-size: 1rem;
  font-weight: 600;
  color: #666;
}

.producto-acciones {
  display: flex;
  gap: 8px;
}

.btn-editar,
.btn-eliminar-producto {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-editar {
  background: #2196F3;
  color: white;
}

.btn-editar:hover {
  background: #1976D2;
  transform: translateY(-2px);
}

.btn-eliminar-producto {
  background: #f44336;
  color: white;
}

.btn-eliminar-producto:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

/* Pedidos Lista */
.pedidos-lista {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pedido-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
}

.pedido-numero {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.pedido-fecha {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.pedido-estado {
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
}

.estado-pendiente { background: #FF9800; }
.estado-encamino { background: #2196F3; }
.estado-entregado { background: #4CAF50; }
.estado-cancelado { background: #f44336; }

.productos-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.pedido-producto-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
}

.producto-nombre-pedido {
  font-weight: 600;
  color: #333;
}

.producto-cantidad {
  color: #666;
}

.producto-subtotal {
  font-weight: 700;
  color: #ff9900;
}

.pedido-total {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #e0e0e0;
  font-size: 1.2rem;
  font-weight: 700;
}

.total-valor {
  color: #ff9900;
}

/* Formulario */
.form-card {
  max-width: 800px;
  margin: 0 auto;
}

.form-titulo {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.producto-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.form-input,
.form-textarea,
.form-select {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #ff9900;
  box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-input-file {
  padding: 10px;
  border: 2px dashed #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-input-file:hover {
  border-color: #ff9900;
  background: #fff9f0;
}

.imagen-actual {
  color: #4CAF50;
  font-weight: 600;
  margin-top: 8px;
}

.form-acciones {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn-guardar,
.btn-cancelar {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-guardar {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-guardar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(76, 175, 80, 0.4);
}

.btn-guardar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancelar {
  background: #f44336;
  color: white;
}

.btn-cancelar:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .negocio-header {
    flex-direction: column;
    gap: 12px;
  }

  .tabs-header {
    flex-direction: column;
  }

  .productos-grid {
    grid-template-columns: 1fr;
  }
}
</style>