// Exportaciones de servicios individuales
export { UsuarioService } from './usuarioService.js';
export { VendedorService } from './vendedorService.js';
export { RepartidorService } from './repartidorService.js';
export { AdministradorService } from './administradorService.js';
export { NegocioService } from './negocioService.js';
export { CategoriaService } from './categoriaService.js';
export { ProductoService } from './productoService.js';
export { CategoriaProductoService } from './categoriaProductoService.js';
export { PedidoService } from './pedidoService.js';
export { ItemPedidoService } from './itemPedidoService.js';
export { CarritoService } from './carritoService.js';
export { CarritoItemService } from './carritoItemService.js';
export { MetodoPagoService } from './metodoPagoService.js';
export { FavoritoService } from './favoritoService.js';
export { CuponService } from './cuponService.js';

// Importamos para el objeto central
import { UsuarioService } from './usuarioService.js';
import { VendedorService } from './vendedorService.js';
import { RepartidorService } from './repartidorService.js';
import { AdministradorService } from './administradorService.js';
import { NegocioService } from './negocioService.js';
import { CategoriaService } from './categoriaService.js';
import { ProductoService } from './productoService.js';
import { CategoriaProductoService } from './categoriaProductoService.js';
import { PedidoService } from './pedidoService.js';
import { ItemPedidoService } from './itemPedidoService.js';
import { CarritoService } from './carritoService.js';
import { CarritoItemService } from './carritoItemService.js';
import { MetodoPagoService } from './metodoPagoService.js';
import { FavoritoService } from './favoritoService.js';
import { CuponService } from './cuponService.js';

// Objeto central con todos los servicios (alternativa para uso global)
export const AppServices = {
  usuario: UsuarioService,
  vendedor: VendedorService,
  repartidor: RepartidorService,
  administrador: AdministradorService,
  negocio: NegocioService,
  categoria: CategoriaService,
  producto: ProductoService,
  categoriaProducto: CategoriaProductoService,
  pedido: PedidoService,
  itemPedido: ItemPedidoService,
  carrito: CarritoService,
  carritoItem: CarritoItemService,
  metodoPago: MetodoPagoService,
  favorito: FavoritoService,
  cupon: CuponService
};

// Para uso global (si es necesario)
if (typeof window !== 'undefined') {
  window.AppServices = AppServices;
}