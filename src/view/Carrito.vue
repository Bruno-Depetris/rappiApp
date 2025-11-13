<template>
  <div class="carrito-view-background">
    <div class="carrito-hero-banner">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">Tu Carrito</h1>
        <p class="hero-subtitle">Revisa tus productos antes de finalizar tu pedido</p>
      </div>
    </div>

    <div class="container carrito-container">
      <div v-if="loading" class="loading-container text-center">
        <div class="spinner"></div>
        <p class="loading-text">Cargando tu carrito...</p>
      </div>

      <div v-else-if="carritoCount === 0" class="carrito-vacio">
        <div class="empty-icon">🛒</div>
        <h3 class="empty-title">¡Tu carrito está vacío!</h3>
        <p class="empty-subtitle">Agrega algunos productos deliciosos para empezar</p>
        <button @click="irAHome" class="btn-explorar">
          <span>Ver Productos</span>
          <span class="icono-flecha">→</span>
        </button>
      </div>

      <div v-else class="row g-4">
        <div class="col-lg-8">
          <div class="productos-lista">
            <div class="producto-item simple" v-for="item in carritoItems" :key="item.carritoItemId">
              <div class="producto-info">
                <h5 class="producto-nombre">{{ item.nombre || 'Producto Desconocido' }}</h5>
                <div class="producto-precio-unitario">
                  ${{ item.precioUnitario.toFixed(2) }} c/u
                </div>
              </div>

              <div class="producto-acciones">
                <div class="cantidad-control">
                  <button class="btn-cantidad" @click="cambiarCantidad(item.carritoItemId, -1)"
                    :disabled="item.cantidad <= 1 || isDeleting">
                    -
                  </button>
                  <span class="cantidad-valor">{{ item.cantidad }}</span>
                  <button class="btn-cantidad" @click="cambiarCantidad(item.carritoItemId, 1)" :disabled="isDeleting">
                    +
                  </button>
                </div>

                <div class="producto-subtotal">
                  <span class="subtotal-label me-2 d-lg-none">Subtotal:</span>
                  <span class="subtotal-valor">${{ (item.precioUnitario * item.cantidad).toFixed(2) }}</span>
                </div>

                <button class="btn-eliminar" @click="eliminarItem(item.carritoItemId)" :disabled="isDeleting">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="resumen-pedido">
            <div class="resumen-header">
              <h4 class="resumen-titulo">Resumen del Pedido</h4>
            </div>

            <div class="resumen-body">
              <div class="resumen-linea">
                <span>Subtotal ({{ carritoCount }} items)</span>
                <span class="resumen-valor">${{ carritoTotal.toFixed(2) }}</span>
              </div>

              <div class="resumen-linea">
                <span>Envío</span>
                <span class="resumen-valor envio-gratis">GRATIS</span>
              </div>

              <hr class="resumen-divider" />

              <div class="resumen-total">
                <span class="total-label">Total Final</span>
                <span class="total-valor">${{ carritoTotal.toFixed(2) }}</span>
              </div>
              <div class="cupon-section">
                <label class="cupon-label">Cupón de Descuento</label>
                <div class="cupon-input-group">
                  <input v-model="codigoCupon" type="text" class="cupon-input"
                    placeholder="Ingresa tu código de cupón" />
                  <button class="cupon-btn" @click="aplicarCupon">
                    Aplicar
                  </button>
                </div>
              </div>
              <div class="metodo-pago-selector">
                <label class="metodo-label">Método de Pago</label>
                <select v-model="metodoPagoSeleccionado" class="metodo-select" :disabled="metodosPago.length === 0">
                  <option v-if="metodosPago.length === 0" :value="null">
                    Cargando métodos...
                  </option>
                  <option v-for="metodo in metodosPago" :key="metodo.metodoId" :value="metodo.metodoId">
                    {{ metodo.metodo }}
                  </option>
                </select>
              </div>

              <button class="btn-finalizar-compra" @click="finalizarCompra"
                :disabled="procesando || carritoCount === 0">
                <span v-if="procesando">Procesando...</span>
                <span v-else>
                  <span>Finalizar Compra</span>
                  <span class="icono-flecha">→</span>
                </span>
              </button>

              <button class="btn-seguir-comprando" @click="irAHome">
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCarrito } from '../composables/useCarrito';
import { PedidoService } from '../../private/services/PedidoService';
import { MetodoPagoService } from '../../private/services/metodoPagoService';
import { Notificar } from "../utils/notificaciones";
import { CuponService } from '../../private/services/cuponService';
import { CarritoService } from '../../private/services/carritoService';

export default {

  name: 'CarritoView',
  setup() {
    const router = useRouter();

    const {
      carritoItems,
      carritoInfo,
      carritoCount,
      carritoTotal,
      syncCarritoData,
      eliminarItem,
      isDeleting,
      actualizarCantidad
    } = useCarrito();

    const loading = ref(true);
    const procesando = ref(false);

    const metodosPago = ref([]);
    const metodoPagoSeleccionado = ref(null);

    const codigoCupon = ref('');
    const cuponValidado = ref(null);

    onMounted(async () => {
      const usuarioId = localStorage.getItem('usuarioId');
      if (usuarioId) {
        await syncCarritoData();
      }

      try {
        const data = await MetodoPagoService.getAll();
        metodosPago.value = Array.isArray(data) ? data : [];
        if (metodosPago.value.length > 0) {
          metodoPagoSeleccionado.value = metodosPago.value[0].metodoId;
        }
      } catch (error) {
        console.error('Error al obtener métodos de pago:', error);
      }

      loading.value = false;
    });

    const irAHome = () => {
      router.push({ name: 'MainView' });
    };

    const cambiarCantidad = async (itemId, cambio) => {
      const item = carritoItems.value.find(i => i.carritoItemId === itemId);
      if (!item) return;

      const nuevaCantidad = item.cantidad + cambio;

      if (nuevaCantidad > 0) {
        await actualizarCantidad(itemId, nuevaCantidad);
      } else if (nuevaCantidad === 0) {
        await eliminarItem(itemId);
      }
    };

    const aplicarCupon = async () => {
  if (!codigoCupon.value.trim()) {
    Notificar.error('Ingresa un código de cupón');
    return;
  }
  
  try {

    const response = await CuponService.validarCupon(codigoCupon.value.trim().toUpperCase());

    if (!response.valido) {
      Notificar.error(response.mensaje || 'Cupón no válido o expirado');
      return;
    }

    await CarritoService.aplicarCupon(response.cupon.codigo);

    await syncCarritoData();

    Notificar.exito(`Cupón "${response.cupon.codigo}" aplicado con éxito`, 3);

  } catch (error) {
    console.error('Error al aplicar cupón:', error);

    if (error.message?.includes('ya está aplicado')) {
      Notificar.error('Este cupón ya está aplicado', 3);
    } else if (error.message?.includes('vacío')) {
      Notificar.error('Agrega productos antes de aplicar un cupón', 3);
    } else {
      Notificar.error('Error al aplicar el cupón', 3);
    }
  }
};

    const finalizarCompra = async () => {
      if (carritoCount.value === 0) {
        Notificar.error('El carrito está vacío');
        return;
      }

      if (!carritoInfo.value.carritoId) {
        Notificar.error('Error al obtener información del carrito');
        return;
      }

      if (!metodoPagoSeleccionado.value) {
        Notificar.error('Selecciona un método de pago');
        return;
      }

      procesando.value = true;

      try {
        await PedidoService.create({
          CarritoId: carritoInfo.value.carritoId,
          MetodoPagoId: metodoPagoSeleccionado.value,
          RepartidorId: null,
          Resenia: null,
        });

        Notificar.exito('Pedido creado exitosamente');
        await syncCarritoData();
        router.push({ name: 'MisCompras' });

      } catch (error) {
        console.error('Error al crear pedido:', error);
        if (error.message) {
          if (error.message.includes('Stock insuficiente')) {
            Notificar.error('Algunos productos no tienen stock suficiente');
          } else if (error.message.includes('carrito')) {
            Notificar.error('Error con el carrito. Recargando...');
            await syncCarritoData();
          } else if (error.message.includes('Método de pago')) {
            Notificar.error('Método de pago no válido');
          } else {
            Notificar.error('Error al crear el pedido. Intenta nuevamente');
          }
        } else {
          Notificar.error('Error al crear el pedido');
        }
      } finally {
        procesando.value = false;
      }
    };

    return {
      loading,
      procesando,
      carritoItems,
      carritoCount,
      carritoTotal,
      irAHome,
      eliminarItem,
      isDeleting,
      cambiarCantidad,
      finalizarCompra,
      metodosPago,
      metodoPagoSeleccionado,
      codigoCupon,
      aplicarCupon
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

.carrito-view-background {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  padding-bottom: 60px;
}

/* Hero Banner */
.carrito-hero-banner {
  background-image: url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200');
  background-size: cover;
  background-position: center;
  height: 300px;
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
.carrito-container {
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Carrito Vacío */
.carrito-vacio {
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
  animation: float 3s ease-in-out infinite;
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

/* Lista de Productos */
.productos-lista {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeInUp 0.5s ease-out;
}

.producto-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out backwards;
}

.producto-item:last-child {
  border-bottom: none;
}

.producto-item:hover {
  background: #fafafa;
  transform: translateX(5px);
}

.producto-imagen-wrapper {
  flex-shrink: 0;
}

.producto-imagen {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.producto-info {
  flex-grow: 1;
  min-width: 0;
}

.producto-nombre {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.3rem;
}

.producto-descripcion {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.producto-precio-unitario {
  color: #ff9900;
  font-weight: 600;
  font-size: 0.95rem;
}

.producto-acciones {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.cantidad-control {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f5f5;
  border-radius: 50px;
  padding: 5px;
}

.btn-cantidad {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff9900;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-cantidad:hover:not(:disabled) {
  background: #ff9900;
  color: white;
  transform: scale(1.1);
}

.btn-cantidad:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cantidad-valor {
  min-width: 30px;
  text-align: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.producto-subtotal {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  min-width: 100px;
  text-align: right;
}

.btn-eliminar {
  background: #ff4444;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
}

.btn-eliminar:hover {
  background: #cc0000;
  transform: rotate(15deg) scale(1.1);
}

/* Cupón Section */
.cupon-section {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeInUp 0.5s ease-out;
}

.cupon-label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  display: block;
}

.cupon-input-group {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.cupon-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
  background-color: #fafafa;
  color: #333;
  letter-spacing: 0.5px;
}

.cupon-input::placeholder {
  color: #a0a0a0;
  font-weight: 500;
}

.cupon-input:focus {
  outline: none;
  border-color: #ff9900;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(255, 153, 0, 0.1);
}

.cupon-input:hover:not(:focus) {
  border-color: #ffb84d;
  background-color: #fff9f0;
}

.cupon-input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.cupon-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 153, 0, 0.3);
  white-space: nowrap;
}

.cupon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 153, 0, 0.4);
}

.cupon-btn:active {
  transform: translateY(0);
}

.cupon-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: 0 4px 12px rgba(255, 153, 0, 0.2);
}

/* Métodos de pago */
.metodo-pago-selector {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metodo-label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.metodo-select {
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  transition: border-color 0.2s ease;
}

.metodo-select:focus {
  outline: none;
  border-color: #ff9900;
}

.metodo-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

/* Resumen del Pedido */
.resumen-pedido {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 20px;
  animation: fadeInUp 0.6s ease-out;
}

.resumen-header {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  padding: 20px 30px;
}

.resumen-titulo {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.resumen-body {
  padding: 30px;
}

.resumen-linea {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.05rem;
  color: #666;
}

.resumen-valor {
  font-weight: 600;
  color: #333;
}

.envio-gratis {
  color: #28a745;
  font-weight: 700;
}

.resumen-divider {
  border: none;
  border-top: 2px solid #f0f0f0;
  margin: 1.5rem 0;
}

.resumen-total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

.total-label {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
}

.total-valor {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ff9900;
}

/* Botones de Acción */
.btn-finalizar-compra {
  width: 100%;
  background: linear-gradient(135deg, #28a745 0%, #20893a 100%);
  color: white;
  border: none;
  padding: 16px;
  font-size: 1.2rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.btn-finalizar-compra span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.btn-finalizar-compra:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(40, 167, 69, 0.4);
}

.btn-finalizar-compra:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icono-flecha {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.btn-finalizar-compra:hover:not(:disabled) .icono-flecha {
  transform: translateX(5px);
}

.btn-seguir-comprando {
  width: 100%;
  background: transparent;
  color: #ff9900;
  border: 2px solid #ff9900;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-seguir-comprando:hover {
  background: #ff9900;
  color: white;
  transform: translateY(-2px);
}

/* Info Adicional */
.info-adicional {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  animation: fadeInUp 0.7s ease-out;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icono {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-texto {
  font-size: 0.95rem;
  color: #666;
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

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

/* Responsive */
@media (max-width: 991px) {
  .resumen-pedido {
    position: relative;
    top: 0;
  }
}

@media (max-width: 768px) {
  .carrito-hero-banner {
    height: 250px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .producto-item {
    flex-wrap: wrap;
    gap: 15px;
  }

  .producto-imagen {
    width: 80px;
    height: 80px;
  }

  .producto-acciones {
    width: 100%;
    justify-content: space-between;
  }

  .producto-subtotal {
    min-width: auto;
  }

  .resumen-body {
    padding: 20px;
  }
}

@media (max-width: 576px) {
  .carrito-hero-banner {
    height: 200px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .productos-lista {
    padding: 10px;
  }

  .producto-item {
    padding: 15px 10px;
  }

  .resumen-header {
    padding: 15px 20px;
  }

  .resumen-titulo {
    font-size: 1.3rem;
  }
}
</style>