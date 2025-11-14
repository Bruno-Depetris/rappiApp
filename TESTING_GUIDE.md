# Guía para Probar los Diferentes Tipos de Usuarios

## Usuarios de Prueba Disponibles

He agregado usuarios específicos para cada rol en la aplicación:

### 1. **Cliente**
- **Email:** `cliente@test.com`
- **Contraseña:** `123456`
- **Redirege a:** `/` (página principal)

### 2. **Vendedor**  
- **Email:** `vendedor@test.com`
- **Contraseña:** `123456`
- **Redirge a:** `/vendedor/dashboard`

### 3. **Repartidor**
- **Email:** `repartidor@test.com`
- **Contraseña:** `123456`
- **Redirge a:** `/repartidor/pedidos`

### 4. **Administrador**
- **Email:** `admin@test.com`
- **Contraseña:** `123456`
- **Redirge a:** `/admin/dashboard`

## Cómo Probar

### Opción 1: Botones de Login Rápido
En la pantalla de login, hay botones para hacer login automático con cada tipo de usuario:
- Haz clic en "Cliente", "Vendedor", "Repartidor" o "Admin"
- Se completará automáticamente el formulario y se realizará el login

### Opción 2: Login Manual
1. Introduce el email y contraseña de cualquiera de los usuarios de arriba
2. Haz clic en "Iniciar Sesión"

### Opción 3: Herramientas de Debug
Abre la consola del navegador (F12) y usa estos comandos:

```javascript
// Ver el estado actual de autenticación
Debug.mostrarEstadoAuth()

// Limpiar autenticación
Debug.limpiarAuth()

// Simular login directo
Debug.simularLogin('admin@test.com', 'Administrador')
Debug.simularLogin('vendedor@test.com', 'Vendedor')
Debug.simularLogin('repartidor@test.com', 'Repartidor')
Debug.simularLogin('cliente@test.com', 'Cliente')

// Probar todos los tipos de usuario automáticamente
Debug.probarTodosLosUsuarios()
```

## Qué Esperarías Ver

### Cliente (`cliente@test.com`)
- Redirección a la página principal (`/`)
- Vista de productos y categorías
- Opción de agregar al carrito
- Ver favoritos y pedidos

### Vendedor (`vendedor@test.com`)  
- Redirección a `/vendedor/dashboard`
- Panel para gestionar productos
- Ver pedidos de su negocio
- Gestionar información del negocio

### Repartidor (`repartidor@test.com`)
- Redirección a `/repartidor/pedidos`  
- Lista de pedidos disponibles para entregar
- Estado (Disponible/No Disponible)
- Pedidos asignados en camino

### Administrador (`admin@test.com`)
- Redirección a `/admin/dashboard`
- Dashboard con estadísticas generales
- Gestión de usuarios, negocios y categorías
- Panel administrativo completo

## Troubleshooting

Si no funciona correctamente:

1. **Abre la consola del navegador (F12)**
2. **Usa el comando:** `Debug.mostrarEstadoAuth()`
3. **Verifica que aparezcas logs como:**
   ```
   🔍 ESTADO DE AUTENTICACIÓN
   🔑 Token en localStorage: EXISTE
   👤 Usuario en localStorage: EXISTE
   🎯 Rol del usuario: [TU_ROL]
   ```

4. **Si no hay token o usuario, ejecuta:** `Debug.limpiarAuth()`
5. **Luego intenta login nuevamente**

## Logs de Debug

La aplicación ahora muestra logs detallados en la consola:
- 🚀 Proceso de login
- 🛡️ Guards de router  
- ➡️ Redirecciones por rol
- ✅ Verificaciones de autenticación
- ❌ Errores y problemas

**Para ver estos logs, mantén abierta la consola del navegador mientras navegas.**