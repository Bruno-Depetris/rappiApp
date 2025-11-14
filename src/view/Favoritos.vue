<template>
  <div class="favoritos">
    <h1 class="page-title">Mis Favoritos</h1>

    <!-- Filtros -->
    <div class="filters">
      <button 
        @click="filtroActivo = 'todos'"
        class="filter-btn"
        :class="{ active: filtroActivo === 'todos' }"
      >
        Todos ({{ totalFavoritos }})
      </button>
      <button 
        @click="filtroActivo = 'productos'"
        class="filter-btn"
        :class="{ active: filtroActivo === 'productos' }"
      >
        Productos ({{ productosFavoritos.length }})
      </button>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="loading">
      <p>Cargando favoritos...</p>
    </div>

    <!-- Lista de productos favoritos -->
    <div v-else-if="favoritosFiltrados.length > 0" class="favoritos-grid">
      <div 
        v-for="favorito in favoritosFiltrados" 
        :key="favorito.id" 
        class="favorito-card"
      >
        <div class="producto-image">
          <img 
            :src="favorito.producto.imagenes || '/default-product.jpg'" 
            :alt="favorito.producto.nombre"
          >
        </div>
        
        <div class="producto-info">
          <h3>{{ favorito.producto.nombre }}</h3>
          <p class="precio">${{ favorito.producto.precio }}</p>
          <p class="descripcion">{{ favorito.producto.descripcion }}</p>
          <p class="vendedor">{{ favorito.producto.vendedor?.nombre || 'Vendedor' }}</p>
          <p class="fecha-favorito">
            Agregado: {{ formatearFecha(favorito.fechaCreacion) }}
          </p>
        </div>
        
        <div class="producto-actions">
          <button 
            @click="removerDeFavoritos(favorito)"
            class="btn-remove"
            title="Remover de favoritos"
          >
            <span class="material-icons">favorite</span>
          </button>
          
          <button 
            @click="agregarAlCarrito(favorito.producto)" 
            class="btn-add-cart"
            :disabled="favorito.producto.disponibilidad === 0"
          >
            <span class="material-icons">add_shopping_cart</span>
            {{ favorito.producto.disponibilidad === 0 ? 'Sin stock' : 'Agregar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <span class="material-icons">favorite_border</span>
      <h3>No tienes favoritos{{ filtroActivo !== 'todos' ? ' de ' + filtroActivo : '' }}</h3>
      <p>¡Explora nuestros productos y marca tus favoritos para encontrarlos fácilmente!</p>
      <button @click="$router.push('/')" class="btn btn-primary">
        Explorar productos
      </button>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal" @click.stop>
        <div class="modal-content">
          <h3>¿Remover de favoritos?</h3>
          <p>¿Estás seguro de que quieres remover "{{ productoParaRemover?.producto?.nombre }}" de tus favoritos?</p>
          <div class="modal-actions">
            <button @click="cerrarModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button @click="confirmarRemover" class="btn btn-primary">
              Sí, remover
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FavoritoService } from '../../private/services/favoritoService.js'
import { CarritoService } from '../../private/services/carritoService.js'
import { mostrarNotificacion } from '../utils/notificaciones.js'

export default {
  name: 'Favoritos',
  data() {
    return {
      productosFavoritos: [],
      cargando: true,
      filtroActivo: 'todos',
      mostrarModal: false,
      productoParaRemover: null
    }
  },
  computed: {
    totalFavoritos() {
      return this.productosFavoritos.length
    },
    favoritosFiltrados() {
      if (this.filtroActivo === 'todos') {
        return this.productosFavoritos
      }
      // En el futuro se pueden agregar más filtros
      return this.productosFavoritos
    }
  },
  async mounted() {
    await this.cargarFavoritos()
  },
  methods: {
    async cargarFavoritos() {
      try {
        this.cargando = true
        
        // Obtener usuario actual
        const token = localStorage.getItem('rappi_token')
        if (!token) {
          this.$router.push('/login')
          return
        }
        
        const usuario = JSON.parse(localStorage.getItem('rappi_user'))
        
        // Cargar favoritos
        this.productosFavoritos = await FavoritoService.getProductosFavoritos(usuario.id)
        
      } catch (error) {
        console.error('Error al cargar favoritos:', error)
        mostrarNotificacion('Error al cargar los favoritos', 'error')
      } finally {
        this.cargando = false
      }
    },

    async agregarAlCarrito(producto) {
      try {
        if (producto.disponibilidad === 0) {
          mostrarNotificacion('Producto sin stock', 'warning')
          return
        }

        await CarritoService.agregarProducto(producto.id, 1)
        mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success')
      } catch (error) {
        console.error('Error al agregar al carrito:', error)
        mostrarNotificacion('Error al agregar al carrito', 'error')
      }
    },

    removerDeFavoritos(favorito) {
      this.productoParaRemover = favorito
      this.mostrarModal = true
    },

    async confirmarRemover() {
      try {
        const usuario = JSON.parse(localStorage.getItem('rappi_user'))
        
        await FavoritoService.eliminarDeFavoritos(
          usuario.id, 
          this.productoParaRemover.producto.id
        )
        
        // Actualizar lista local
        this.productosFavoritos = this.productosFavoritos.filter(
          f => f.id !== this.productoParaRemover.id
        )
        
        mostrarNotificacion('Producto removido de favoritos', 'success')
        this.cerrarModal()
      } catch (error) {
        console.error('Error al remover de favoritos:', error)
        mostrarNotificacion('Error al remover de favoritos', 'error')
      }
    },

    cerrarModal() {
      this.mostrarModal = false
      this.productoParaRemover = null
    },

    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.favoritos {
  max-width: 1200px;
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

.favoritos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.favorito-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.favorito-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.producto-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.producto-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.producto-info {
  padding: 20px;
}

.producto-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
}

.precio {
  font-size: 1.4rem;
  font-weight: bold;
  color: #e74c3c;
  margin: 5px 0;
}

.descripcion {
  color: #666;
  margin: 8px 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.vendedor {
  color: #888;
  font-size: 0.85rem;
  margin: 5px 0;
}

.fecha-favorito {
  color: #999;
  font-size: 0.8rem;
  margin: 8px 0 0 0;
  font-style: italic;
}

.producto-actions {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  border-top: 1px solid #f5f5f5;
}

.btn-remove {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background-color: #ffebee;
}

.btn-remove .material-icons {
  font-size: 1.2rem;
}

.btn-add-cart {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.btn-add-cart:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-add-cart:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-add-cart .material-icons {
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state .material-icons {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #333;
}

.empty-state p {
  margin-bottom: 20px;
  line-height: 1.6;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content {
  padding: 30px;
  text-align: center;
}

.modal-content h3 {
  margin-bottom: 15px;
  color: #333;
}

.modal-content p {
  margin-bottom: 20px;
  color: #666;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .favoritos {
    padding: 10px;
  }
  
  .favoritos-grid {
    grid-template-columns: 1fr;
  }
  
  .producto-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-add-cart {
    width: 100%;
    justify-content: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>