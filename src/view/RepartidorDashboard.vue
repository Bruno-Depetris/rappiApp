<template>
  <div class="repartidor-dashboard">
    <header class="header">
      <h1>Panel de Repartidor</h1>
      <div class="acciones-header">
        <button @click="cargarDatos" :disabled="cargando">Actualizar</button>
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

    <!-- Modal de detalles simple -->
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

        // Pedidos disponibles para tomar
        try {
          this.pedidosDisponibles = await RepartidorService.getPedidosDisponibles();
          console.log('Pedidos disponibles:', this.pedidosDisponibles);
        } catch (err) {
          console.error('Error cargando pedidos disponibles', err);
          this.pedidosDisponibles = [];
        }

        // Mis pedidos (asignados al repartidor)
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

        // Llamar al endpoint específico para tomar el pedido 
        await RepartidorService.tomarPedido(pedido.pedidoId);

        // Recargar listas
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
  }
};
</script>

<style scoped>
.repartidor-dashboard {
  max-width: 1100px;
  margin: 32px auto;
  padding: 16px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.panel {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
}
.lista-pedidos { list-style: none; padding: 0; margin: 0; }
.pedido-item { display:flex; justify-content:space-between; gap:12px; padding:10px; border-bottom:1px solid #f0f0f0; align-items:center; }
.pedido-info p { margin: 2px 0; }
.pedido-acciones button { margin-left:8px; }
.btn-primary { background: #007bff; color: white; border: none; padding:8px 10px; border-radius:6px; }
.btn-success { background: #28a745; color: white; border: none; padding:8px 10px; border-radius:6px; }
.loading { padding: 12px; color: #666; }

/* Modal */
.modal { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.4); }
.modal-content { background:white; padding:18px; border-radius:8px; width: 500px; max-height:80vh; overflow:auto; }
.modal-actions { text-align:right; margin-top:12px; }
</style>