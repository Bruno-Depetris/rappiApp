<template>
<div>
    <!-- Navbar importada -->
    <HeaderNav
      :usuario-logueado="usuarioLogueado"
      :carrito-items="carritoItems"
      :carrito-visible.sync="carritoVisible"
    />

<!-- POR AHORA NO ME GUSTA EL RESULTADO  -->
    <!-- <div class="container-carrousel">
        <img :src="productos.length > 0 ? productos[0].imagen : 'https://via.placeholder.com/1200x400'" 
             :alt="productos.length > 0 ? productos[0].nombre : 'Producto destacado'" 
             id="imagenProductoTop">
    </div> -->

      <div class="hero-banner-container">
        <div class="hero-content">
            <h1 class="hero-title">¿Tenes Hambre?</h1>
            <p class="hero-subtitle">Encuentra los platos más cercanos a ti.</p>

            <div class="search-form-container">
                <div class="input-group">
                    <input type="text" placeholder="Busca un producto..." class="address-input">
                    <button class="find-food-button">Buscar Comida</button>
                </div>
            </div>
        </div>
    </div>
      <div class="container mt-4">
      <div class="row">
        <div
          class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
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
</div>
</template>

<script>
import HeaderNav from '../components/HeaderNav.vue';
import ProductCard from '../components/ProductCard.vue';

import { UsuarioService, ProductoService, CarritoService, CategoriaService } from '../../private/services';
import { Notificar } from "../utils/notificaciones";
export default {
  name: 'MainView',
  components: {
    HeaderNav,
    ProductCard
  },
  data() {
    return {
      usuarioLogueado: null,
      productos: [],
      categorias: [],
      carrito: null,
      carritoItems: [],
      carritoVisible: false,
      loading: true,
      notyf: null
    }
  },
  computed: {
    carritoCount() {
      return this.carritoItems ? this.carritoItems.reduce((total, item) => total + item.cantidad, 0) : 0;
    },
    carritoTotal() {
      return this.carritoItems ? this.carritoItems.reduce((total, item) => total + (item.precio * item.cantidad), 0) : 0;
    }
  },
  async mounted() {
    //esto estaria bueno crear en utils las notificaciones esta que sea mas simple
    // YA LO HICE
    await this.inicializarDatos();
  },
  methods: {
    async inicializarDatos() {
      try {
        this.loading = true;
        
        // datos de prueba porque mauricio rompio el backennd y ahora no puedo mostrar nada 5 PALABRAS CRACK
        this.productos = [
          {
            id: 1,
            nombre: "CACHORRO CHUPETAO",
            precio: 10000000000000000000000000,
            imagen: "https://imgs.search.brave.com/BiyEV_PxDqG8SH04N9GSnY0s2lBrDArJIe81Ny4QfYM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2FmLzgy/LzBhL2FmODIwYTA0/ZWI5MjdlNmUwNWEw/ZDVhMzU2OGE0MDNl/LmpwZw"
          },
          {
            id: 2,
            nombre: "LA CHABONA",
            precio: 2.50,
            imagen: "https://imgs.search.brave.com/nLCzrlw5ZcGh4v3mfncgo57aVXO7jpcaif9tGYCuioo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5haXJlZGVzYW50/YWZlLmNvbS5hci9w/LzZmMzkzMDk0MDdm/OTBlMDc4YWQ2MWFk/ZjIxYWJkNzdjL2Fk/anVudG9zLzI2OC9p/bWFnZW5lcy8wMDIv/ODQxLzAwMDI4NDE3/MjkvbGEtY2hhYm9u/YS1mdWUtZGVzY3Vi/aWVydGEtbG9zLWJl/c29zLXktbXV5LWhv/dC11bi1mYW1vc28t/aW5mbHVlbmNlci5w/bmc"
          },
          {
            id: 3,
            nombre: "LA PATO BULLRICH",
            precio: 3000,
            imagen: "https://imgs.search.brave.com/Yembk27qmfJgO1WNgwwY3YiTKB7AEFKJh75vJ8Q2UPg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4x/LmVsZGlhLmNvbS8w/NzIwMTkvMTU2MjE3/NTg1NzAwMC5qcGc"
          },
          {
            id: 4,
            nombre: "MILEI",
            precio: 1234,
            imagen: "https://imgs.search.brave.com/7u98zviMKJDU_hfVneN2H1-Dcb0NppaodcA5AkBdJ_8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2xhcmluLmNvbS9p/bWcvMjAyNC8wNS8z/MC85Rl80cWJWdTBo/XzIwMDB4MTUwMF9f/MS5qcGc"
          }
        ];
        
        // si ANDARA se mueve acaDAW
        try {
          const usuarioId = localStorage.getItem('usuarioId');
          if (usuarioId) {
            const usuario = await UsuarioService.getById(usuarioId);
            this.usuarioLogueado = usuario.nombre;
            
            this.carrito = await CarritoService.getCarritoByUsuario(usuarioId);
            if (this.carrito) {
              this.carritoItems = await CarritoService.getItemsByCarrito(this.carrito.id);
            }
          }
          
          const productosReales = await ProductoService.getProductosPopulares(8);
          if (productosReales && productosReales.length > 0) {
            this.productos = productosReales;
          }
          
          this.categorias = await CategoriaService.getCategoriasActivas();
          
        } catch (apiError) {
          
          Notificar.error('SI LEES ESTO mauri rompio la api xd',10)
          Notificar.error('por eso ves esos datos WASAAA',10)
        }
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        if (this.notyf) {
          this.notyf.error('❌ Error al cargar los datos');
        }
      } finally {
        this.loading = false;
        
        Notificar.exito('BIENVENIDO A RAPPI :)')
      }
    },

    

    
    
    toggleCarrito() {
      this.carritoVisible = !this.carritoVisible;
      const carritoDiv = document.querySelector('.container-carrito-datos');
      carritoDiv.style.display = this.carritoVisible ? 'block' : 'none';
    },
    
    async verProducto(producto) {
      console.log('ver producto:', producto);
      
    // ACA SE ABRIRIA EL MODAL
    },
    
    async agregarAlCarrito(producto) {
      try {
        //simular
        if (!this.carritoItems) {
          this.carritoItems = [];
        }
        
        const itemExistente = this.carritoItems.find(item => item.productoId === producto.id);
        
        if (itemExistente) {
          itemExistente.cantidad += 1;
        } else {
          this.carritoItems.push({
            id: Date.now(),
            productoId: producto.id,
            producto: producto,
            cantidad: 1,
            precio: producto.precio
          });
        }
        
        Notificar.exito('producto agretgado correctamente ',123) //hija de puta duras lo que queres
        // si el servicio anda se usa esto
        try {
          const usuarioId = localStorage.getItem('usuarioId');
          if (usuarioId) {
            if (!this.carrito) {
              this.carrito = await CarritoService.crearCarritoParaUsuario(usuarioId);
            }
            
            await CarritoService.agregarItemAlCarrito(this.carrito.id, producto.id, 1);
            this.carritoItems = await CarritoService.getItemsByCarrito(this.carrito.id);
            
            Notificar.exito('api funcionando',10)
          }
        } catch (apiError) {
            Notificar.exito('api sin funcionar (pq mauri rompe todo) y usa lo que creo bruno xd',1330)

        }
        
      } catch (error) {
        Notificar.error('Error al cargar producto al carro',10)
      }
    }
  }

}
</script>

<style>
/* Estilos para la sección superior */
.hero-banner-container {
    /* **ESTO ES LO QUE CAMBIA** */
    /* Asegúrate de que esta ruta sea correcta después de que el proyecto se compile. */
    background-image: url('../assets/imagen_fondo_principal.jpg'); 
    background-size: cover; /* Asegura que la imagen cubra todo el contenedor */
    background-position: center; /* Centra la imagen */
    background-repeat: no-repeat; /* Evita que la imagen se repita */
    /* -------------------------- */
    
    height: 400px; 
    display: flex;
    align-items: center; 
    justify-content: flex-start; 
    padding: 0 5%;
    position: relative; 
    overflow: hidden; 
}

/* Puedes añadir un sombreado oscuro (overlay) para que el texto blanco resalte más */
.hero-banner-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.25); /* Tono oscuro de 25% */
}

/* Estilos para el texto y el formulario */
.hero-content {
    max-width: 500px; /* Limita el ancho del texto y formulario */
    color: white; /* Color del texto */
    z-index: 10; /* Asegura que el contenido esté sobre el fondo/imagen */
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
}

.hero-subtitle {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
}

/* Estilos para el formulario de búsqueda */
.search-form-container {
    background-color: none;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.tabs {
    display: flex;
    margin-bottom: 10px;
}

.tab-button {
    background: none;
    border: none;
    padding: 8px 15px;
    cursor: pointer;
    font-weight: bold;
    color: #6c757d;
}

.tab-button.active {
    background-color: #ffcc99; /* Fondo suave para la pestaña activa */
    border-radius: 6px;
    color: #ff9900;
}

.input-group {
    display: flex;
    align-items: center;
}

.address-input {
    flex-grow: 1; /* Ocupa el espacio restante */
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px 0 0 4px; /* Esquinas solo en la izquierda */
    font-size: 1rem;
    outline: none; /* Quita el borde de enfoque por defecto */
}

.find-food-button {
    background-color: #ff9900; /* Botón naranja */
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: bold;
    border-radius: 0 4px 4px 0; /* Esquinas solo en la derecha */
    transition: background-color 0.2s;
}

.find-food-button:hover {
    background-color: #e08c00; /* Naranja más oscuro al pasar el ratón */
}

/* Estilo para la imagen de la comida (Opcional, requiere ajustes de posicionamiento) */
.hero-food-image {
    position: absolute;
    right: 5%; /* Posiciona a la derecha */
    top: 50%; /* Centra verticalmente */
    transform: translateY(-50%);
    width: 300px; /* Tamaño de la imagen de comida */
    border-radius: 50%; /* Si quieres que sea circular */
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}
</style>