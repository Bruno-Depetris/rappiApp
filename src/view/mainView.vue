<template>
  <div class="main-layout">
    <nav class="nav-bar">
      <div class="nav-left">
        <div class="logo">
          <h2>RappiApp</h2>
        </div>
        
        <div class="search-bar">
          <input 
            v-model="busqueda" 
            type="text" 
            placeholder="Buscar productos, restaurantes..."
            @input="buscarProductos"
          />
          <span class="material-icons">search</span>
        </div>
      </div>

      <div class="nav-center">
        <button 
          @click="filtroCategoria = ''"
          :class="{ active: filtroCategoria === '' }"
        >
          <span class="material-icons">restaurant</span> 
          Todos
        </button>
        <button 
          v-for="categoria in categorias" 
          :key="categoria.categoriaId"
          @click="filtroCategoria = categoria.categoriaId"
          :class="{ active: filtroCategoria === categoria.categoriaId }"
        >
          <span class="material-icons">category</span> 
          {{ categoria.categoria }}
        </button>
      </div>

      <div class="nav-right">
        <div class="container-user">
          <i class="material-icons">person</i>
          <div class="user-info">
            <p>{{ usuarioLogueado }}</p>
            <small>{{ userRole }}</small>
          </div>
        </div>

        <div class="container-carrito">
          <button @click="toggleCarrito">
            <span class="material-icons">shopping_cart</span>
            <span v-if="carritoCount > 0" class="carrito-badge">{{ carritoCount }}</span>
          </button>

          <div v-if="carritoVisible" class="container-carrito-datos">
            <div class="carrito-header">
              <h3>Mi Carrito</h3>
              <button @click="carritoVisible = false" class="btn-close">×</button>
            </div>
            
            <div v-if="carritoItems.length > 0" class="carrito-content">
              <div v-for="item in carritoItems" :key="item.id" class="carrito-item">
                <div class="item-info">
                  <h4>{{ item.nombreProducto || item.producto?.nombre || 'Producto' }}</h4>
                  <p>Cantidad: {{ item.cantidad }}</p>
                </div>
                <div class="item-price">
                  <p>${{ (item.precioUnitario * item.cantidad).toFixed(2) }}</p>
                  <button @click="removerDelCarrito(item)" class="btn-remove">×</button>
                </div>
              </div>
              
              <div class="carrito-total">
                <strong>Total: ${{ carritoTotal.toFixed(2) }}</strong>
              </div>
              
              <div class="carrito-actions">
                <button @click="vaciarCarrito" class="btn-secondary">Vaciar</button>
                <button @click="crearPedido" class="btn-primary">Pedir</button>
              </div>
            </div>
            <div v-else class="carrito-empty">
              <p>Tu carrito está vacío</p>
            </div>
          </div>
        </div>

        <button @click="logout" class="btn-logout">
          <span class="material-icons">exit_to_app</span>
          Salir
        </button>
      </div>
    </nav>

    <main class="main-content">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Cargando productos...</p>
      </div>
      
      <div v-else>
        <div v-if="productosFiltrados.length === 0" class="empty-state">
          <span class="material-icons">search_off</span>
          <p>No se encontraron productos</p>
        </div>
        
        <div v-else class="productos-grid">
          <div
            v-for="producto in productosFiltrados"
            :key="producto.productoId"
            class="producto-card"
          >
            <div class="producto-image">
              <img :src="producto.imagenes || 'https://via.placeholder.com/300x200'" :alt="producto.nombre">
              <div v-if="producto.disponibilidad === 0" class="out-of-stock">Sin Stock</div>
            </div>
            
            <div class="producto-info">
              <h3>{{ producto.nombre }}</h3>
              <p class="precio">${{ producto.precio }}</p>
              <p class="descripcion">{{ producto.descripcion }}</p>
              <p class="vendedor">{{ producto.vendedor?.nombre || 'Vendedor' }}</p>
            </div>
            
            <div class="producto-actions">
              <button @click="verProducto(producto)" class="btn-ver">
                <span class="material-icons">visibility</span>
                Ver
              </button>
              <button 
                @click="agregarAlCarrito(producto)" 
                class="btn-agregar"
                :disabled="producto.disponibilidad === 0"
              >
                <span class="material-icons">add_shopping_cart</span>
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="mostrarModalProducto" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ productoSeleccionado?.nombre }}</h2>
          <button @click="cerrarModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <img 
            :src="productoSeleccionado?.imagenes || 'https://via.placeholder.com/400x300'" 
            :alt="productoSeleccionado?.nombre"
          >
          <div class="producto-detalles">
            <p class="precio-modal">${{ productoSeleccionado?.precio }}</p>
            <p class="descripcion-modal">{{ productoSeleccionado?.descripcion }}</p>
            <p class="stock">Stock disponible: {{ productoSeleccionado?.disponibilidad }}</p>
            <div class="cantidad-selector">
              <label>Cantidad:</label>
              <div class="cantidad-controls">
                <button @click="cantidadModal > 1 && cantidadModal--">-</button>
                <span>{{ cantidadModal }}</span>
                <button @click="cantidadModal < productoSeleccionado?.disponibilidad && cantidadModal++">+</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-secondary">Cancelar</button>
          <button 
            @click="agregarAlCarritoModal" 
            class="btn-primary"
            :disabled="productoSeleccionado?.disponibilidad === 0"
          >
            Agregar ${{ ((productoSeleccionado?.precio || 0) * cantidadModal).toFixed(2) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { UsuarioService, ProductoService, CarritoService, CategoriaService, PedidoService } from '../../private/services';
import { Notificar } from "../utils/notificaciones";

export default {
  name: 'MainView',
  data() {
    return {
      usuarioLogueado: '',
      userRole: '',
      productos: [],
      categorias: [],
      carritoItems: [],
      carritoVisible: false,
      loading: true,
      busqueda: '',
      filtroCategoria: '',
      mostrarModalProducto: false,
      productoSeleccionado: null,
      cantidadModal: 1
    }
  },
  
  computed: {
    carritoCount() {
      return this.carritoItems.reduce((total, item) => total + item.cantidad, 0);
    },
    
    carritoTotal() {
      return this.carritoItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    },
    
    productosFiltrados() {
      let filtrados = [...this.productos];
      
      if (this.busqueda) {
        filtrados = filtrados.filter(producto => 
          producto.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          producto.descripcion.toLowerCase().includes(this.busqueda.toLowerCase())
        );
      }
      
      if (this.filtroCategoria) {
        filtrados = filtrados.filter(producto => 
          producto.categoriaProductoId === this.filtroCategoria
        );
      }
      
      return filtrados;
    }
  },
  
  async mounted() {
    await this.verificarAutenticacion();
    await this.inicializarDatos();
  },
  
  methods: {
    async verificarAutenticacion() {
      if (!UsuarioService.estaAutenticado()) {
        this.$router.push('/login');
        return;
      }
      
      const usuario = UsuarioService.obtenerUsuario();
      this.usuarioLogueado = usuario?.nombre || 'Usuario';
      this.userRole = UsuarioService.obtenerRol() || 'cliente';
    },
    
    async inicializarDatos() {
      try {
        this.loading = true;
        
        await Promise.all([
          this.cargarProductos(),
          this.cargarCategorias(),
          this.cargarCarrito()
        ]);
        
        Notificar.exito('¡Bienvenido a RappiApp!');
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        Notificar.error('Error al cargar los datos');
      } finally {
        this.loading = false;
      }
    },
    
    async cargarProductos() {
      try {
        this.productos = await ProductoService.getAll();
      } catch (error) {
        console.error('Error al cargar productos:', error);
        this.productos = [];
      }
    },
    
    async cargarCategorias() {
      try {
        this.categorias = await CategoriaService.getAll();
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        this.categorias = [];
      }
    },
    
    async cargarCarrito() {
      try {
        const carrito = await CarritoService.getMiCarrito();
        this.carritoItems = carrito?.items || [];
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        this.carritoItems = [];
      }
    },
    
    buscarProductos() {
    },
    
    toggleCarrito() {
      this.carritoVisible = !this.carritoVisible;
    },
    
    verProducto(producto) {
      this.productoSeleccionado = producto;
      this.cantidadModal = 1;
      this.mostrarModalProducto = true;
    },
    
    cerrarModal() {
      this.mostrarModalProducto = false;
      this.productoSeleccionado = null;
      this.cantidadModal = 1;
    },
    
    async agregarAlCarrito(producto, cantidad = 1) {
      try {
        if (producto.disponibilidad === 0) {
          Notificar.error('Producto sin stock');
          return;
        }
        
        await CarritoService.agregarItem(producto.productoId, cantidad);
        await this.cargarCarrito();
        
        Notificar.exito(`${producto.nombre} agregado al carrito`);
        
      } catch (error) {
        console.error('Error al agregar producto:', error);
        
        const itemExistente = this.carritoItems.find(item => 
          item.productoId === producto.productoId
        );
        
        if (itemExistente) {
          itemExistente.cantidad += cantidad;
        } else {
          this.carritoItems.push({
            id: Date.now(),
            productoId: producto.productoId,
            producto: producto,
            cantidad: cantidad,
            precio: producto.precio
          });
        }
        
        Notificar.exito(`${producto.nombre} agregado al carrito (modo local)`);
      }
    },
    
    async agregarAlCarritoModal() {
      await this.agregarAlCarrito(this.productoSeleccionado, this.cantidadModal);
      this.cerrarModal();
    },
    
    async removerDelCarrito(item) {
      try {
        await CarritoService.eliminarItem(item.carritoItemId);
        await this.cargarCarrito();
        Notificar.exito('Producto eliminado del carrito');
      } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        
        const index = this.carritoItems.findIndex(i => i.id === item.id);
        if (index > -1) {
          this.carritoItems.splice(index, 1);
          Notificar.exito('Producto eliminado del carrito (modo local)');
        }
      }
    },
    
    async vaciarCarrito() {
      try {
        await CarritoService.vaciarCarrito();
        this.carritoItems = [];
        Notificar.exito('Carrito vaciado');
      } catch (error) {
        console.error('Error al vaciar carrito:', error);
        this.carritoItems = [];
        Notificar.exito('Carrito vaciado (modo local)');
      }
    },
    
    async crearPedido() {
      try {
        if (this.carritoItems.length === 0) {
          Notificar.error('El carrito está vacío');
          return;
        }
        
        const pedido = await PedidoService.create({
          usuarioId: UsuarioService.obtenerUsuarioId(),
          metodoPagoId: 1,
          direccionEntrega: UsuarioService.obtenerUsuario()?.direccion,
          observaciones: ''
        });
        
        this.carritoItems = [];
        this.carritoVisible = false;
        
        Notificar.exito('¡Pedido creado exitosamente!');
        
      } catch (error) {
        console.error('Error al crear pedido:', error);
        Notificar.error('Error al crear el pedido');
      }
    },
    
    logout() {
      UsuarioService.logout();
      this.$router.push('/login');
    }
  }
}
</script>

<style>
.main-layout {
  min-height: 100vh;
  background: #fafafa;
}

.nav-bar {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo h2 {
  color: #667eea;
  margin: 0;
  font-weight: bold;
}

.search-bar {
  position: relative;
  width: 300px;
}

.search-bar input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 14px;
  outline: none;
}

.search-bar input:focus {
  border-color: #667eea;
}

.search-bar .material-icons {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 18px;
}

.nav-center {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 5px;
}

.nav-center button {
  background: none;
  border: 1px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 20px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #666;
}

.nav-center button:hover,
.nav-center button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.container-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 25px;
  border: none;
  cursor: pointer;
}

.user-info p {
  margin: 0;
  font-weight: 500;
  color: #333;
}

.user-info small {
  color: #666;
  text-transform: capitalize;
}

.container-carrito {
  position: relative;
}

.container-carrito > button {
  position: relative;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container-carrito > button:hover {
  background: #f0f0f0;
  transform: scale(1.05);
}

.carrito-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.container-carrito-datos {
  position: absolute;
  top: 55px;
  right: 0;
  background: white;
  border-radius: 12px;
  padding: 0;
  min-width: 350px;
  max-height: 400px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.carrito-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.carrito-header h3 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #f0f0f0;
}

.carrito-content {
  max-height: 250px;
  overflow-y: auto;
}

.carrito-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.carrito-item:last-child {
  border-bottom: none;
}

.item-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
}

.item-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-price p {
  margin: 0;
  font-weight: bold;
  color: #667eea;
}

.btn-remove {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carrito-total {
  padding: 15px 20px;
  border-top: 2px solid #eee;
  text-align: center;
  color: #333;
}

.carrito-actions {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
}

.carrito-empty {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.btn-logout {
  background: #ff4444;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: #cc3333;
}

.main-content {
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 15px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #666;
  gap: 15px;
}

.empty-state .material-icons {
  font-size: 48px;
  color: #ccc;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.producto-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.producto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.producto-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.producto-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.out-of-stock {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
}

.producto-info {
  padding: 20px;
}

.producto-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.precio {
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
  margin: 8px 0;
}

.descripcion {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  margin: 8px 0;
}

.vendedor {
  color: #999;
  font-size: 12px;
  margin: 8px 0 0 0;
}

.producto-actions {
  display: flex;
  gap: 0;
  border-top: 1px solid #eee;
}

.producto-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: background 0.3s ease;
}

.btn-ver {
  background: #f8f9fa;
  color: #666;
}

.btn-ver:hover {
  background: #e9ecef;
}

.btn-agregar {
  background: #667eea;
  color: white;
}

.btn-agregar:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-agregar:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.modal-body {
  padding: 25px;
}

.modal-body img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
}

.producto-detalles {
  margin-top: 15px;
}

.precio-modal {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  margin: 10px 0;
}

.descripcion-modal {
  color: #666;
  line-height: 1.6;
  margin: 15px 0;
}

.stock {
  color: #999;
  font-size: 14px;
  margin: 10px 0;
}

.cantidad-selector {
  margin: 20px 0;
}

.cantidad-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.cantidad-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.cantidad-controls button {
  width: 35px;
  height: 35px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.cantidad-controls button:hover {
  background: #f0f0f0;
}

.cantidad-controls span {
  font-size: 18px;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px 25px;
  border-top: 1px solid #eee;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .nav-bar {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .nav-left,
  .nav-right {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-bar {
    width: 100%;
  }
  
  .nav-center {
    width: 100%;
    justify-content: flex-start;
  }
  
  .productos-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .container-carrito-datos {
    right: -10px;
    min-width: 300px;
  }
}
</style>