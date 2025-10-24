# Servicios de la Aplicación Rappi

Este directorio contiene todos los servicios individuales de la aplicación que utilizan el patrón CRUD Factory para operaciones estándar con la API.

## Estructura de Servicios

Cada servicio incluye:
- **Operaciones CRUD básicas**: `getAll()`, `getById()`, `create()`, `update()`, `delete()`
- **Métodos específicos**: Funcionalidades particulares de cada entidad

## Uso de Servicios

### Opción 1: Importación Individual (Recomendada)
```javascript
import { UsuarioService, ProductoService, CarritoService } from './private/services';

// Uso de operaciones CRUD
const usuarios = await UsuarioService.getAll();
const usuario = await UsuarioService.getById(1);
const nuevoUsuario = await UsuarioService.create(userData);

// Uso de métodos específicos
const loginResponse = await UsuarioService.login(email, password);
const productos = await ProductoService.getProductosByNegocio(negocioId);
```

### Opción 2: Objeto Central
```javascript
import { AppServices } from './private/services';

// Uso a través del objeto central
const usuarios = await AppServices.usuario.getAll();
const productos = await AppServices.producto.getProductosByCategoria(categoriaId);
```

### Opción 3: Uso Global (Si window.AppServices está disponible)
```javascript
// En el navegador después de cargar los servicios
const usuarios = await window.AppServices.usuario.getAll();
```

## Lista de Servicios Disponibles

### 🔐 Autenticación y Usuarios
- **UsuarioService**: Gestión de usuarios, login, registro
- **AdministradorService**: Funciones administrativas, dashboard
- **VendedorService**: Gestión de vendedores por negocio
- **RepartidorService**: Gestión de repartidores y asignaciones

### 🏪 Negocio y Productos
- **NegocioService**: Gestión de negocios, búsqueda, estados
- **ProductoService**: Gestión de productos, búsqueda, ofertas
- **CategoriaService**: Gestión de categorías y subcategorías
- **CategoriaProductoService**: Relaciones entre categorías y productos

### 🛒 Carrito y Pedidos
- **CarritoService**: Gestión del carrito de compras
- **CarritoItemService**: Gestión de items del carrito
- **PedidoService**: Gestión de pedidos, estados, confirmaciones
- **ItemPedidoService**: Gestión de items de pedidos

### 💰 Pagos y Promociones
- **MetodoPagoService**: Gestión de métodos de pago, validaciones
- **CuponService**: Gestión de cupones, validaciones, aplicaciones

### ❤️ Funcionalidades Adicionales
- **FavoritoService**: Gestión de productos favoritos

## Ejemplos de Uso Común

### Login de Usuario
```javascript
import { UsuarioService } from './private/services';

try {
  const response = await UsuarioService.login(email, password);
  console.log('Login exitoso:', response);
} catch (error) {
  console.error('Error en login:', error.message);
}
```

### Búsqueda de Productos
```javascript
import { ProductoService } from './private/services';

const productos = await ProductoService.buscarProductos('pizza');
const productosPopulares = await ProductoService.getProductosPopulares(5);
```

### Gestión del Carrito
```javascript
import { CarritoService, CarritoItemService } from './private/services';

// Obtener carrito del usuario
const carrito = await CarritoService.getCarritoByUsuario(usuarioId);

// Agregar producto al carrito
await CarritoItemService.agregarItemAlCarrito(carrito.id, productoId, cantidad);

// Calcular total
const total = await CarritoService.calcularTotalCarrito(carrito.id);
```

### Crear Pedido
```javascript
import { CarritoService, PedidoService } from './private/services';

// Convertir carrito a pedido
const pedido = await CarritoService.convertirCarritoAPedido(carritoId, metodoPagoId);

// Confirmar pedido
await PedidoService.confirmarPedido(pedido.id);
```

## Manejo de Errores

Todos los servicios lanzan errores descriptivos que deben ser manejados:

```javascript
try {
  const result = await UsuarioService.someMethod();
} catch (error) {
  console.error('Error:', error.message);
  // Manejar error apropiadamente
}
```

## Notas Importantes

1. **Todos los servicios usan el httpClient**: No necesitas manejar fetch manualmente
2. **CRUD automático**: Las operaciones básicas están disponibles en todos los servicios
3. **Tree shaking**: Solo se importan los servicios que realmente uses
4. **Consistencia**: Todos los servicios siguen el mismo patrón de diseño