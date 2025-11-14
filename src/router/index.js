import { createRouter, createWebHistory } from 'vue-router';
import { UsuarioService } from '../../private/services/usuarioService';

import LoginView from '../view/LogIn.vue';
import MainView from '../view/mainView.vue';
import VendedorView from '../view/Vendedor.vue';
import RepartidorView from '../view/RepartidorView.vue';
import AdminView from '../view/AdminView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/',
    name: 'Home',
    component: MainView
  },
  {
    path: '/vendedor/dashboard',
    name: 'VendedorDashboard',
    component: VendedorView
  },
  {
    path: '/repartidor/pedidos',
    name: 'RepartidorPedidos',
    component: RepartidorView
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminView
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

export default router;