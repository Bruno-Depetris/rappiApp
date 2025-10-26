<template>
  <div v-if="visible" class="modal-backdrop" @click.self="cerrar">
    <div class="modal-content">
      <button class="close-btn" @click="cerrar">&times;</button>
      <h3>{{ producto.nombre }}</h3>
      <img :src="producto.imagen || placeholder" alt="Imagen del producto" class="modal-img">
      <p><strong>Precio:</strong> ${{ producto.precio.toFixed(2) }}</p>
      <p><strong>Descripción:</strong> {{ producto.descripcion || 'No disponible' }}</p>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'ProductModal',
  props: {
    producto: Object,
    placeholder: {
      type: String,
      default: 'https://via.placeholder.com/240x200'
    },
    visible: Boolean
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const cerrar = () => emit('update:visible', false);

    // Opcional: cerrar con Escape
    const handleKey = (e) => {
      if (e.key === 'Escape') cerrar();
    };

    watch(() => props.visible, (val) => {
      if (val) window.addEventListener('keydown', handleKey);
      else window.removeEventListener('keydown', handleKey);
    });

    return { cerrar };
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  font-size: 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
}

.modal-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  margin-bottom: 1rem;
  border-radius: 8px;
}
</style>
