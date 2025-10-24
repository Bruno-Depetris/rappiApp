<template>
  <nav class="navbar navbar-expand-lg py-3">
    <div class="container-fluid">
      <!-- Título -->
      <router-link class="navbar-brand text-white fw-bold" to="/">
        <i class="bi bi-basket-fill me-2"></i>Rappi
      </router-link>

      <!-- Botón hamburguesa para móviles -->
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

      <!-- Menú -->
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
            <router-link class="nav-link d-flex align-items-center" to="/login">
              <i class="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "HeaderNav",
};
</script>

<style scoped>
.navbar {
  background-color: #ff6600; /* fondo naranja */
  border-bottom: 1px solid #e65c00;
}

.navbar-brand {
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  color: #fff !important;
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
</style>
