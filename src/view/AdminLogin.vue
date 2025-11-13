<template>
  <div style="max-width:420px;margin:40px auto;padding:18px;border:1px solid #ddd;border-radius:6px;">
    <h2>Ingreso Administrador</h2>

    <div v-if="errors.length" style="background:#fee;padding:8px;border-radius:4px;margin-bottom:10px;color:#900">
      <ul style="margin:0;padding-left:18px">
        <li v-for="(e, idx) in errors" :key="idx">{{ e }}</li>
      </ul>
    </div>

    <form @submit.prevent="handleLogin">
      <div style="margin-bottom:10px">
        <label>Nombre</label>
        <input v-model="nombre" type="text" style="width:100%;padding:8px" :disabled="loading" />
      </div>

      <div style="margin-bottom:10px">
        <label>Contraseña</label>
        <input v-model="password" type="password" style="width:100%;padding:8px" :disabled="loading" />
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center">
        <small style="color:#666">Usá tu nombre de administrador y contraseña</small>
        <button :disabled="loading" style="padding:8px 12px">{{ loading ? 'Ingresando...' : 'Ingresar' }}</button>
      </div>
    </form>
  </div>
</template>

<script>
import { AdministradorService } from '../../private/services/administradorService';

export default {
  name: 'AdminLogin',
  data() {
    return {
      nombre: '',
      password: '',
      errors: [],
      loading: false
    };
  },
  methods: {
    async handleLogin() {
      this.errors = [];
      this.loading = true;
      try {
        const resp = await AdministradorService.login(this.nombre, this.password);

        // Si el servicio guardó el token/usuario, todo ok
        let token = AdministradorService.obtenerToken();
        if (!token && resp) {
          const possible = resp.access_token || resp.token || resp.data?.access_token || resp.data?.token;
          if (possible) AdministradorService.guardarToken(possible);
          const adminObj = resp.admin || resp.user || resp.data?.admin || resp.data?.user;
          if (adminObj) AdministradorService.guardarAdmin(adminObj);
        }

        token = AdministradorService.obtenerToken();
        if (!token) {
          this.errors = ['Credenciales incorrectas'];
          return;
        }

        if (window && window.navigateTo) {
          window.navigateTo('AdminView');
        } else {
          window.location.reload();
        }

      } catch (err) {
        console.error('Login admin error', err);
        this.errors = [err.message || 'Error al intentar ingresar'];
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap');

/* CONTENEDOR GENERAL */
.login-container {
  font-family: 'Oswald', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-image: url('../assets/imagen_fondo_principal.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

/* TARJETA DEL LOGIN */
.login-card {
  position: relative;
  z-index: 10;
  background: white;
  width: 90%;
  max-width: 420px;
  padding: 32px 28px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.login-card h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #ff9900;
}

/* ERRORES */
.error-box {
  background: #fee;
  border: 1px solid #fbb;
  border-radius: 8px;
  padding: 10px;
  color: #900;
  margin-bottom: 16px;
  text-align: left;
}

.error-box ul {
  margin: 0;
  padding-left: 18px;
}

/* FORMULARIO */
form {
  text-align: left;
}

label {
  display: block;
  font-weight: 700;
  color: #333;
  margin-bottom: 6px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #ff9900;
}

/* BOTÓN */
button {
  background-color: #ff9900;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
}

button:hover:not(:disabled) {
  background-color: #e08c00;
  transform: scale(1.05);
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* TEXTO INFORMATIVO */
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.form-footer small {
  color: #666;
}

/* RESPONSIVE */
@media (max-width: 500px) {
  .login-card {
    padding: 24px 18px;
  }

  .login-card h2 {
    font-size: 1.5rem;
  }

  button {
    padding: 8px 14px;
  }
}
</style>
