import { createRouter, createWebHistory } from 'vue-router';
import { UsuarioService } from '../../private/services/usuarioService';

import LoginView from '../view/LogIn.vue';
import MainView from '../view/mainView.vue';
import VendedorView from '../view/Vendedor.vue';
import RepartidorView from '../view/RepartidorView.vue';
import AdminView from '../view/AdminView.vue';
import Checkout from '../view/Checkout.vue';
import MisPedidos from '../view/MisPedidos.vue';
import Favoritos from '../view/Favoritos.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/',
    name: 'Home',
    component: MainView,
    meta: { requiresAuth: true }
  },
  {
    path: '/productos',
    name: 'Productos',
    component: MainView,
    meta: { requiresAuth: true }
  },
  {
    path: '/carrito',
    name: 'Carrito',
    component: MainView,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: { requiresAuth: true }
  },
  {
    path: '/mis-pedidos',
    name: 'MisPedidos',
    component: MisPedidos,
    meta: { requiresAuth: true }
  },
  {
    path: '/favoritos',
    name: 'Favoritos',
    component: Favoritos,
    meta: { requiresAuth: true }
  },
  {
    path: '/vendedor/dashboard',
    name: 'VendedorDashboard',
    component: VendedorView,
    meta: { requiresAuth: true }
  },
  {
    path: '/repartidor/pedidos',
    name: 'RepartidorPedidos',
    component: RepartidorView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de autenticación
router.beforeEach(async (to, from, next) => {
  console.log('🛡️ Router Guard - Navegando de', from.path, 'a', to.path);
  
  const token = localStorage.getItem('rappi_token');
  const user = localStorage.getItem('rappi_user');
  const isAuthenticated = token && user;
  
  console.log('🔍 Router - Estado auth:', {
    token: token ? 'Existe' : 'No existe',
    user: user ? 'Existe' : 'No existe',
    isAuthenticated
  });

  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('👤 Router - Usuario detectado:', {
        nombre: userData.nombre,
        email: userData.email,
        rol: userData.rol,
        estado: userData.estado
      });
    } catch (error) {
      console.error('❌ Router - Error al parsear usuario:', error);
    }
  }
  
  // Si no está autenticado y la ruta requiere autenticación
  if (!isAuthenticated && to.meta.requiresAuth) {
    console.log('❌ Router - No autenticado, redirigiendo a login');
    next('/login');
    return;
  }
  
  // Si no está autenticado y va a una ruta protegida (que no sea login)
  if (!isAuthenticated && to.path !== '/login') {
    console.log('❌ Router - No autenticado, forzando login');
    next('/login');
    return;
  }
  
  // Si está autenticado y va al login, redirigir según rol
  if (isAuthenticated && to.path === '/login') {
    try {
      const userData = JSON.parse(user);
      console.log('✅ Router - Usuario autenticado redirigiendo según rol:', userData.rol);
      
      switch (userData.rol) {
        case 'Administrador':
          console.log('➡️ Router - Redirigiendo admin a dashboard');
          next('/admin/dashboard');
          return;
        case 'Repartidor':
          console.log('➡️ Router - Redirigiendo repartidor a pedidos');
          next('/repartidor/pedidos');
          return;
        case 'Vendedor':
          console.log('➡️ Router - Redirigiendo vendedor a dashboard');
          next('/vendedor/dashboard');
          return;
        default:
          console.log('➡️ Router - Redirigiendo cliente a home');
          next('/');
          return;
      }
    } catch (error) {
      console.error('❌ Router - Error al parsear usuario:', error);
      // Si hay error al parsear el usuario, limpiar storage y ir al login
      localStorage.removeItem('rappi_token');
      localStorage.removeItem('rappi_user');
      next('/login');
      return;
    }
  }
  
  // Verificar autorización por ruta específica
  if (isAuthenticated && to.meta.requiresAuth) {
    try {
      const userData = JSON.parse(user);
      console.log('🔍 Router - Verificando acceso a ruta:', to.path, 'para rol:', userData.rol);
      
      // Verificar acceso a rutas específicas de roles
      if (to.path.startsWith('/admin/') && userData.rol !== 'Administrador') {
        console.log('❌ Router - Acceso denegado a admin, redirigiendo según rol');
        switch (userData.rol) {
          case 'Vendedor':
            next('/vendedor/dashboard');
            return;
          case 'Repartidor':
            next('/repartidor/pedidos');
            return;
          default:
            next('/');
            return;
        }
      }
      
      if (to.path.startsWith('/vendedor/') && userData.rol !== 'Vendedor') {
        console.log('❌ Router - Acceso denegado a vendedor, redirigiendo según rol');
        switch (userData.rol) {
          case 'Administrador':
            next('/admin/dashboard');
            return;
          case 'Repartidor':
            next('/repartidor/pedidos');
            return;
          default:
            next('/');
            return;
        }
      }
      
      if (to.path.startsWith('/repartidor/') && userData.rol !== 'Repartidor') {
        console.log('❌ Router - Acceso denegado a repartidor, redirigiendo según rol');
        switch (userData.rol) {
          case 'Administrador':
            next('/admin/dashboard');
            return;
          case 'Vendedor':
            next('/vendedor/dashboard');
            return;
          default:
            next('/');
            return;
        }
      }
      
    } catch (error) {
      console.error('❌ Router - Error al verificar autorización:', error);
    }
  }
  
  console.log('✅ Router - Permitiendo navegación a:', to.path);
  next();
});

export default router;