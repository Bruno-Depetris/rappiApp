<template>
  <div class="main-view-background">
    <HeaderNav
      :usuario-logueado="usuarioLogueado"
      :carrito-items="carritoItems"
      :carrito-visible.sync="carritoVisible"
    />

    <div class="hero-banner-container">
      <div class="hero-content">
        <h1 class="hero-title">¿Tenes Hambre?</h1>
        <p class="hero-subtitle">Encuentra los platos más cercanos a ti.</p>
        <div class="search-form-container">
          <div class="input-group">
            <input type="text" placeholder="Busca un producto..." v-model="terminoBusqueda" class="address-input" />
            <button class="find-food-button" @click="buscarProductos">Buscar Comida</button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mt-5 text-center">
      <h2 class="titulo-productos mb-5">Nuestros Productos Destacados</h2>
      <div class="row justify-content-center">
        <div
          class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center"
          v-for="producto in productos"
          :key="producto.id"
        >
          <ProductCard
            :producto="producto"
            @ver="verProducto"
            @agregar="agregarAlCarrito"
          />
        </div>
      </div>
    </div>

    <div class="container-fluid category-section text-center">
      <h3 class="titulo-categorias mb-3">Explora por Categoría</h3>
      <div class="category-list-wrapper">
        <div
          class="category-item"
          v-for="categoria in categorias"
          :key="categoria.id"
          @click="seleccionarCategoria(categoria.id)"
          :class="{ 'active': categoria.id === categoriaSeleccionada }"
        >
          <img :src="categoria.imagen" :alt="categoria.nombre" class="category-image" />
          <div class="category-name">{{ categoria.nombre }}</div>
        </div>
      </div>
    </div>
  </div>

  <ProductModal
    :producto="productoSeleccionado"
    v-model:visible="modalVisible"
  />
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import HeaderNav from '../components/HeaderNav.vue';
import ProductCard from '../components/ProductCard.vue';
import ProductModal from '../components/ProductModal.vue';

import { UsuarioService, ProductoService, CarritoService, CategoriaService } from '../../private/services';

import { Notificar } from "../utils/notificaciones";

import hamburguesaImg from '../assets/hamburguesa.png';
import pizzaImg from '../assets/pizza.png';
import gaseosaImg from '../assets/gaseosa.png';
import heladoImg from '../assets/helado.png';
import ensaladaImg from '../assets/ensalada.png';
import promo from '../assets/promocion.png';

export default {
  name: 'MainView',
  components: { HeaderNav, ProductCard },
  setup() {
    const usuarioLogueado = ref(null);
    const productos = ref([]);
    const categorias = ref([
      { id: 1, nombre: "Hamburguesas", imagen: hamburguesaImg },
      { id: 2, nombre: "Pizzas", imagen: pizzaImg },
      { id: 3, nombre: "Bebidas", imagen: gaseosaImg },
      { id: 4, nombre: "Postres", imagen: heladoImg },
      { id: 5, nombre: "Ensaladas", imagen: ensaladaImg },
      { id: 6, nombre: "Promos", imagen: promo }
    ]);
    const carrito = ref(null);
    const carritoItems = ref([]);
    const carritoVisible = ref(false);
    const loading = ref(true);
    const categoriaSeleccionada = ref(null);
    const terminoBusqueda = ref('');

    const carritoCount = computed(() => 
      carritoItems.value.reduce((total, item) => total + item.cantidad, 0)
    );

    const carritoTotal = computed(() =>
      carritoItems.value.reduce((total, item) => total + item.precio * item.cantidad, 0)
    );

    const inicializarDatos = async () => {
      loading.value = true;
      productos.value = [{ id: 1, nombre: "CARGANDO...", precio: 0, imagen: "https://via.placeholder.com/150" }];

      try {
        const usuarioId = localStorage.getItem('usuarioId');
        if (usuarioId) {
          const usuario = await UsuarioService.getById(usuarioId);
          usuarioLogueado.value = usuario.nombre;

          carrito.value = await CarritoService.getCarritoByUsuario(usuarioId);
          if (carrito.value) {
            carritoItems.value = await CarritoService.getItemsByCarrito(carrito.value.id);
          }
        }
        //REVISAR ESTE ENDPOINT. DEBERIA SER EL DE getProductosPopulares
        const productosPopulares = await ProductoService.obtenerTodos();
        productos.value = productosPopulares.map(p => ({
          id: p.productoId,
          nombre: p.nombre,
          precio: p.precio,
          descripcion: p.descripcion,
          disponibilidad: p.disponibilidad,
          imagen: p.imagenes?.[0] || 'https://via.placeholder.com/150'
        }));

        const categoriasActivas = await CategoriaService.getCategoriasActivas();
        if (categoriasActivas) categorias.value = categoriasActivas;

      } catch (error) {
        console.error('Error al cargar datos:', error);
        Notificar.error('❌ Error al cargar los datos');
      } finally {
        loading.value = false;
      }
    };

    const seleccionarCategoria = async (categoriaId) => {
      categoriaSeleccionada.value = categoriaSeleccionada.value === categoriaId ? null : categoriaId;

      if (categoriaSeleccionada.value) {
        try {
          const productosPorCategoria = await ProductoService.getProductosByCategoria(categoriaSeleccionada.value);
          productos.value = productosPorCategoria.map(p => ({
            id: p.productoId,
            nombre: p.nombre,
            precio: p.precio,
            descripcion: p.descripcion,
            disponibilidad: p.disponibilidad,
            imagen: p.imagenes?.[0] || 'https://via.placeholder.com/150'
          }));
        } catch {
          Notificar.error('No se pudieron cargar los productos de la categoría');
        }
      } else {
        await inicializarDatos();
      }
    };

    const toggleCarrito = () => {
      carritoVisible.value = !carritoVisible.value;
      const carritoDiv = document.querySelector('.container-carrito-datos');
      if (carritoDiv) carritoDiv.style.display = carritoVisible.value ? 'block' : 'none';
    };

    const verProducto = async (producto) => {
      console.log('ver producto:', producto);
      // Abrir modal acá
    };

    const agregarAlCarrito = async (producto) => {
      try {
        const itemExistente = carritoItems.value.find(item => item.productoId === producto.id);
        if (itemExistente) {
          itemExistente.cantidad += 1;
        } else {
          carritoItems.value.push({
            id: Date.now(),
            productoId: producto.id,
            producto,
            cantidad: 1,
            precio: producto.precio
          });
        }

        const usuarioId = localStorage.getItem('usuarioId');
        if (usuarioId) {
          if (!carrito.value) carrito.value = await CarritoService.crearCarritoParaUsuario(usuarioId);
          await CarritoService.agregarItemAlCarrito(carrito.value.id, producto.id, 1);
          carritoItems.value = await CarritoService.getItemsByCarrito(carrito.value.id);
        }

        Notificar.exito('Producto agregado correctamente', 3);

      } catch (error) {
        Notificar.error('Error al cargar producto al carrito', 3);
      }
    };

    const buscarProductos = async () => {
      if (!terminoBusqueda.value) return inicializarDatos();
      try {
        const resultados = await ProductoService.buscarProductos(terminoBusqueda.value);
        productos.value = resultados.map(p => ({
          id: p.productoId,
          nombre: p.nombre,
          precio: p.precio,
          descripcion: p.descripcion,
          disponibilidad: p.disponibilidad,
          imagen: p.imagenes?.[0] || 'https://via.placeholder.com/150'
        }));
      } catch {
        Notificar.error('No se pudieron buscar los productos');
      }
    };

    onMounted(() => {
      inicializarDatos();
    });

    return {
      usuarioLogueado,
      productos,
      categorias,
      carrito,
      carritoItems,
      carritoVisible,
      loading,
      categoriaSeleccionada,
      carritoCount,
      carritoTotal,
      terminoBusqueda,
      inicializarDatos,
      seleccionarCategoria,
      toggleCarrito,
      verProducto,
      agregarAlCarrito,
      buscarProductos
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap');

.main-view-background {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.hero-banner-container {
  background-image: url('../assets/imagen_fondo_principal.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  min-height: 500px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  padding: 0 5%;
}

.hero-banner-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.25);
}

.hero-content {
  max-width: 500px;
  color: white;
  z-index: 10;
  text-align: left;
}

.hero-title {
  font-family: 'Permanent Marker', sans-serif;
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.search-form-container {
  display: flex;
  justify-content: center;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.input-group {
  display: flex;
  width: 100%;
  max-width: 400px;
}

.address-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
  outline: none;
}

.find-food-button {
  background-color: #ff9900;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 0 4px 4px 0;
  transition: background-color 0.2s;
}

.find-food-button:hover {
  background-color: #e08c00;
}

.titulo-productos {
  color: #ff9900;
  font-weight: 700;
  font-size: 2.5rem;
}

.titulo-categorias {
  color: #ff9900;
  font-size: 2rem;
}

.category-section {
  margin-top: 100px;
  text-align: center;
}

.category-list-wrapper {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 10px 15px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.category-list-wrapper::-webkit-scrollbar {
  display: none;
}

.category-item {
  min-width: 180px;
  max-width: 220px;
  margin: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.category-item:hover {
  transform: translateY(-5px);
}

.category-image {
  width: 150px;
  height: auto;
  max-height: 150px;
  object-fit: contain;
  margin-bottom: 12px;
  transition: transform 0.3s ease;
}

.category-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
}

.category-item:hover .category-image {
  transform: scale(1.2);
}

.navbar {
  background-color: rgba(73, 32, 5, 0.58);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1030;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  .titulo-productos {
    font-size: 2rem;
  }
  .titulo-categorias {
    font-size: 1.5rem;
  }
  .category-image {
    width: 100px;
    max-height: 100px;
  }
  .category-item {
    min-width: 140px;
    max-width: 160px;
  }
  .category-name {
    font-size: 1rem;
  }
  .category-item:hover .category-image {
    transform: scale(1.1);
  }
}
</style>