<template>
<div>
    <nav class="nav-bar">
        <button class="container-user">
            <i class="material-icons">person</i>
            <p>{{ usuarioLogueado || 'Bruno Depetris' }}s</p>
            <p>Usuario</p>
        </button>

        <button><span class="material-icons">newspaper</span> Novedades </button>
        <button><span class="material-icons">category</span> Categorias </button>
        <button @click="mostrarEjemplosNotificaciones"><span class="material-icons">notifications</span> Notificaciones </button>


        <div class="container-carrito">
            <button @click="toggleCarrito">
                <span class="material-icons">shopping_cart</span>
                <span v-if="carritoCount > 0" class="carrito-badge">{{ carritoCount }}</span>
            </button>

            <div class="container-carrito-datos" style="display: none;">
                <label for="">Productos</label>
                <div v-if="carritoItems.length > 0">
                    <div v-for="item in carritoItems" :key="item.id" class="carrito-item">
                        <p>{{ item.producto.nombre }} x{{ item.cantidad }}</p>
                        <p>${{ (item.precio * item.cantidad).toFixed(2) }}</p>
                    </div>
                    <div class="carrito-total">
                        <strong>Total: ${{ carritoTotal.toFixed(2) }}</strong>
                    </div>
                </div>
                <p v-else>todavia no hay productos...</p>
            </div>
        </div>

    </nav>

<!-- POR AHORA NO ME GUSTA EL RESULTADO  -->
    <!-- <div class="container-carrousel">
        <img :src="productos.length > 0 ? productos[0].imagen : 'https://via.placeholder.com/1200x400'" 
             :alt="productos.length > 0 ? productos[0].nombre : 'Producto destacado'" 
             id="imagenProductoTop">
    </div> -->


    <div class="container-ultimos-productos">
        <div v-if="loading" class="loading">Cargando productos...</div>
        <div v-else class="producto" v-for="producto in productos" :key="producto.id">
            <img :src="producto.imagen || 'https://via.placeholder.com/240x200'" :alt="producto.nombre">
            <p>{{ producto.nombre }} - ${{ producto.precio }}</p>
            <div class="producto-actions">
                <button @click="verProducto(producto)">
                    <span class="material-icons">visibility</span>Ver
                </button>
                <button @click="agregarAlCarrito(producto)" class="btn-agregar">
                    <span class="material-icons">add_shopping_cart</span>Agregar
                </button>
            </div>
        </div>
    </div>


</div>
</template>

<script>
import { UsuarioService, ProductoService, CarritoService, CategoriaService } from '../../private/services';
import { Notificar } from "../utils/notificaciones";
export default {
  name: 'MainView',
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
        
        try {
          
          const usuarioId = localStorage.getItem('usuarioId');
          if (usuarioId) {
            const usuario = await UsuarioService.getById(usuarioId);
            this.usuarioLogueado = usuario.nombre;
            
            this.carrito = await CarritoService.getById(usuarioId);
            
            if (this.carrito) {
              this.carritoItems = await CarritoService.getItemsByCarrito(this.carrito.id);
            }
          }
          

          const productosReales = await ProductoService.getAll();
          
          if (productosReales && productosReales.length > 0) {
            this.productos = productosReales;
          }
          this.categorias = await CategoriaService.getCategoriasActivas();
          
        } catch (apiError) {
          
          Notificar.error('SI LEES ESTO mauri rompio la api en alguna parte xd',10)
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

<style >
body{
    background: #fafafa;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    overflow-x: hidden;
}

.nav-bar {
    background: white;
    border-radius: 1rem;
    border-bottom: 1px solid #e0e0e0;
    margin: 0;
    padding: 16px 32px;
    display: flex;
    gap: 2rem;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    padding: 0px 10px 10px 10px;
    box-shadow: 0px 10px 22px 1px rgba(255, 0, 0, 0.123);
}

.nav-bar button {
    background: none;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    color: #333;
    font-weight: 400;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    transition: 0.5s all;
}

.nav-bar button:hover {
    background-color:#e0e0e0;
    transform: scale(1.2);
}

.container-user {
    background: none;
    border-radius: 4px;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    cursor: pointer;
    transition: 0.5s all;

}

.container-user:hover {
    border-color: #333;
}

.container-user p {
    margin: 0;
    color: #333;
    font-weight: 400;
    font-size: 13px;
}

.container-user .material-icons {
    font-size: 30px;
    color: #666;
}

.material-icons {
    font-size: 20px;
    color: #666;
}

.container-carrito {
    position: relative;
}

.container-carrito button {
    background: none;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    width: 40px;
    height: 40px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.5s all;
}

.container-carrito button:hover {
    background-color:#e0e0e0;
    transform: scale(1.2);
    rotate: 20deg;
}

.container-carrito-datos {
    position: absolute;
    top: 50px;
    right: 0;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 16px;
    min-width: 280px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    z-index: 1000;
}

.container-carrito-datos label {
    font-weight: 500;
    color: #333;
    font-size: 14px;
    display: block;
    margin-bottom: 12px;
}

.container-carrito-datos p {
    color: #666;
    margin: 8px 0;
    font-size: 13px;
}

.container-carrousel {
    max-width: 1200px;
    margin: 32px auto;
    border-radius: 0;
    overflow: hidden;
    border: 1px solid #e0e0e0;
    height: 400px;
    background: #f5f5f5;
}

.container-carrousel img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.container-ultimos-productos {
    max-width: 1200px;
    margin: 40px auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
    padding: 0 32px;
}

.producto {
    
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 1rem;
    overflow: hidden;
    transition: border-color 0.2s ease;
    display: flex;
    flex-direction: column;

    transition: 0.6s all;
}

.producto:hover {
    transform: scale(1.1);
    border-color: #333;
}

.producto img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-bottom: 1px solid #e0e0e0;
}

.producto p {
    padding: 16px;
    color: #333;
    font-weight: 400;
    font-size: 14px;
    flex-grow: 1;
    margin: 0;
}

.producto button {
    background: white;
    border: none;
    border-top: 1px solid #e0e0e0;
    border-radius: 0;
    padding: 12px;
    color: #333;
    font-weight: 400;
    cursor: pointer;
    transition: background 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 13px;
}

.producto button:hover {
    background: #fafafa;
}

.producto button .material-icons {
    font-size: 18px;
}

.carrito-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ff4444;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.carrito-item {
    border-bottom: 1px solid #eee;
    padding: 8px 0;
}

.carrito-total {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 2px solid #333;
}

.producto-actions {
    display: flex;
    gap: 0;
}

.producto-actions button {
    flex: 1;
}

.btn-agregar {
    background: #007bff !important;
    color: white !important;
}

.btn-agregar:hover {
    background: #0056b3 !important;
}

.loading {
    text-align: center;
    padding: 40px;
    font-size: 18px;
    color: #666;
}
</style>