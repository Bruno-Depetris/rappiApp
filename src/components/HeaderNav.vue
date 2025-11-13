<template>
  <nav class="navbar navbar-expand-lg py-3">
    <div class="container-fluid">
      <router-link class="navbar-brand text-white fw-bold" to="/">
        <i class="bi bi-basket-fill me-2"></i>Rappi
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item mx-2">
            <router-link class="nav-link d-flex align-items-center" to="/perfil">
              <i class="bi bi-person-fill me-1"></i>Perfil
            </router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link d-flex align-items-center" to="/pedidos">
              <i class="bi bi-card-list me-1"></i>Pedidos
            </router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link d-flex align-items-center" to="/mis-compras">
              <i class="bi bi-bag-check-fill me-1"></i>Mis Compras
            </router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link d-flex align-items-center" to="/carrito">
              <i class="bi bi-cart-fill me-1"></i>Carrito
            </router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link d-flex align-items-center" to="/favoritos">
              <i class="bi bi-heart-fill me-1"></i>Favoritos
            </router-link>
          </li>
          <li class="nav-item mx-2">
            <a 
              class="nav-link d-flex align-items-center" 
              href="#" 
              @click.prevent="cerrarSesion"
            >
              <i class="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { useRouter } from 'vue-router'; // Importamos useRouter para navegar

export default {
  name: "HeaderNav",
  setup() {
    const router = useRouter();

    const cerrarSesion = () => {
      // 1. ELIMINAR CREDENCIALES
      // Borrar el token y cualquier ID de usuario del almacenamiento local
      localStorage.removeItem('rappi_token');
      localStorage.removeItem('usuarioId'); 
      localStorage.removeItem('rappi_usuario'); // Si también guardas el objeto usuario completo

      // 2. NAVEGAR AL LOGIN
      // Redirigir al usuario a la vista de login
      router.push({ name: 'Login' });
    };

    return {
      cerrarSesion, // Hacemos el método disponible en el template
    };
  },
};
</script>

<style scoped>
/* Tu CSS se mantiene igual */
.navbar {
  background-color: #7b421c00; /* fondo naranja */
  backdrop-filter: blur(10px);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 2000;
  border-radius: 0rem 0rem 12px 12px;
}

.navbar-brand {
  font-size: 1.6rem;
  display: flex;
  align-items: left;
  color: #fff !important;
  
  position: absolute;
  left: 2%;
}


.nav-link {
  font-weight: 500;
  color: #fff !important;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #ffe5d0 !important; /* hover más claro */
  transform: scale(1.05);
}

.navbar-toggler {
  border-color: rgba(255, 255, 255, 0.5);
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba%28255, 255, 255, 0.7%29' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
}

.container-fluid {
  padding-right: 10px; /* más espacio a la derecha */
  padding-left: 50px; /* opcional, por simetría */
}
</style>