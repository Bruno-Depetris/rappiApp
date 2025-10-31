<template>
  <div>
    <HeaderNav
      :usuario-logueado="usuarioLogueado"
      :carrito-items="carritoItems"
      :carrito-visible.sync="carritoVisible"
    />
    <RouterView />
  </div>
</template>

<script setup>
import HeaderNav from './components/HeaderNav.vue'
import { ref } from 'vue'

const usuarioLogueado = ref(null)
const carritoItems = ref([])
const carritoVisible = ref(false)
</script>

<style>
/* opcional: estilos globales */


</style>
