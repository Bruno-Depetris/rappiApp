<script>
import AdminLogin from './view/AdminLogin.vue'
import AdminView from './view/AdminView.vue'
import { AdministradorService } from '../private/services/administradorService.js'

export default {
  name: 'App',
  components: { AdminLogin, AdminView },
  data() {
    return {
      isLoggedIn: false
    }
  },
  created() {
    // Si hay un token guardado, mostrar el Dashboard directamente
    const token = AdministradorService.obtenerToken()
    this.isLoggedIn = !!token
  },
  methods: {
    handleLoginSuccess() {
      this.isLoggedIn = true
    },
    handleLogout() {
      AdministradorService.logout() // si tenés un método para borrar token
      this.isLoggedIn = false
    }
  }
}
</script>

<template>
  <div>
    <AdminLogin v-if="!isLoggedIn" @login-success="handleLoginSuccess" />
    <AdminView v-else @logout="handleLogout" />
  </div>
</template>



<style scoped>
html {
  padding: 0;
  margin: 0;
}
</style>
