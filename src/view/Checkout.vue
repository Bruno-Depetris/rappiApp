<template>
  <div class="checkout">
    <h1 class="checkout-title">Checkout</h1>
    
    <div class="cart-summary">
      <h2>Resumen de tu pedido</h2>
      <div v-if="carrito && carrito.items && carrito.items.length > 0">
        <div v-for="item in carrito.items" :key="item.id" class="cart-item">
          <img :src="item.imagen || '/default-product.jpg'" :alt="item.nombre" class="item-image">
          <div class="item-details">
            <h3>{{ item.nombre }}</h3>
            <p>Cantidad: {{ item.cantidad }}</p>
            <p class="item-price">${{ (item.precioUnitario * item.cantidad).toFixed(2) }}</p>
          </div>
        </div>
        
        <div class="totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>${{ carrito.subtotal.toFixed(2) }}</span>
          </div>
          <div class="total-line" v-if="carrito.totalDescuentos > 0">
            <span>Descuentos:</span>
            <span class="discount">-${{ carrito.totalDescuentos.toFixed(2) }}</span>
          </div>
          <div class="total-line">
            <span>Costo de envío:</span>
            <span>${{ costoEnvio.toFixed(2) }}</span>
          </div>
          <div class="total-line total-final">
            <span>Total:</span>
            <span>${{ totalFinal.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-cart">
        <p>Tu carrito está vacío</p>
        <button @click="$router.push('/productos')" class="btn-primary">
          Agregar productos
        </button>
      </div>
    </div>

    <div v-if="carrito && carrito.items && carrito.items.length > 0" class="checkout-form">
      <form @submit.prevent="procesarPedido">
        <div class="form-section">
          <h3>Dirección de entrega</h3>
          <div class="form-group">
            <label for="direccion">Dirección completa:</label>
            <input 
              type="text" 
              id="direccion" 
              v-model="formulario.direccion" 
              placeholder="Ej: Calle 123 #45-67, Bogotá"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="referencia">Referencias (opcional):</label>
            <input 
              type="text" 
              id="referencia" 
              v-model="formulario.referencia" 
              placeholder="Ej: Casa azul, portón negro"
            >
          </div>
        </div>

        <div class="form-section">
          <h3>Método de pago</h3>
          <div class="payment-methods">
            <div 
              v-for="metodo in metodosPago" 
              :key="metodo.id" 
              class="payment-option"
              :class="{ active: formulario.metodoPagoId === metodo.id }"
              @click="formulario.metodoPagoId = metodo.id"
            >
              <input 
                type="radio" 
                :id="`pago-${metodo.id}`" 
                :value="metodo.id" 
                v-model="formulario.metodoPagoId"
              >
              <label :for="`pago-${metodo.id}`">
                {{ metodo.metodo }}
              </label>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Información adicional</h3>
          <div class="form-group">
            <label for="notas">Notas para el repartidor (opcional):</label>
            <textarea 
              id="notas" 
              v-model="formulario.notas" 
              placeholder="Instrucciones especiales para la entrega"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$router.go(-1)" class="btn-secondary">
            Volver
          </button>
          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="procesandoPedido || !formularioValido"
          >
            {{ procesandoPedido ? 'Procesando...' : `Confirmar pedido - $${totalFinal.toFixed(2)}` }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal" @click.stop>
        <div class="modal-content">
          <h3>{{ modalTitulo }}</h3>
          <p>{{ modalMensaje }}</p>
          <div class="modal-actions">
            <button @click="cerrarModal" class="btn-primary">
              {{ modalError ? 'Cerrar' : 'Ver mi pedido' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CarritoService } from '../../private/services/carritoService.js'
import { PedidoService } from '../../private/services/pedidoService.js'
import { mostrarNotificacion } from '../utils/notificaciones.js'

export default {
  name: 'Checkout',
  data() {
    return {
      carrito: null,
      metodosPago: [],
      costoEnvio: 5000, // Costo fijo de envío
      procesandoPedido: false,
      mostrarModal: false,
      modalTitulo: '',
      modalMensaje: '',
      modalError: false,
      formulario: {
        direccion: '',
        referencia: '',
        metodoPagoId: null,
        notas: ''
      }
    }
  },
  computed: {
    totalFinal() {
      if (!this.carrito) return 0
      return (this.carrito.total || 0) + this.costoEnvio
    },
    formularioValido() {
      return this.formulario.direccion.trim() !== '' && 
             this.formulario.metodoPagoId !== null
    }
  },
  async mounted() {
    await this.cargarDatos()
  },
  methods: {
    async cargarDatos() {
      try {
        this.carrito = await CarritoService.getMiCarrito()
        
        this.metodosPago = await PedidoService.getMetodosPago()
        
        if (!this.carrito || !this.carrito.items || this.carrito.items.length === 0) {
          mostrarNotificacion('Tu carrito está vacío', 'warning')
          this.$router.push('/productos')
          return
        }
        
      } catch (error) {
        console.error('Error al cargar datos:', error)
        mostrarNotificacion('Error al cargar la información', 'error')
      }
    },

    async procesarPedido() {
      if (!this.formularioValido) {
        mostrarNotificacion('Por favor completa todos los campos requeridos', 'warning')
        return
      }

      this.procesandoPedido = true

      try {
        const direccionCompleta = this.formulario.referencia 
          ? `${this.formulario.direccion} - ${this.formulario.referencia}`
          : this.formulario.direccion

        const pedidoCreado = await PedidoService.crearPedidoDesdeCarrito(
          this.carrito.id,
          this.formulario.metodoPagoId,
          direccionCompleta,
          this.costoEnvio
        )

        console.log('✅ Pedido creado exitosamente:', pedidoCreado);

        this.modalTitulo = '¡Pedido confirmado!'
        this.modalMensaje = `Tu pedido #${pedidoCreado.id} ha sido creado exitosamente. En unos minutos recibirás la confirmación y te asignaremos un repartidor.`
        this.modalError = false
        this.mostrarModal = true

        mostrarNotificacion('Pedido creado exitosamente', 'success')

        // Emitir evento inmediatamente para actualizar carrito
        window.dispatchEvent(new CustomEvent('carritoActualizado'));

      } catch (error) {
        console.error('Error al procesar pedido:', error)
        
        this.modalTitulo = 'Error al procesar pedido'
        this.modalMensaje = error.message || 'Hubo un problema al procesar tu pedido. Por favor intenta nuevamente.'
        this.modalError = true
        this.mostrarModal = true
        
        mostrarNotificacion('Error al procesar el pedido', 'error')
      } finally {
        this.procesandoPedido = false
      }
    },

    cerrarModal() {
      this.mostrarModal = false
      if (!this.modalError) {
        // Emitir evento para que otros componentes sepan que el carrito fue vaciado
        window.dispatchEvent(new CustomEvent('carritoActualizado'));
        this.$router.push('/mis-pedidos')
      }
    }
  }
}
</script>

<style scoped>
.checkout {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
}

.cart-summary {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.cart-summary h2 {
  margin-bottom: 20px;
  color: #333;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 15px;
}

.item-details h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.item-details p {
  margin: 2px 0;
  color: #666;
}

.item-price {
  font-weight: bold;
  color: #e74c3c !important;
}

.totals {
  border-top: 2px solid #eee;
  padding-top: 15px;
  margin-top: 15px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #666;
}

.total-final {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  border-top: 1px solid #ddd;
  padding-top: 8px;
  margin-top: 8px;
}

.discount {
  color: #27ae60;
}

.empty-cart {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.checkout-form {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1);
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.payment-option {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-option:hover {
  border-color: #e74c3c;
  background-color: #fff5f5;
}

.payment-option.active {
  border-color: #e74c3c;
  background-color: #fff5f5;
}

.payment-option input {
  display: none;
}

.payment-option label {
  cursor: pointer;
  font-weight: 500;
  color: #333;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 30px;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background-color: #e74c3c;
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-primary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
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
  max-width: 500px;
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
}

/* Responsive */
@media (max-width: 768px) {
  .checkout {
    padding: 10px;
  }
  
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .item-image {
    align-self: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .payment-methods {
    grid-template-columns: 1fr;
  }
}
</style>