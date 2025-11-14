<template>
  <div v-if="loading" class="auth-guard-loading">
    <div class="loading-spinner"></div>
    <p>Verificando autenticación...</p>
  </div>
  <slot v-else />
</template>

<script>
import { UsuarioService } from '../../private/services/usuarioService';

export default {
  name: 'AuthGuard',
  props: {
    roles: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: true
    };
  },
  async mounted() {
    await this.verificarAcceso();
  },
  methods: {
    async verificarAcceso() {
      try {
        if (!UsuarioService.estaAutenticado()) {
          this.$router.push('/login');
          return;
        }

        const userRole = UsuarioService.obtenerRol();
        
        if (this.roles.length > 0 && !this.roles.includes(userRole)) {
          const redirectPath = this.getRedirectByRole(userRole);
          this.$router.push(redirectPath);
          return;
        }

      } catch (error) {
        console.error('Error en verificación de acceso:', error);
        this.$router.push('/login');
      } finally {
        this.loading = false;
      }
    },
    
    getRedirectByRole(role) {
      switch(role) {
        case 'admin':
          return '/admin/dashboard';
        case 'vendedor':
          return '/vendedor/dashboard';
        case 'repartidor':
          return '/repartidor/pedidos';
        case 'cliente':
        default:
          return '/';
      }
    }
  }
};
</script>

<style>
.auth-guard-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>