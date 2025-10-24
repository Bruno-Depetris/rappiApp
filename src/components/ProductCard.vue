<template>
  <div class="card-producto shadow-sm">
    <!-- Imagen -->
    <img :src="producto.imagen || placeholder" :alt="producto.nombre" class="card-img-top">

    <!-- Contenido -->
    <div class="card-body text-center">
      <h5 class="card-title">{{ producto.nombre }}</h5>
      <p class="card-text precio">$ {{ producto.precio.toFixed(2) }}</p>
    </div>

    <!-- Botón Agregar -->
    <div class="card-footer d-flex justify-content-center">
      <button class="btn btn-warning btn-sm fw-bold text-white" @click="$emit('agregar', producto)">
        <i class="bi bi-cart-plus me-1"></i>Agregar
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
    },
    placeholder: {
      type: String,
      default: "https://via.placeholder.com/240x200"
    }
  }
};
</script>

<style scoped>
.card-producto {
  width: 240px;
  border-radius: 16px;
  overflow: hidden;
  background-color: #fff3e0; /* fondo cálido tipo comida */
  transition: transform 0.3s, box-shadow 0.3s;
}

.card-producto:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 25px rgba(0,0,0,0.2);
}

.card-img-top {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 3px solid #ff9800;
}

.card-body {
  padding: 0.75rem;
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
}

.btn-warning {
  background-color: #ff9800;
  border: none;
  transition: all 0.3s;
}

.btn-warning:hover {
  background-color: #fb8c00;
  transform: scale(1.05);
}
</style>
