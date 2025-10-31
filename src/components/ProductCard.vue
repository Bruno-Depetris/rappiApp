<template>
  <div 
    class="card-producto-container" 
    @mouseenter="flipCard" 
    @mouseleave="flipCard" 
    :class="{ 'flipped': isFlipped }"
  >
    <!-- Cara frontal -->
    <div class="card-face card-front">
      
      <!-- Imagen o placeholder -->
      <div v-if="producto.imagen" class="card-image-wrapper">
        <img :src="producto.imagen" :alt="producto.nombre" class="card-img-top" />
        <div class="image-overlay"></div>
      </div>
      <div v-else class="card-placeholder">
        <i class="bi bi-basket-fill card-placeholder-icon"></i>
      </div>

      <!-- Contenido principal -->
      <div class="card-body">
        <h5 class="card-title">{{ producto.nombre }}</h5>
        <p class="card-text precio">$ {{ producto.precio.toFixed(2) }}</p>
        <div class="card-badge">Nuevo</div>
      </div>
    </div>

    <!-- Cara trasera -->
    <div class="card-face card-back">
      <div class="card-back-content">
        <h5 class="back-title">Descripción</h5>
        <p class="back-description">{{ producto.descripcion || 'Descripción no disponible.' }}</p>
        
        <div class="back-actions">
          <button 
            class="btn-ver-mas" 
            @click.stop="$emit('ver', producto)"
          >
            <i class="bi bi-eye me-1"></i>
            Ver Más
          </button>
          
          <button 
            class="btn-agregar" 
            @click.stop="$emit('agregar', producto)"
          >
            <i class="bi bi-cart-plus me-1"></i>
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductCard",
  props: {
    producto: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isFlipped: false
    };
  },
  methods: {
    flipCard() {
      this.isFlipped = !this.isFlipped;
    }
  }
};
</script>

<style scoped>
/* Contenedor principal con efecto flip */
.card-producto-container {
  width: 260px;
  height: 360px;
  perspective: 1000px;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.card-producto-container:hover {
  transform: translateY(-8px);
}

/* Caras del flip */
.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  backface-visibility: hidden;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-front {
  transform: rotateY(0deg);
  background: linear-gradient(135deg, #ffffff 0%, #fff9f0 100%);
}

.card-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animación del flip */
.flipped .card-front {
  transform: rotateY(-180deg);
}

.flipped .card-back {
  transform: rotateY(0deg);
}

/* Imagen del producto */
.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  padding: 1rem;
  background: white;
  transition: transform 0.4s ease;
}

.card-producto-container:hover .card-img-top {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to top, rgba(255, 107, 53, 0.3), transparent);
  pointer-events: none;
}

/* Placeholder cuando no hay imagen */
.card-placeholder {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #ffe5d9 0%, #ffd4c1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.card-placeholder::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent);
}

.card-placeholder-icon {
  font-size: 4rem;
  color: #ff6b35;
  opacity: 0.7;
  z-index: 1;
}

/* Body de la tarjeta */
.card-body {
  padding: 1.5rem;
  position: relative;
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 0.75rem;
  text-align: center;
  line-height: 1.3;
  max-height: 2.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.precio {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.5px;
}

.card-badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* Cara trasera */
.card-back-content {
  padding: 2rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.back-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.back-description {
  font-size: 0.95rem;
  line-height: 1.6;
  text-align: center;
  opacity: 0.95;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
}

.back-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-ver-mas,
.btn-agregar {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-ver-mas {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-ver-mas:hover {
  background: white;
  color: #ff6b35;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.btn-agregar {
  background: white;
  color: #ff6b35;
  font-weight: 700;
}

.btn-agregar:hover {
  background: #2d3436;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-ver-mas i,
.btn-agregar i {
  font-size: 1.1rem;
}

/* Animaciones adicionales */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-body > * {
  animation: fadeIn 0.5s ease backwards;
}

.card-title {
  animation-delay: 0.1s;
}

.precio {
  animation-delay: 0.2s;
}

.card-badge {
  animation-delay: 0.3s;
}

/* Responsive */
@media (max-width: 768px) {
  .card-producto-container {
    width: 100%;
    max-width: 280px;
    height: 380px;
  }
}
</style>