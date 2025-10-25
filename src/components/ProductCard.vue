<template>
  <div class="card-producto-container" @mouseenter="flipCard" @mouseleave="flipCard" :class="{ 'flipped': isFlipped }">
    
    <div class="card-face card-front shadow-sm">
      
      <img :src="producto.imagen || placeholder" :alt="producto.nombre" class="card-img-top">

      <div class="card-body text-center">
        <h5 class="card-title">{{ producto.nombre }}</h5>
        <p class="card-text precio">$ {{ producto.precio.toFixed(2) }}</p>
      </div>
      
      <div class="card-footer d-flex justify-content-center">
        <button class="btn btn-warning btn-sm fw-bold text-white" @click.stop="$emit('agregar', producto)">
          <i class="bi bi-cart-plus me-1"></i>Agregar
        </button>
      </div>
      
    </div>

    <div class="card-face card-back d-flex flex-column justify-content-center align-items-center p-3 shadow-sm">
        <h5 class="card-title">Descripción</h5>
        <p class="card-text text-center">{{ producto.descripcion || 'Descripción no disponible.' }}</p>
        <button class="btn btn-sm btn-info text-white mt-auto" @click.stop="$emit('ver', producto)">Ver Más</button>
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
    },
    placeholder: {
      type: String,
      default: "https://via.placeholder.com/240x200"
    }
  },
  data() {
    return {
      isFlipped: false, // <-- Nueva propiedad
    };
  },
  methods: {
    flipCard() {
      this.isFlipped = !this.isFlipped; // <-- Nuevo método
    }
  }
};
</script>

<style scoped>

/* 1. Contenedor del Flip */
.card-producto-container {
  width: 240px;
  height: 330px; /* Alto fijo para que las caras coincidan */
  perspective: 1000px; /* Define la distancia de la vista 3D */
  border-radius: 16px;
}

/* 2. El elemento que voltea */
.card-front, .card-back {
  /* Posicionamiento y dimensiones */
  position: absolute;
  width: 100%;
  height: 100%;
  
  /* Animación */
  transition: transform 0.8s ease;
  backface-visibility: hidden; /* Esto oculta la cara trasera mientras está de frente */
  
  /* Estilos generales */
  border-radius: 16px;
  background-color: #fff3e0;
}

/* 3. Estilo del Frente */
.card-front {
  transform: rotateY(0deg); /* Estado inicial (visible) */
}

/* 4. Estilo de la Espalda */
.card-back {
  /* Voltea 180 grados inicialmente para que quede oculto */
  transform: rotateY(180deg);
  background-color: #ff9800; /* Fondo diferente para la descripción */
  color: white;
  padding: 1rem;
}

/* 5. Estado Volteado (CLAVE) */
.flipped .card-front {
  transform: rotateY(-180deg);
}

.flipped .card-back {
  transform: rotateY(0deg); /* Vuelve a 0 grados, quedando visible */
}

/* Estilos de Contenido (Ajustes) */
.card-img-top {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 3px solid #ff9800;
  border-top-left-radius: 16px; /* Asegurar que la imagen respete el radio */
  border-top-right-radius: 16px;
}

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