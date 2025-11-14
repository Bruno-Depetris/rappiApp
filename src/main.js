import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importar las notificaciones y exponerlas globalmente
import { Notificar } from './utils/notificaciones.js'

// Exponer notificaciones en window para uso global
window.Notificar = Notificar;

// Importar utilidades de debug en desarrollo
if (import.meta.env.DEV) {
  import('./utils/debug.js').then(({ Debug }) => {
    window.Debug = Debug;
    console.log('🔧 Debug utilities loaded. Available commands:');
    console.log('  AUTH:');
    console.log('  - Debug.mostrarEstadoAuth() - Shows authentication state');
    console.log('  - Debug.limpiarAuth() - Clears authentication');
    console.log('  - Debug.simularLogin(email, rol) - Simulates login');
    console.log('  - Debug.probarTodosLosUsuarios() - Tests all user types');
    console.log('  CARRITO:');
    console.log('  - Debug.mostrarEstadoCarrito() - Shows cart state');
    console.log('  - Debug.agregarProductoAlCarrito(id, cantidad) - Add product to cart');
    console.log('  - Debug.vaciarCarritoDebug() - Empty cart');
    console.log('  - Debug.simularCompraCompleta() - Simulate complete purchase');
  });
}

const app = createApp(App)
app.use(router)
app.mount('#app')
