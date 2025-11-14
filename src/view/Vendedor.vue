<template>
  <div class="contendor-vendedor">
    <header class="vendedor-header">
      <h1>Panel de Vendedor</h1>
      <div class="usuario-info">
        <span>{{ nombreVendedor }}</span>
        <button @click="logout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </header>

    <div class="contenedor-negocio">
      <div class="info-negocio">
        <h2>{{ nombreNegocio || "Sin negocio registrado" }}</h2>
        <span class="estado-negocio" :class="estadoNegocio?.toLowerCase()">
          {{ estadoNegocio || "Pendiente" }}
        </span>
        <p class="categoria-negocio">{{ nombreCategoria }}</p>
      </div>
      
      <div class="estadisticas">
        <div class="stat-item">
          <span class="stat-number">{{ totalProductos }}</span>
          <span class="stat-label">Productos</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ pedidosPendientes }}</span>
          <span class="stat-label">Pedidos Pendientes</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${{ ventasTotal }}</span>
          <span class="stat-label">Ventas Total</span>
        </div>
      </div>
    </div>

    <nav class="tabs">
      <button 
        @click="tabActivo = 'productos'" 
        :class="{ active: tabActivo === 'productos' }"
      >
        Productos
      </button>
      <button 
        @click="tabActivo = 'pedidos'" 
        :class="{ active: tabActivo === 'pedidos' }"
      >
        Pedidos
      </button>
      <button 
        @click="tabActivo = 'negocio'" 
        :class="{ active: tabActivo === 'negocio' }"
      >
        Mi Negocio
      </button>
    </nav>

    <div class="tab-content">
      <div v-if="tabActivo === 'productos'" class="productos-tab">
        <div class="productos-header">
          <h3>Mis Productos</h3>
          <button @click="mostrarModalProducto = true" class="btn-primary">
            + Agregar Producto
          </button>
        </div>
        
        <div v-if="loading" class="loading">Cargando productos...</div>
        <div v-else-if="productos.length === 0" class="empty-state">
          <p>No tienes productos registrados</p>
        </div>
        <div v-else class="productos-grid">
          <div
            v-for="producto in productos"
            :key="producto.productoId"
            class="producto-card"
          >
            <img
              :src="producto.imagenes || 'https://via.placeholder.com/240x200'"
              :alt="producto.nombre"
            />
            <div class="producto-info">
              <h4>{{ producto.nombre }}</h4>
              <p class="precio">${{ producto.precio }}</p>
              <p class="stock">Stock: {{ producto.disponibilidad }}</p>
              <p class="descripcion">{{ producto.descripcion }}</p>
            </div>
            <div class="producto-actions">
              <button @click="editarProducto(producto)" class="btn-edit">
                Editar
              </button>
              <button @click="eliminarProducto(producto.productoId)" class="btn-delete">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tabActivo === 'pedidos'" class="pedidos-tab">
        <h3>Mis Pedidos</h3>
        <div class="pedidos-filtros">
          <button 
            @click="filtroEstado = ''" 
            :class="{ active: filtroEstado === '' }"
          >
            Todos
          </button>
          <button 
            @click="filtroEstado = 'Pendiente'" 
            :class="{ active: filtroEstado === 'Pendiente' }"
          >
            Pendientes
          </button>
          <button 
            @click="filtroEstado = 'EnCamino'" 
            :class="{ active: filtroEstado === 'EnCamino' }"
          >
            En Camino
          </button>
          <button 
            @click="filtroEstado = 'Entregado'" 
            :class="{ active: filtroEstado === 'Entregado' }"
          >
            Entregados
          </button>
        </div>
        
        <div v-if="pedidosFiltrados.length === 0" class="empty-state">
          <p>No hay pedidos para mostrar</p>
        </div>
        <div v-else class="pedidos-lista">
          <div
            v-for="pedido in pedidosFiltrados"
            :key="pedido.pedidoId"
            class="pedido-card"
          >
            <div class="pedido-header">
              <span class="pedido-id">#{{ pedido.pedidoId }}</span>
              <span class="pedido-estado" :class="pedido.estado.toLowerCase()">
                {{ pedido.estado }}
              </span>
              <span class="pedido-fecha">{{ formatearFecha(pedido.fechaCreacion) }}</span>
            </div>
            <div class="pedido-productos">
              <div 
                v-for="item in obtenerMisProductosDelPedido(pedido)" 
                :key="item.itemPedidoId"
                class="pedido-item"
              >
                <span>{{ item.nombreProducto }}</span>
                <span>Cantidad: {{ item.cantidad }}</span>
                <span>${{ item.subtotal }}</span>
              </div>
            </div>
            <div class="pedido-total">
              <strong>Total: ${{ calcularMiTotalDelPedido(pedido) }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tabActivo === 'negocio'" class="negocio-tab">
        <h3>Información del Negocio</h3>
        <div v-if="!negocio" class="empty-state">
          <p>No tienes un negocio registrado</p>
          <button @click="mostrarModalNegocio = true" class="btn-primary">
            Crear Negocio
          </button>
        </div>
        <div v-else class="negocio-form">
          <div class="form-group">
            <label>Nombre del Negocio</label>
            <input v-model="negocio.nombreNegocio" type="text" />
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input v-model="negocio.direccion" type="text" />
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="negocio.telefono" type="text" />
          </div>
          <div class="form-group">
            <label>Horario</label>
            <input v-model="negocio.horarioApertura" type="text" placeholder="Ej: 09:00 - 22:00" />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="negocio.descripcion"></textarea>
          </div>
          <button @click="actualizarNegocio" class="btn-primary">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalProducto" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ productoEditando ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
          <button @click="cerrarModalProducto" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="productoForm.nombre" type="text" />
          </div>
          <div class="form-group">
            <label>Precio</label>
            <input v-model="productoForm.precio" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="productoForm.descripcion"></textarea>
          </div>
          <div class="form-group">
            <label>Stock</label>
            <input v-model="productoForm.disponibilidad" type="number" />
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <select v-model="productoForm.categoriaProductoId">
              <option value="">Seleccionar categoría</option>
              <option 
                v-for="cat in categoriasProducto" 
                :key="cat.categoriaProductoId" 
                :value="cat.categoriaProductoId"
              >
                {{ cat.categoria }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>URL de Imagen</label>
            <input v-model="productoForm.imagenes" type="url" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cerrarModalProducto" class="btn-secondary">
            Cancelar
          </button>
          <button @click="guardarProducto" class="btn-primary">
            {{ productoEditando ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalNegocio" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Registrar Negocio</h3>
          <button @click="mostrarModalNegocio = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre del Negocio</label>
            <input v-model="negocioForm.nombreNegocio" type="text" />
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <select v-model="negocioForm.categoriaId">
              <option value="">Seleccionar categoría</option>
              <option 
                v-for="cat in categorias" 
                :key="cat.categoriaId" 
                :value="cat.categoriaId"
              >
                {{ cat.categoria }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input v-model="negocioForm.direccion" type="text" />
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="negocioForm.telefono" type="text" />
          </div>
          <div class="form-group">
            <label>Horario</label>
            <input v-model="negocioForm.horarioApertura" type="text" placeholder="Ej: 09:00 - 22:00" />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="negocioForm.descripcion"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="mostrarModalNegocio = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="crearNegocio" class="btn-primary">
            Registrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.contendor-vendedor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.vendedor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #eeeeee 0%);
  color: rgb(0, 0, 0);
  border-radius: 12px;
}

.vendedor-header h1 {
  margin: 0;
  font-size: 2em;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.685);
  color: rgb(0, 0, 0);
  border: 1px solid rgba(37, 37, 37, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.contenedor-negocio {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-negocio {
  margin-bottom: 20px;
}

.info-negocio h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.estado-negocio {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-negocio.aprobado {
  background: #d4edda;
  color: #155724;
}

.estado-negocio.pendiente {
  background: #fff3cd;
  color: #856404;
}

.estado-negocio.rechazado {
  background: #f8d7da;
  color: #721c24;
}

.categoria-negocio {
  color: #666;
  margin: 10px 0 0 0;
}

.estadisticas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  display: block;
  font-size: 2em;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
  text-transform: uppercase;
}

.tabs {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 5px;
  margin-bottom: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tabs button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tabs button.active {
  background: #667eea;
  color: white;
}

.tab-content {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.productos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.productos-header h3 {
  margin: 0;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.producto-card {
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.producto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.producto-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.producto-info {
  padding: 15px;
}

.producto-info h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.precio {
  font-size: 1.2em;
  font-weight: bold;
  color: #667eea;
  margin: 5px 0;
}

.stock {
  color: #666;
  font-size: 0.9em;
  margin: 5px 0;
}

.descripcion {
  color: #777;
  font-size: 0.9em;
  line-height: 1.4;
  margin: 8px 0 0 0;
}

.producto-actions {
  padding: 15px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #eee;
}

.btn-edit {
  flex: 1;
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background 0.3s ease;
}

.btn-edit:hover {
  background: #218838;
}

.btn-delete {
  flex: 1;
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background 0.3s ease;
}

.btn-delete:hover {
  background: #c82333;
}

.pedidos-filtros {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.pedidos-filtros button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.pedidos-filtros button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.pedidos-lista {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.pedido-card {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  background: white;
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.pedido-id {
  font-weight: bold;
  color: #333;
}

.pedido-estado {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
}

.pedido-estado.pendiente {
  background: #fff3cd;
  color: #856404;
}

.pedido-estado.encamino {
  background: #cce5ff;
  color: #004085;
}

.pedido-estado.entregado {
  background: #d4edda;
  color: #155724;
}

.pedido-fecha {
  color: #666;
  font-size: 0.9em;
}

.pedido-productos {
  margin-bottom: 15px;
}

.pedido-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.pedido-item:last-child {
  border-bottom: none;
}

.pedido-total {
  text-align: right;
  font-size: 1.1em;
  color: #667eea;
}

.negocio-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1em;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
}

.modal-header h3 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 0 20px 20px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .contendor-vendedor {
    padding: 10px;
  }
  
  .vendedor-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .estadisticas {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .productos-grid {
    grid-template-columns: 1fr;
  }
  
  .pedido-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .pedido-item {
    flex-direction: column;
    gap: 5px;
  }
}
</style>

<script>
import { AppServices, UsuarioService } from "../../private/services";

export default {
  data() {
    return {
      loading: false,
      tabActivo: 'productos',
      filtroEstado: '',
      
      nombreVendedor: '',
      vendedorId: null,
      
      negocio: null,
      nombreNegocio: '',
      nombreCategoria: '',
      estadoNegocio: null,
      
      productos: [],
      pedidos: [],
      categorias: [],
      categoriasProducto: [],
      
      totalProductos: 0,
      pedidosPendientes: 0,
      ventasTotal: 0,
      
      mostrarModalProducto: false,
      mostrarModalNegocio: false,
      productoEditando: null,
      
      productoForm: {
        nombre: '',
        precio: 0,
        descripcion: '',
        disponibilidad: 0,
        categoriaProductoId: '',
        imagenes: ''
      },
      
      negocioForm: {
        nombreNegocio: '',
        categoriaId: '',
        direccion: '',
        telefono: '',
        horarioApertura: '',
        descripcion: ''
      }
    };
  },
  
  computed: {
    pedidosFiltrados() {
      if (!this.filtroEstado) return this.pedidos;
      return this.pedidos.filter(pedido => pedido.estado === this.filtroEstado);
    }
  },
  
  async mounted() {
    await this.inicializarDatos();
  },
  
  methods: {
    async inicializarDatos() {
      try {
        this.loading = true;
        
        const usuario = UsuarioService.obtenerUsuario();
        if (!usuario) {
          this.$router.push('/login');
          return;
        }
        
        this.nombreVendedor = usuario.nombre;
        this.vendedorId = usuario.usuarioId;
        
        await Promise.all([
          this.cargarNegocio(),
          this.cargarProductos(),
          this.cargarPedidos(),
          this.cargarCategorias(),
          this.cargarCategoriasProducto()
        ]);
        
        this.calcularEstadisticas();
        
      } catch (error) {
        console.error('Error al inicializar datos:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async cargarNegocio() {
      try {
        this.negocio = await AppServices.vendedor.getMiNegocio(this.vendedorId);
        if (this.negocio) {
          this.nombreNegocio = this.negocio.nombreNegocio;
          this.estadoNegocio = this.negocio.estado;
          this.nombreCategoria = this.negocio.categoria?.categoria || '';
        }
      } catch (error) {
        console.error('Error al cargar negocio:', error);
      }
    },
    
    async cargarProductos() {
      try {
        this.productos = await AppServices.vendedor.getMisProductos(this.vendedorId);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    },
    
    async cargarPedidos() {
      try {
        this.pedidos = await AppServices.vendedor.getMisPedidos(this.vendedorId);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      }
    },
    
    async cargarCategorias() {
      try {
        this.categorias = await AppServices.categoria.getAll();
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    },
    
    async cargarCategoriasProducto() {
      try {
        this.categoriasProducto = await AppServices.categoriaProducto.getAll();
      } catch (error) {
        console.error('Error al cargar categorías de producto:', error);
      }
    },
    
    calcularEstadisticas() {
      this.totalProductos = this.productos.length;
      this.pedidosPendientes = this.pedidos.filter(p => p.estado === 'Pendiente').length;
      
      const pedidosEntregados = this.pedidos.filter(p => p.estado === 'Entregado');
      this.ventasTotal = pedidosEntregados.reduce((total, pedido) => {
        const miTotal = this.calcularMiTotalDelPedido(pedido);
        return total + miTotal;
      }, 0);
    },
    
    obtenerMisProductosDelPedido(pedido) {
      return AppServices.vendedor.getMisProductosDelPedido(pedido, this.vendedorId);
    },
    
    calcularMiTotalDelPedido(pedido) {
      const misProductos = this.obtenerMisProductosDelPedido(pedido);
      return misProductos.reduce((total, item) => total + (item.subtotal || 0), 0);
    },
    
    editarProducto(producto) {
      this.productoEditando = producto;
      this.productoForm = {
        nombre: producto.nombre,
        precio: producto.precio,
        descripcion: producto.descripcion,
        disponibilidad: producto.disponibilidad,
        categoriaProductoId: producto.categoriaProductoId,
        imagenes: producto.imagenes || ''
      };
      this.mostrarModalProducto = true;
    },
    
    async eliminarProducto(productoId) {
      if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        try {
          await AppServices.vendedor.deleteProducto(productoId);
          await this.cargarProductos();
          this.calcularEstadisticas();
        } catch (error) {
          console.error('Error al eliminar producto:', error);
          alert('Error al eliminar el producto');
        }
      }
    },
    
    async guardarProducto() {
      try {
        const datosProducto = {
          ...this.productoForm,
          vendedorId: this.vendedorId
        };
        
        if (this.productoEditando) {
          await AppServices.vendedor.updateProducto(this.productoEditando.productoId, datosProducto);
        } else {
          await AppServices.vendedor.createProducto(datosProducto);
        }
        
        await this.cargarProductos();
        this.calcularEstadisticas();
        this.cerrarModalProducto();
        
      } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('Error al guardar el producto');
      }
    },
    
    cerrarModalProducto() {
      this.mostrarModalProducto = false;
      this.productoEditando = null;
      this.productoForm = {
        nombre: '',
        precio: 0,
        descripcion: '',
        disponibilidad: 0,
        categoriaProductoId: '',
        imagenes: ''
      };
    },
    
    async crearNegocio() {
      try {
        const datosNegocio = {
          ...this.negocioForm,
          vendedorId: this.vendedorId
        };
        
        await AppServices.negocio.create(datosNegocio);
        await this.cargarNegocio();
        this.mostrarModalNegocio = false;
        this.negocioForm = {
          nombreNegocio: '',
          categoriaId: '',
          direccion: '',
          telefono: '',
          horarioApertura: '',
          descripcion: ''
        };
        
      } catch (error) {
        console.error('Error al crear negocio:', error);
        alert('Error al crear el negocio');
      }
    },
    
    async actualizarNegocio() {
      try {
        await AppServices.vendedor.updateMiNegocio(this.negocio.negocioId, this.negocio);
        alert('Negocio actualizado correctamente');
      } catch (error) {
        console.error('Error al actualizar negocio:', error);
        alert('Error al actualizar el negocio');
      }
    },
    
    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    logout() {
      UsuarioService.logout();
      this.$router.push('/login');
    }
  }
};
</script>
