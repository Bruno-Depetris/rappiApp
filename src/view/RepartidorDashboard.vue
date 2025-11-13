<template>
  <div class="repartidor-dashboard">
    <header class="header">
      <h1>Panel de Repartidor</h1>
      <div class="acciones-header">
        <button @click="cargarDatos" :disabled="cargando">Actualizar</button>
        <button @click="cerrarSesion" :disabled="cargando">Cerrar sesión</button>
      </div>
    </header>

    <div class="grid">
      <section class="panel">
        <h2>Pedidos disponibles</h2>
        <div v-if="cargando" class="loading">Cargando pedidos...</div>
        <div v-else>
          <p v-if="pedidosDisponibles.length === 0">No hay pedidos disponibles.</p>

          <ul class="lista-pedidos">
            <li v-for="pedido in pedidosDisponibles" :key="pedido.pedidoId" class="pedido-item">
              <div class="pedido-info">
                <strong>#{{ pedido.pedidoId }}</strong>
                <p>Total: ${{ (pedido.total || 0).toFixed(2) }}</p>
                <p>Fecha: {{ new Date(pedido.fechaCreacion).toLocaleDateString('es-AR') }}</p>
                <p>Estado: {{ pedido.estado }}</p>
              </div>

              <div class="pedido-acciones">
                <button @click="verDetalles(pedido)">Ver</button>
                <button @click="tomarPedido(pedido)" class="btn-primary">Tomar pedido</button>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section class="panel">
        <h2>Mis pedidos</h2>
        <div v-if="cargandoMisPedidos" class="loading">Cargando mis pedidos...</div>
        <div v-else>
          <p v-if="misPedidos.length === 0">No tenés pedidos asignados.</p>

          <ul class="lista-pedidos">
            <li v-for="pedido in misPedidos" :key="pedido.pedidoId" class="pedido-item">
              <div class="pedido-info">
                <strong>#{{ pedido.pedidoId }}</strong>
                <p>Total: ${{ (pedido.total || 0).toFixed(2) }}</p>
                <p>Fecha: {{ new Date(pedido.fechaCreacion).toLocaleDateString('es-AR') }}</p>
                <p>Estado: {{ pedido.estado }}</p>
              </div>

              <div class="pedido-acciones">
                <button @click="verDetalles(pedido)">Ver</button>
                <button v-if="pedido.estado === 'Pendiente'" @click="iniciarEntrega(pedido)" class="btn-primary">Iniciar entrega</button>
                <button v-if="pedido.estado === 'EnCamino'" @click="marcarEntregado(pedido)" class="btn-success">Marcar entregado</button>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <div v-if="pedidoSeleccionado" class="modal" @click.self="pedidoSeleccionado = null">
      <div class="modal-content">
        <h3>Detalles pedido #{{ pedidoSeleccionado.pedidoId }}</h3>
        <p><strong>Fecha:</strong> {{ new Date(pedidoSeleccionado.fechaCreacion).toLocaleDateString('es-AR') }}</p>
        <p><strong>Estado:</strong> {{ pedidoSeleccionado.estado }}</p>
        <p><strong>Total:</strong> ${{ (pedidoSeleccionado.total || 0).toFixed(2) }}</p>
        <h4>Productos</h4>
        <ul>
          <li v-for="producto in pedidoSeleccionado.misProductos || []" :key="producto.productoId">
            {{ producto.nombre }} - x{{ producto.cantidad }} - ${{ (producto.subtotal || 0).toFixed(2) }}
          </li>
        </ul>

        <div class="modal-actions">
          <button @click="pedidoSeleccionado = null">Cerrar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { RepartidorService} from '../../private/services/repartidorService';
import { PedidoService } from '../../private/services/pedidoService';
import { UsuarioService } from '../../private/services/usuarioService';


export default {
  name: 'RepartidorDashboard',
  data() {
    return {
      pedidosDisponibles: [],
      misPedidos: [],
      pedidoSeleccionado: null,
      cargando: false,
      cargandoMisPedidos: false
    };
  },
  async mounted() {
    await this.cargarDatos();
  },
  methods: {
    async cargarDatos() {
      try {
        this.cargando = true;
        this.cargandoMisPedidos = true;

        const usuarioId = UsuarioService.obtenerUsuarioId() || UsuarioService.obtenerUsuario()?.usuarioId;

        try {
          this.pedidosDisponibles = await RepartidorService.getPedidosDisponibles();
          console.log('Pedidos disponibles:', this.pedidosDisponibles);
        } catch (err) {
          console.error('Error cargando pedidos disponibles', err);
          this.pedidosDisponibles = [];
        }

        try {
          if (usuarioId) {
            this.misPedidos = await RepartidorService.getPedidosDeRepartidor(usuarioId);
            console.log('Mis pedidos:', this.misPedidos);
          } else {
            this.misPedidos = [];
          }
        } catch (err) {
          console.error('Error cargando mis pedidos', err);
          this.misPedidos = [];
        }
      } finally {
        this.cargando = false;
        this.cargandoMisPedidos = false;
      }
    },

    verDetalles(pedido) {
      this.pedidoSeleccionado = pedido;
    },

    async tomarPedido(pedido) {
      try {
        const usuarioId = UsuarioService.obtenerUsuarioId() || UsuarioService.obtenerUsuario()?.usuarioId;
        if (!usuarioId) {
          alert('Debes iniciar sesión como repartidor para tomar pedidos');
          return;
        }

        await RepartidorService.tomarPedido(pedido.pedidoId);

        await this.cargarDatos();
      } catch (err) {
        console.error('Error al tomar pedido', err);
        alert('No se pudo tomar el pedido');
      }
    },

    async iniciarEntrega(pedido) {
      try {
        await PedidoService.update(pedido.pedidoId, { estado: 'EnCamino' });
        await this.cargarDatos();
      } catch (err) {
        console.error('Error al iniciar entrega', err);
        alert('No se pudo iniciar la entrega');
      }
    },

    async marcarEntregado(pedido) {
      try {
        await RepartidorService.marcarEntregado(pedido.pedidoId);
        await this.cargarDatos();
      } catch (err) {
        console.error('Error al marcar entregado', err);
        alert('No se pudo marcar el pedido como entregado');
      }
    }
    ,
    cerrarSesion() {

      UsuarioService.logout();
      if (this.$router) {
        this.$router.push({ name: 'Login' });
      } else {
        window.location.href = '/';
      }
    }
  }
};
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap');

.repartidor-dashboard {
  font-family: 'Oswald', sans-serif;
  max-width: 1100px;
  margin: 100px auto 40px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;
}

/* HEADER */
.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background-color: rgba(73, 32, 5, 0.58);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.header h1 {
  font-size: 2rem;
  margin: 0;
}

.acciones-header button {
  background-color: #ff9900;
  color: white;
  font-weight: 700;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.acciones-header button:hover {
  background-color: #e08c00;
}

.acciones-header button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* GRID PRINCIPAL */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
}

/* PANEL GENERAL */
.panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.panel:hover {
  transform: translateY(-4px);
}

.panel h2 {
  color: #ff9900;
  font-size: 1.6rem;
  margin-bottom: 15px;
  border-bottom: 2px solid #ff9900;
  padding-bottom: 6px;
}

/* LISTA DE PEDIDOS */
.lista-pedidos {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pedido-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  transition: background-color 0.3s;
}

.pedido-item:hover {
  background-color: #fff8ef;
}

.pedido-info strong {
  color: #ff9900;
  font-size: 1.1rem;
}

.pedido-info p {
  margin: 2px 0;
  font-size: 0.95rem;
}

/* BOTONES */
.pedido-acciones {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pedido-acciones button {
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
}

.pedido-acciones button:hover {
  transform: scale(1.05);
}

.btn-primary {
  background-color: #ff9900;
  color: white;
}

.btn-primary:hover {
  background-color: #e08c00;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

/* ESTADOS Y LOADING */
.loading {
  text-align: center;
  color: #888;
  font-style: italic;
}

/* MODAL */
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0,0,0,0.5);
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 6px 18px rgba(0,0,0,0.3);
}

.modal-content h3 {
  color: #ff9900;
  margin-bottom: 10px;
}

.modal-content h4 {
  margin-top: 16px;
  color: #333;
}

.modal-content ul {
  list-style: none;
  padding: 0;
}

.modal-content li {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.modal-actions {
  text-align: right;
  margin-top: 16px;
}

.modal-actions button {
  background-color: #ff9900;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.modal-actions button:hover {
  background-color: #e08c00;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .header h1 {
    font-size: 1.6rem;
  }

  .panel h2 {
    font-size: 1.3rem;
  }

  .pedido-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .pedido-acciones {
    flex-direction: row;
    justify-content: flex-end;
    width: 100%;
  }
}
</style>