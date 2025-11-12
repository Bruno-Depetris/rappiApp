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
// import HelloWorld from './components/HelloWorld.vue'
import mainView from './view/mainView.vue';
</script>

<template>
  <mainView/>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
</template>

<style scoped>
</style>
