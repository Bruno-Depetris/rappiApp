# 🚀 Configuración API REAL - RappiApp

## ✅ Cambios Realizados

La aplicación ha sido configurada para funcionar **EXCLUSIVAMENTE** con la API real. Se han eliminado todos los fallbacks a datos mock.

### 🔧 Modificaciones Principales

#### 1. Configuración Global (`private/config/appConfig.js`)
```javascript
USE_MOCK_DATA: false, // FORZADO A FALSE - SOLO API REAL
```

- ✅ Cambiado de `true` a `false`
- ✅ Agregado comentario explicativo
- ✅ Agregadas nuevas funciones de manejo de errores API

#### 2. Cliente HTTP (`private/api/httpClient.js`)
**ANTES**: Sistema con fallback automático a datos mock
**AHORA**: Solo API real con manejo de errores robusto

- ✅ Eliminados todos los imports de `mockData.js`
- ✅ Removidos todos los `if (APP_CONFIG.USE_MOCK_DATA)`
- ✅ Eliminados todos los fallbacks `catch` que usaban datos mock
- ✅ Implementado manejo de errores descriptivo
- ✅ Agregado logging detallado de operaciones API

#### 3. Servicio de Usuario (`private/services/usuarioService.js`)
- ✅ Función `login()` actualizada para usar solo API real
- ✅ Función `register()` actualizada para usar solo API real
- ✅ Eliminada lógica de mock data en autenticación
- ✅ Mejorado manejo de errores y validación de respuestas

#### 4. Sistema de Notificaciones (`src/main.js`)
- ✅ Notificaciones expuestas globalmente en `window.Notificar`
- ✅ Disponibles para manejo de errores de API desde cualquier parte de la app

## 🌐 Configuración de API

### URL Base
```javascript
API_BASE_URL: "https://rapi-api-rest-production.up.railway.app/api"
```

### Endpoints Principales
- `POST auth/login` - Autenticación de usuarios
- `POST auth/register` - Registro de nuevos usuarios
- `GET productos` - Obtener productos
- `GET categorias` - Obtener categorías
- `GET negocios` - Obtener negocios
- `POST pedidos` - Crear pedidos
- Y más...

## 🔒 Autenticación

El sistema de autenticación ahora funciona completamente con la API:

1. **Login**: `POST auth/login` con email y password
2. **Respuesta esperada**:
```javascript
{
  access_token: "jwt_token_here",
  user: {
    id: 123,
    nombre: "Usuario",
    email: "usuario@email.com",
    rol: "Cliente|Vendedor|Repartidor|Administrador"
  }
}
```
3. **Token**: Se almacena en localStorage como `rappi_token`

## 📊 Manejo de Errores

### Tipos de Error Manejados
- ❌ **Error de Conexión**: No se puede conectar a la API
- ❌ **Error HTTP**: Status codes 400, 401, 404, 500, etc.
- ❌ **Error de Formato**: API no devuelve el formato esperado
- ❌ **Error de Token**: Token inválido o expirado

### Notificaciones de Error
Los errores se muestran al usuario mediante notificaciones visuales:
```javascript
// Ejemplo de error mostrado
window.Notificar.error("Error de conexión: No se pudo conectar a la API", 6000);
```

## 🚦 Estado Actual

### ✅ Funcionando Correctamente
- Configuración de API forzada
- Cliente HTTP sin fallbacks
- Manejo de errores robusto
- Sistema de notificaciones
- Autenticación real
- Aplicación ejecutándose en http://localhost:5173/

### 🔍 Para Verificar Funcionalidad
1. **Ejecutar la app**: `npm run dev`
2. **Intentar login**: Usar credenciales reales de la API
3. **Revisar console**: Los logs mostrarán todas las operaciones API
4. **Verificar errores**: Si la API está caída, se mostrarán errores claros

## 🛠️ Debugging y Logs

### Console Logs
Con `SHOW_DEBUG_LOGS: true` verás:
```
[DEBUG] 🌐 Llamando API GET productos
[DEBUG] ✅ GET productos exitoso [data...]
```

### En caso de error:
```
❌ Error en GET productos: HTTP 500: Internal Server Error
```

## 📝 Endpoints de Prueba

### Verificar Conexión
```javascript
// En la consola del navegador
fetch('https://rapi-api-rest-production.up.railway.app/api/productos')
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
  .catch(e => console.error('API Error:', e));
```

### Test de Login
```javascript
// En la consola del navegador
fetch('https://rapi-api-rest-production.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'test@test.com', password: '123456'})
})
  .then(r => r.json())
  .then(d => console.log('Login Response:', d))
  .catch(e => console.error('Login Error:', e));
```

## ⚠️ Importante

1. **No hay datos mock como fallback**: Si la API falla, la app mostrará errores claros
2. **Todos los datos vienen de la API**: No hay datos locales de prueba
3. **Requiere conectividad**: La app necesita conexión a internet para funcionar
4. **Tokens reales**: Los tokens de autenticación deben venir de la API real

## 🔄 Para volver a Modo Mock (si es necesario)

Si en algún momento necesitas volver al modo de desarrollo con datos mock:

```javascript
// En private/config/appConfig.js
USE_MOCK_DATA: true  // Cambiar a true
```

**Nota**: Tendrás que revertir los cambios en `httpClient.js` para que los fallbacks funcionen.

## 📞 Contacto de API

- **URL**: https://rapi-api-rest-production.up.railway.app/api
- **Documentación**: [Verificar con el equipo backend]
- **Estado del Servicio**: [Verificar disponibilidad]

---

**✅ CONFIGURACIÓN COMPLETADA**

La aplicación ahora funciona exclusivamente con la API real. Todos los datos, autenticación y operaciones CRUD se realizan a través de la API especificada.