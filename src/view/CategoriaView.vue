<template>
  <div class="categoria-view">

    <div class="categoria-hero" :style="{ backgroundImage: `url(${categoriaImagen})` }">
      <div class="hero-overlay">
        <div class="container">
          <h1 class="categoria-titulo">{{ categoriaNombre }}</h1>
        </div>
      </div>
    </div>

    <div class="container productos-container">

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">Cargando productos deliciosos...</p>
      </div>

      <div v-else-if="productos.length === 0" class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>No hay productos disponibles</h3>
        <p>Esta categoría está temporalmente vacía</p>
      </div>

      <div v-else class="productos-grid">
        <div
          class="producto-wrapper"
          v-for="(producto, index) in productos"
          :key="producto.id"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <ProductCard
            :producto="producto"
            @ver="verProducto"
            @agregar="agregarAlCarrito"
          />
        </div>
      </div>
    </div>
  </div>

  <ProductModal
    :producto="productoSeleccionado"
    v-model:visible="modalVisible"
  />
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';
import ProductModal from '../components/ProductModal.vue';
import { ProductoService } from '../../private/services';
import { CategoriaProductoService } from '../../private/services';
import { Notificar } from "../utils/notificaciones";

import catPizzaHeader from '../assets/imagenHeaderCategoria/catPizzaHeader.jpg';
import catHamburguesaHeader from '../assets/imagenHeaderCategoria/catHamburguesaHeader.jpg';
import catGaseosaHeader from '../assets/imagenHeaderCategoria/catGaseosaHeader.jpg';
import catHeladoHeader from '../assets/imagenHeaderCategoria/catHeladoHeader.jpg';
import catEnsaladaHeader from '../assets/imagenHeaderCategoria/catEnsaladaHeader.jpg';

export default {
  name: 'CategoriaView',
  components: { ProductCard, ProductModal },
  setup() {
    const route = useRoute();

    const productos = ref([]);
    const loading = ref(true);
    const categoriaNombre = ref('');
    const categoriaImagen = ref('');
    const productoSeleccionado = ref(null);
    const modalVisible = ref(false);

    const categoriasInfo = {
      1: { nombre: 'Pizzas', imagen: catPizzaHeader },
      2: { nombre: 'Hamburguesas', imagen: catHamburguesaHeader },
      3: { nombre: 'Bebidas', imagen: catGaseosaHeader },
      4: { nombre: 'Postres', imagen: catHeladoHeader },
      5: { nombre: 'Ensaladas', imagen: catEnsaladaHeader }
    };

    const cargarProductos = async () => {
      loading.value = true;
      try {
        const categoriaId = parseInt(route.params.id);

        const info = categoriasInfo[categoriaId];
        categoriaNombre.value = info?.nombre || 'Categoría';
        categoriaImagen.value = info?.imagen || 'https://via.placeholder.com/600x200';

        const productosPorCategoria = await CategoriaProductoService.getProductosPorCategoria(categoriaId);
        console.log("Productos filtrados:", productosPorCategoria); // <-- Revisa la consola (F12)
        productos.value = productosPorCategoria.map(p => ({
          id: p.productoId,
          nombre: p.nombre,
          precio: p.precio,
          descripcion: p.descripcion,
          disponibilidad: p.disponibilidad,
          imagen: p.imagenes?.[0] || 'https://via.placeholder.com/150'
        }));
      } catch (error) {
        Notificar.error('No se pudieron cargar los productos de esta categoría');
      } finally {
        loading.value = false;
      }
    };

    const verProducto = (producto) => {
      productoSeleccionado.value = producto;
      modalVisible.value = true;
    };

    const agregarAlCarrito = (producto) => {
      Notificar.exito(`"${producto.nombre}" agregado al carrito`);
    };

    onMounted(cargarProductos);
    watch(() => route.params.id, cargarProductos);

    return {
      productos,
      loading,
      categoriaNombre,
      categoriaImagen,
      productoSeleccionado,
      modalVisible,
      verProducto,
      agregarAlCarrito
    };
  }
};
</script>

<style scoped>
.categoria-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

/* Hero Section */
.categoria-hero {
  position: relative;
  height: 320px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.categoria-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.hero-overlay {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 1;
}

.categoria-titulo {
  color: white;
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.4);
  letter-spacing: -0.5px;
  animation: fadeInUp 0.6s ease-out;
}

.categoria-badge {
  margin-top: 1rem;
  animation: fadeInUp 0.8s ease-out;
}

.categoria-badge span {
  display: inline-block;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

/* Productos Container */
.productos-container {
  padding: 3rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 5rem 0;
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #666;
  font-size: 1.1rem;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  animation: fadeIn 0.5s ease-out;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-state h3 {
  color: #333;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  font-size: 1.1rem;
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
}

/* Responsive */
@media (max-width: 768px) {
  .categoria-hero {
    height: 250px;
  }

  .categoria-titulo {
    font-size: 2.5rem;
  }

  .productos-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  .productos-container {
    padding: 2rem 1rem;
  }
}

@media (max-width: 576px) {
  .categoria-hero {
    height: 200px;
  }

  .categoria-titulo {
    font-size: 2rem;
  }

  .categoria-badge span {
    font-size: 0.85rem;
    padding: 0.4rem 1.2rem;
  }

  .productos-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}

/* Animaciones */
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Hover effects para el grid */
.producto-wrapper {
  transition: transform 0.3s ease;
}

.producto-wrapper:hover {
  transform: translateY(-5px);
}
</style>