<template>
  <div 
    class="card-producto-container" 
    @mouseenter="flipCard" 
    @mouseleave="flipCard" 
    :class="{ 'flipped': isFlipped }"
  >
    <!-- Cara frontal -->
    <div class="card-face card-front shadow-sm">
      
      <!-- Imagen o placeholder -->
      <div v-if="producto.imagen" class="card-image-wrapper">
        <img :src="producto.imagen" :alt="producto.nombre" class="card-img-top" />
      </div>
      <div v-else class="card-placeholder d-flex justify-content-center align-items-center">
        <i class="bi bi-basket-fill card-placeholder-icon"></i>
      </div>

      <!-- Contenido principal -->
      <div class="card-body text-center">
        <h5 class="card-title">{{ producto.nombre }}</h5>
        <p class="card-text precio">$ {{ producto.precio.toFixed(2) }}</p>
      </div>

      <!-- Botón agregar -->
      <div class="card-footer d-flex justify-content-center">
        <button 
          class="btn btn-warning btn-sm fw-bold text-white" 
          @click.stop="$emit('agregar', producto)"
        >
          <i class="bi bi-cart-plus me-1"></i>Agregar
        </button>
      </div>
    </div>

    <!-- Cara trasera -->
    <div class="card-face card-back d-flex flex-column justify-content-center align-items-center p-3 shadow-sm">
      <h5 class="card-title">Descripción</h5>
      <p class="card-text text-center">{{ producto.descripcion || 'Descripción no disponible.' }}</p>
      <button 
        class="btn btn-sm btn-warning text-white mt-auto" 
        @click.stop="$emit('ver', producto)"
      >
        Ver Más
      </button>
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
  width: 240px;
  height: 330px;
  perspective: 1000px;
  border-radius: 16px;
  position: relative;
}

/* Caras del flip */
.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.8s ease;
  backface-visibility: hidden;
  border-radius: 16px;
  background-color: #fff3e0;
}

/* Estado inicial y volteado */
.card-front {
  transform: rotateY(0deg);
}
.card-back {
  transform: rotateY(180deg);
  background-color: #ff9800;
  color: white;
  padding: 1rem;
}

/* Animación del flip */
.flipped .card-front {
  transform: rotateY(-180deg);
}
.flipped .card-back {
  transform: rotateY(0deg);
}

/* Imagen del producto */
.card-img-top {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 3px solid #ff9800;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

/* Placeholder cuando no hay imagen */
.card-placeholder {
  width: 100%;
  height: 180px;
  background-color: #ffecb3;
  border-bottom: 3px solid #ff9800;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}
.card-placeholder-icon {
  font-size: 3rem;
  color: #ff9800;
}

/* Texto y botones */
.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.precio {
  color: #ff5722;
  font-weight: 700;
  font-size: 1rem;
  margin: 0;
}
.card-footer {
  background-color: #fff3e0;
  border-top: none;
  padding: 0.5rem;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}
</style>
