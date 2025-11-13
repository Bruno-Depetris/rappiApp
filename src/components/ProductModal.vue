<template>
  <Transition name="modal-fade">
    <div v-if="visible" class="modal-backdrop" @click.self="cerrar">
      <Transition name="modal-slide">
        <div v-if="visible" class="modal-content">
          <button class="close-btn" @click="cerrar" aria-label="Cerrar modal">
            <i class="bi bi-x-lg"></i>
          </button>
          
          <div class="modal-header">
            <div class="header-decoration"></div>
            <h3 class="modal-title">{{ producto.nombre }}</h3>
          </div>
          
          <div class="modal-body">
            <div class="image-container">
  <img 
    v-if="producto.imagen"
    :src="producto.imagen" 
    :alt="producto.nombre" 
    class="modal-img"
  >
  <div v-else class="no-image-placeholder">
    <i class="bi bi-image"></i>
    <span>Sin imagen</span>
  </div>
  <div class="image-shine"></div>
</div>
            
            <div class="info-section">
              <div class="precio-container">
                <span class="precio-label">Precio</span>
                <span class="precio-valor">${{ producto.precio.toFixed(2) }}</span>
              </div>
              
              <div class="descripcion-container">
                <h4 class="descripcion-label">
                  <i class="bi bi-info-circle me-2"></i>
                  Descripción
                </h4>
                <p class="descripcion-texto">
                  {{ producto.descripcion || 'No hay descripción disponible para este producto.' }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-action btn-agregar" @click="agregarProducto">
              <i class="bi bi-cart-plus me-2"></i>
              Agregar al Carrito
            </button>
            <button class="btn-action btn-cerrar" @click="cerrar">
              <i class="bi bi-arrow-left me-2"></i>
              Seguir Comprando
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'ProductModal',
  props: {
    producto: Object,
    placeholder: {
      type: String,
      default: 'https://via.placeholder.com/400x300/ff6b35/ffffff?text=Producto'
    },
    visible: Boolean
  },
  emits: ['update:visible', 'agregar'],
  setup(props, { emit }) {
    const cerrar = () => {
      emit('update:visible', false);
    };

    const agregarProducto = () => {
      emit('agregar', props.producto);
      cerrar();
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') cerrar();
    };

    watch(() => props.visible, (val) => {
      if (val) {
        window.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
      } else {
        window.removeEventListener('keydown', handleKey);
        document.body.style.overflow = '';
      }
    });

    return { cerrar, agregarProducto };
  }
};
</script>

<style scoped>
/* Animaciones de entrada */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-slide-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-30px);
}

.modal-slide-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

/* Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

/* Contenedor del modal */
.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #fff9f5 100%);
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  position: relative;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* Botón cerrar */
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #2d3436;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  z-index: 10;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.close-btn:hover {
  background: #ff6b35;
  color: white;
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
}

/* Header */
.modal-header {
  padding: 2rem 2rem 1rem;
  position: relative;
  text-align: center;
}

.header-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #ff6b35 0%, #ff8c42 100%);
  margin: 0 auto 1rem;
  border-radius: 4px;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #2d3436;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.5px;
}

/* Body */
.modal-body {
  padding: 0 2rem 1.5rem;
  overflow-y: auto;
  flex: 1;
}

/* Imagen */
.image-container {
  position: relative;
  width: 100%;
  height: 280px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.modal-img {
  width: 100%;
  height: 100%;
  object-fit: contain;  /* Cambié de 'cover' a 'contain' */
  transition: transform 0.4s ease;
}

.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #636e72;
  gap: 0.75rem;
}

.no-image-placeholder i {
  font-size: 4rem;
  opacity: 0.3;
}

.no-image-placeholder span {
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.image-container:hover .modal-img {
  transform: scale(1.05);
  /* Eliminé: position: absolute; y z-index: 3000; */
}

.image-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

.image-container:hover .image-shine {
  left: 100%;
}

/* Sección de información */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Precio */
.precio-container {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  padding: 1.25rem;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
  position: relative;
  overflow: hidden;
}

.precio-container::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 50%;
  transform: translate(30%, -30%);
}

.precio-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.precio-valor {
  font-size: 2rem;
  font-weight: 900;
  color: white;
  letter-spacing: -1px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Descripción */
.descripcion-container {
  background: white;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 2px solid #f8f9fa;
}

.descripcion-label {
  font-size: 1rem;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.descripcion-texto {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #636e72;
  margin: 0;
  text-align: left;
}

/* Footer */
.modal-footer {
  padding: 1.5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: linear-gradient(to top, rgba(255, 107, 53, 0.05), transparent);
}

.btn-action {
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.btn-action::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.5s ease, height 0.5s ease;
}

.btn-action:hover::before {
  width: 300px;
  height: 300px;
}

.btn-agregar {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.btn-agregar:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.5);
}

.btn-agregar:active {
  transform: translateY(0);
}

.btn-cerrar {
  background: white;
  color: #636e72;
  border: 2px solid #e9ecef;
}

.btn-cerrar:hover {
  background: #f8f9fa;
  color: #2d3436;
  border-color: #dfe6e9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-action i {
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
}

/* Scrollbar personalizado */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #ff5722 0%, #ff7b32 100%);
}

/* Responsive */
@media (max-width: 576px) {
  .modal-content {
    border-radius: 20px;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .image-container {
    height: 220px;
  }

  .precio-valor {
    font-size: 1.75rem;
  }

  .btn-action {
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
  }
}
</style>