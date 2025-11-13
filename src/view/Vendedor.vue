<template>
  <div class="contendor-vendedor">
    <h1>Vendedor</h1>

    <div class="contenedor-titulo-opciones">
      <h3>{{ nombreNegocio || "nombre no valido" }} cargando..</h3>
      <p>{{ estadoNegocio }}</p>
    </div>

    <div class="contenedor-mis-productos">
      <p>{{ nombreCategoria || "cargando categoria..." }}</p>

      <div class="productos-negocio">
        <div class="productos">
          <div v-if="loading" class="loading">Cargando productos...</div>
          <div
            v-else
            class="producto"
            v-for="producto in productos"
            :key="producto.id"
          >
            <img
              :src="productos.imagen || 'https://via.placeholder.com/240x200'"
              :alt="producto.nombre"
            />
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
    </div>
  </div>
</template>

<style></style>

<script>
import { AppServices, UsuarioService } from "../../private/services";
import { Producto } from "../../private/modules";
export default {
  data() {
    return {
      productos: [],
      nombreNegocio: " ",
      nombreCategoria: " ",
      estadoNegocio: null,
      vendedorID: null,
      prodNombre: [],
      prodPrecio: [],
      prodDescripcion: [],
      prodDisponibilidad: "",
    };
  },
  computed: {
    // carritoCount() {
    //   return this.carritoItems ? this.carritoItems.reduce((total, item) => total + item.cantidad, 0) : 0;
    // },
    // carritoTotal() {
    //   return this.carritoItems ? this.carritoItems.reduce((total, item) => total + (item.precio * item.cantidad), 0) : 0;
    // }
  },
  async mounted() {
    await this.inicializarDatos();
    await this.setearDatos();
  },
  methods: {
    async setearDatos() {
      try {
        this.productos = AppServices.producto.getById(
        //   AppServices.usuario.obtenerUsuarioId
        3
        );
        const prod = new Producto();
        
        // const producto = new Producto();
        // // Access individual product properties
        this.productos.forEach(prod => {
                prod.imagenes;
                prod.nombre;
                prod.precio;
                prod.descripcion;
                prod.disponibilidad;
        });

        console.log(prod.nombre)

        // Or access by index
        // const primerProducto = this.productos[0];
        // console.log(primerProducto.nombre);

        // Or find specific product
        // const productoBuscado = this.productos.find(p => p.id === someId);
      } catch {
        return console.log("error al obtener datos de los productos");
      }
    },
    async inicializarDatos() {},
  },
};
</script>
