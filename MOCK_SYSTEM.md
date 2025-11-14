# 🔧 Sistema de Datos Mock - RappiApp

## 📖 Descripción General

La aplicación RappiApp incluye un sistema completo de datos mock que permite desarrollo y pruebas sin necesidad de una API backend funcionando. Este sistema simula completamente la funcionalidad de la API real.

## ⚙️ Configuración

### Activar/Desactivar Datos Mock

En el archivo `private/config/appConfig.js`:

```javascript
export const APP_CONFIG = {
  USE_MOCK_DATA: true, // Cambiar a false para usar API real
  // ... otras configuraciones
};
```

### Control de Logs de Desarrollo

```javascript
DEV: {
  SHOW_DEBUG_LOGS: true,      // Mostrar logs de debug
  SHOW_MOCK_NOTIFICATIONS: true, // Mostrar notificaciones de mock
  SIMULATE_NETWORK_DELAY: true   // Simular delay de red
}
```

## 📊 Datos Disponibles

### Usuarios Mock
- **Cliente**: Juan Pérez (juan@ejemplo.com)
- **Vendedor**: María García (maria@vendor.com) 
- **Repartidor**: Carlos López (carlos@delivery.com)
- **Administrador**: Admin Sistema (admin@sistema.com)

### Negocios Mock
- **Pizzería Don Luigi** - Comida Rápida
- **Café Central** - Café y Bebidas

### Productos Mock
- Pizza Margherita ($12.99) - Stock: 15
- Pizza Pepperoni ($14.99) - Stock: 8
- Café Americano ($3.50) - Stock: 50
- Croissant de Chocolate ($4.25) - Sin stock

### Pedidos Mock
- Pedido #1: Estado "Pendiente" - Total $27.98
- Pedido #2: Estado "EnCamino" - Total $14.99

## 🔄 Funcionalidades Mock

### CRUD Completo
- ✅ **GET** - Obtener datos (listas e individuales)
- ✅ **POST** - Crear nuevos elementos
- ✅ **PUT** - Actualizar elementos existentes
- ✅ **DELETE** - Eliminar elementos

### Características Especiales
- **Delay de Red Simulado**: 200-700ms para GET, 100-500ms para otras operaciones
- **IDs Automáticos**: Generación automática de IDs únicos
- **Persistencia de Sesión**: Los datos se mantienen durante la sesión del navegador
- **Validaciones**: Validación de estados, roles y tipos de datos
- **Filtros**: Búsquedas y filtros funcionales por vendedor, estado, etc.

## 🛠️ Funciones de Utilidad

### ConfigUtils
```javascript
import { ConfigUtils } from './private/config/appConfig.js';

ConfigUtils.isUsingMockData()     // Verifica si usa datos mock
ConfigUtils.getApiUrl(endpoint)   // Obtiene URL completa de API
ConfigUtils.getAuthToken()        // Obtiene token de autenticación
ConfigUtils.showDebugLog(...)     // Log de debug condicionado
```

### Funciones Mock
```javascript
import { getMockData, getMockById, createMockData } from './private/data/mockData.js';

await getMockData('productos')           // Obtener todos los productos
await getMockById('productos', 1)        // Obtener producto con ID 1
await createMockData('productos', data)  // Crear nuevo producto
await updateMockData('productos', 1, data) // Actualizar producto
await deleteMockData('productos', 1)     // Eliminar producto
```

## 🔍 Debugging y Desarrollo

### Logs de Console
Cuando `SHOW_DEBUG_LOGS` está activado:
```
[DEBUG] 🔧 Usando datos mock para GET productos
[DEBUG] ✅ 4 productos cargados
[DEBUG] 🔧 Usando datos mock para POST productos
```

### Notificaciones Visuales
Las operaciones mock muestran notificaciones en pantalla:
- 💡 Información de desarrollo
- ✅ Operaciones exitosas
- ⚠️ Advertencias
- ❌ Errores

## 🚀 Transición a API Real

### Pasos para Migrar
1. **Configurar endpoints reales** en `appConfig.js`
2. **Cambiar flag**: `USE_MOCK_DATA: false`
3. **Actualizar autenticación** si es necesaria
4. **Probar conectividad** con la API real

### Fallback Automático
El sistema incluye fallback automático: si la API real falla, utiliza datos mock como respaldo.

```javascript
try {
  const res = await fetch(`${API_BASE}/${endpoint}`, { headers });
  return res.json();
} catch (error) {
  console.warn(`⚠️ API falló, usando datos mock`, error);
  return await getMockData(entity); // Fallback automático
}
```

## 📱 Compatibilidad

### Vistas Soportadas
- ✅ **MainView** - Dashboard de cliente
- ✅ **Vendedor** - Panel de vendedor
- ✅ **RepartidorView** - Interface de repartidor
- ✅ **AdminView** - Panel administrativo
- ✅ **LogIn** - Autenticación

### Servicios Mock
- ✅ **UsuarioService** - Gestión de usuarios
- ✅ **VendedorService** - Operaciones de vendedor
- ✅ **ProductoService** - Gestión de productos
- ✅ **PedidoService** - Gestión de pedidos
- ✅ **CategoriaService** - Gestión de categorías
- ✅ **NegocioService** - Gestión de negocios
- ✅ **RepartidorService** - Operaciones de reparto
- ✅ **AdministradorService** - Funciones administrativas

## 🏗️ Estructura de Archivos

```
private/
├── config/
│   └── appConfig.js         # Configuración principal
├── data/
│   └── mockData.js          # Datos de prueba
├── api/
│   ├── httpClient.js        # Cliente HTTP con mock
│   └── crudFactory.js       # Factory para operaciones CRUD
└── services/
    ├── usuarioService.js    # Servicios con mock integrado
    ├── vendedorService.js
    └── ... (otros servicios)
```

## ⚡ Performance

### Optimizaciones
- **Lazy Loading**: Los datos mock se cargan bajo demanda
- **Caching Simple**: Los datos se mantienen en memoria durante la sesión
- **Delays Realistas**: Simula condiciones de red reales
- **Error Handling**: Manejo robusto de errores con fallbacks

### Métricas Mock
- Tiempo de respuesta simulado: 100-700ms
- Datos en memoria: ~50KB
- Sin persistencia en localStorage (para evitar conflictos)
- Reset automático al recargar la página

## 🔧 Personalización

### Agregar Nuevos Datos
En `mockData.js`, agregar a la entidad correspondiente:

```javascript
export const mockData = {
  productos: [
    // ... productos existentes
    {
      id: 5,
      nombre: "Nuevo Producto",
      precio: 15.99,
      // ... otras propiedades
    }
  ]
};
```

### Crear Nuevas Entidades
```javascript
miNuevaEntidad: [
  {
    id: 1,
    nombre: "Ejemplo",
    // ... propiedades
  }
]
```

## 🐛 Troubleshooting

### Problemas Comunes

**Error: "negocios.find is not a function"**
- ✅ Solucionado: Validación de arrays en servicios

**Error: "GET pedidos 404"** 
- ✅ Solucionado: Sistema de fallback automático

**Imágenes no cargan**
- ✅ Solucionado: SVG integrados para placeholders

### Debug Steps
1. Verificar `USE_MOCK_DATA` en configuración
2. Revisar logs de console para errores
3. Comprobar estructura de datos en `mockData.js`
4. Validar nombres de entidades en endpoints

## 📈 Estado del Desarrollo

### Completado ✅
- Sistema básico de datos mock
- Integración con todos los servicios
- Fallback automático a mock
- Notificaciones de desarrollo
- Documentación completa

### Próximas Mejoras 🚧
- Persistencia opcional en localStorage
- Editor visual de datos mock
- Generador de datos aleatorios
- Métricas de uso de mock vs API real

---

**Nota**: Este sistema está diseñado para facilitar el desarrollo. En producción, asegúrate de configurar `USE_MOCK_DATA: false` para usar la API real.