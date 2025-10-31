// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Importar vistas
import mainView from '../view/mainView.vue'
import Perfil from '../view/Perfil.vue'
import Pedidos from '../view/Pedidos.vue'
import MisCompras from '../view/MisCompras.vue'
import Carrito from '../view/Carrito.vue'
import Favoritos from '../view/Favoritos.vue'
import Login from '../view/Login.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: mainView
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: Perfil
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    component: Pedidos
  },
  {
    path: '/mis-compras',
    name: 'MisCompras',
    component: MisCompras
  },
  {
    path: '/carrito',
    name: 'Carrito',
    component: Carrito
  },
  {
    path: '/favoritos',
    name: 'Favoritos',
    component: Favoritos
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/categoria/:id',
    name: 'CategoriaView',
    component: () => import('../view/CategoriaView.vue')
  }


]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
