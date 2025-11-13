<template> 
  <div>
    <HeaderNav
      v-if="$route.meta.requiresHeader !== false && $route.meta.requiresHeader !== undefined"
      :usuario-logueado="usuarioLogueado"
      :carrito-items="carritoItems"
      :carrito-visible.sync="carritoVisible"
    />
    <RouterView />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeaderNav from './components/HeaderNav.vue'
import { useRoute } from 'vue-router';

// Variables globales si las necesitás
const usuarioLogueado = ref(null)
const carritoItems = ref([])
const carritoVisible = ref(false)

const route = useRoute();
</script>

<style scoped>
</style>