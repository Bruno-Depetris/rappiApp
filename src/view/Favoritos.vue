<template>
  <div class="favoritos-view-background">
    <div class="favoritos-hero-banner">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">❤️ Mis Favoritos</h1>
        <p class="hero-subtitle">Tus productos preferidos en un solo lugar</p>
      </div>
    </div>

    <div class="container favoritos-container">

      <div v-if="loading" class="loading-container text-center">
        <div class="spinner"></div>
        <p class="loading-text">Cargando tus favoritos...</p>
      </div>

      <div v-else-if="productosFavoritos.length === 0" class="favoritos-vacio">
        <div class="empty-icon"></div>
        <h3 class="empty-title">Aún no tienes favoritos</h3>
        <p class="empty-subtitle">Explora nuestros productos y haz clic en el corazón para guardar tus preferidos</p>
        <button @click="irAHome" class="btn-explorar">
          <span>Ver Productos</span>
          <span class="icono-flecha">→</span>
        </button>
      </div>

      <div v-else>
        <div class="favoritos-header">
          <h2 class="favoritos-count">
            <span class="count-badge">{{ productosFavoritos.length }}</span>
            {{ productosFavoritos.length === 1 ? 'Producto' : 'Productos' }} Favorito{{ productosFavoritos.length === 1 ? '' : 's' }}
          </h2>
          <button @click="irAHome" class="btn-seguir-explorando">
            Seguir Explorando
          </button>
        </div>

        <div class="productos-grid">
          <div
            class="producto-wrapper"
            v-for="(producto, index) in productosFavoritos"
            :key="producto.id"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <ProductCard
              :producto="producto"
              :is-favorito="true"
              @ver="verProducto"
              @agregar="agregarAlCarrito"
              @toggle-favorito="handleToggleFavorito"
            />
          </div>
        </div>
      </div>
    </div>

    <ProductModal
      :producto="productoSeleccionado"
      v-model:visible="modalVisible"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFavoritos } from '../composables/useFavoritos';
import { useCarrito } from '../composables/useCarrito';
import { ProductoService } from '../../private/services';
import ProductCard from '../components/ProductCard.vue';
import ProductModal from '../components/ProductModal.vue';
import { Notificar } from '../utils/notificaciones';

export default {
    name: 'FavoritosView',
    components: { ProductCard, ProductModal },
    setup() {
        const router = useRouter();
        const loading = ref(true);
        const productosFavoritos = ref([]);
        const productoSeleccionado = ref(null);
        const modalVisible = ref(false);

        const { favoritos, syncFavoritos, isFavorito, toggleFavorito } = useFavoritos();
        const { agregarAlCarrito } = useCarrito();

        const cargarDetallesFavoritos = async () => {
            await syncFavoritos();
            
            if (favoritos.value.length === 0) {
                productosFavoritos.value = [];
                return;
            }

            try {
                const promesasProductos = favoritos.value.map(id => ProductoService.obtenerPorId(id));
                const productosConDetalles = await Promise.all(promesasProductos);
                
                productosFavoritos.value = productosConDetalles.filter(p => p && p.id);
            } catch (error) {
                Notificar.error('Hubo un error al obtener la información de tus productos.');
            }
        };

        const handleToggleFavorito = async (productoId) => {
            await toggleFavorito(productoId);
            
            if (!isFavorito(productoId)) {
                productosFavoritos.value = productosFavoritos.value.filter(p => p.id !== productoId);
                Notificar.info('Producto eliminado de favoritos', 2);
            }
        };
        
        const verProducto = (producto) => {
            productoSeleccionado.value = producto;
            modalVisible.value = true;
        };
        
        const irAHome = () => {
            router.push({ name: 'Home' });
        };

        onMounted(async () => {
            await cargarDetallesFavoritos();
            loading.value = false;
        });

        return {
            loading,
            productosFavoritos,
            productoSeleccionado,
            modalVisible,
            irAHome,
            verProducto,
            agregarAlCarrito,
            handleToggleFavorito,
        };
    },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap');

* {
  box-sizing: border-box;
}

.favoritos-view-background {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  padding-bottom: 60px;
}

/* Hero Banner */
.favoritos-hero-banner {
  background-image: url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200');
  background-size: cover;
  background-position: center;
  height: 320px;
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
.favoritos-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Loading State */
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

/* Favoritos Vacío */
.favoritos-vacio {
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
  animation: pulse 2s ease-in-out infinite;
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
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
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

.btn-explorar:hover .icono-flecha {
  transform: translateX(5px);
}

.icono-flecha {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

/* Header de Favoritos */
.favoritos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 20px 0;
  animation: fadeInUp 0.5s ease-out;
}

.favoritos-count {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.count-badge {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(255, 153, 0, 0.3);
}

.btn-seguir-explorando {
  background: transparent;
  color: #ff9900;
  border: 2px solid #ff9900;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-seguir-explorando:hover {
  background: #ff9900;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 153, 0, 0.3);
}

/* Grid de Productos */
.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.producto-wrapper {
  animation: fadeInUp 0.5s ease-out backwards;
  transition: transform 0.3s ease;
}

.producto-wrapper:hover {
  transform: translateY(-8px);
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .favoritos-hero-banner {
    height: 250px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .favoritos-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .favoritos-count {
    font-size: 1.5rem;
  }

  .count-badge {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .productos-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 576px) {
  .favoritos-hero-banner {
    height: 200px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .empty-icon {
    font-size: 4rem;
  }

  .empty-title {
    font-size: 1.5rem;
  }

  .empty-subtitle {
    font-size: 1rem;
  }

  .favoritos-count {
    font-size: 1.3rem;
  }

  .productos-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .btn-seguir-explorando {
    width: 100%;
  }
}
</style>