<template>
  <div class="auth-view-background">
    <!-- Hero Section -->
    <div class="auth-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">¡Bienvenido!</h1>
        <p class="hero-subtitle">Tu comida favorita a un click de distancia</p>
      </div>
    </div>

    <div class="container auth-container">
      <div class="auth-card">

        <div class="tabs">
          <button 
            :class="['tab', { active: modo === 'login' }]"
            @click="cambiarModo('login')"
          >
            <span class="tab-icon"></span>
            <span>Iniciar Sesión</span>
          </button>
          <button 
            :class="['tab', { active: modo === 'register' }]"
            @click="cambiarModo('register')"
          >
            <span class="tab-icon"></span>
            <span>Registrarse</span>
          </button>
        </div>

        <div class="card-header">
          <h2 class="card-title">{{ modo === 'login' ? '¡Hola de nuevo!' : 'Crear Cuenta' }}</h2>
          <p class="card-subtitle">
            {{ modo === 'login' ? 'Ingresa tus datos para continuar' : 'Completa el formulario para registrarte' }}
          </p>
        </div>

        <div v-if="error" class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>

        <div v-if="success" class="alert alert-success">
          <span class="alert-icon">✓</span>
          <span>{{ success }}</span>
        </div>

        <form v-if="modo === 'login'" @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="login-email">
              <span class="label-icon"></span>
              Email
            </label>
            <input
              id="login-email"
              v-model="loginForm.email"
              type="email"
              placeholder="tu@email.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-group">
            <label for="login-password">
              <span class="label-icon"></span>
              Contraseña
            </label>
            <input
              id="login-password"
              v-model="loginForm.password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
          </div>

          <button 
            type="submit" 
            class="btn-submit"
            :disabled="cargando"
          >
            <span v-if="!cargando">
              <span>Iniciar Sesión</span>
              <span class="btn-arrow">→</span>
            </span>
            <span v-else class="loading-spinner">
              <span class="spinner"></span>
              Iniciando sesión...
            </span>
          </button>
        </form>

        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="register-nombre">
              <span class="label-icon">👤</span>
              Nombre Completo
            </label>
            <input
              id="register-nombre"
              v-model="registerForm.nombre"
              type="text"
              placeholder="Juan Pérez"
              autocomplete="name"
              required
            />
          </div>

          <div class="form-group">
            <label for="register-email">
              <span class="label-icon">📧</span>
              Email
            </label>
            <input
              id="register-email"
              v-model="registerForm.email"
              type="email"
              placeholder="tu@email.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="register-password">
                <span class="label-icon">🔒</span>
                Contraseña
              </label>
              <input
                id="register-password"
                v-model="registerForm.password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
                required
              />
            </div>

            <div class="form-group">
              <label for="register-confirm">
                <span class="label-icon">✓</span>
                Confirmar
              </label>
              <input
                id="register-confirm"
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                autocomplete="new-password"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="register-direccion">
              <span class="label-icon">📍</span>
              Dirección
            </label>
            <input
              id="register-direccion"
              v-model="registerForm.direccion"
              type="text"
              placeholder="Calle Falsa 123, Ciudad"
              autocomplete="street-address"
              required
            />
          </div>

          <button 
            type="submit" 
            class="btn-submit"
            :disabled="cargando"
          >
            <span v-if="!cargando">
              <span>Crear Cuenta</span>
              <span class="btn-arrow">→</span>
            </span>
            <span v-else class="loading-spinner">
              <span class="spinner"></span>
              Registrando...
            </span>
          </button>
        </form>

        <div class="card-footer">
          <div class="footer-info">
            <span class="footer-icon">🔒</span>
            <span class="footer-text">Tus datos están seguros con nosotros</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { UsuarioService } from '../../private/services/usuarioService';

export default {
  name: 'AuthView',
  data() {
    return {
      modo: 'login',
      loginForm: {
        email: '',
        password: ''
      },
      registerForm: {
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
        direccion: ''
      },
      error: '',
      success: '',
      cargando: false
    }
  },
  computed: {
    loginValido() {
      return UsuarioService.validarEmail(this.loginForm.email) && 
             UsuarioService.validarPassword(this.loginForm.password);
    },
    registerValido() {
      return this.registerForm.nombre.length >= 3 &&
             UsuarioService.validarEmail(this.registerForm.email) &&
             UsuarioService.validarPassword(this.registerForm.password) &&
             this.registerForm.password === this.registerForm.confirmPassword &&
             this.registerForm.direccion.length >= 10;
    }
  },
  async mounted() {
    await this.verificarSesion();
  },
  methods: {
    async verificarSesion() {
      try {
        if (UsuarioService.estaAutenticado()) {
          this.redirigirSegunRol();
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
      }
    },

    cambiarModo(nuevoModo) {
      this.modo = nuevoModo;
      this.error = '';
      this.success = '';
      this.limpiarFormularios();
    },

    async handleLogin() {
      try {
        this.error = '';
        this.success = '';
        this.cargando = true;

        if (!this.loginValido) {
          this.error = 'Por favor verifica los datos ingresados';
          return;
        }

        await UsuarioService.login(
          this.loginForm.email,
          this.loginForm.password
        );

        this.success = '¡Inicio de sesión exitoso!';

        setTimeout(() => {
          this.redirigirSegunRol();
        }, 1000);

      } catch (error) {
        console.error('Error en login:', error);
        this.error = 'Email o contraseña incorrectos';
      } finally {
        this.cargando = false;
      }
    },

    async handleRegister() {
      try {
        this.error = '';
        this.success = '';
        this.cargando = true;

        if (this.registerForm.password !== this.registerForm.confirmPassword) {
          this.error = 'Las contraseñas no coinciden';
          return;
        }

        const validacion = UsuarioService.validarRegistro({
          nombre: this.registerForm.nombre,
          email: this.registerForm.email,
          password: this.registerForm.password,
          direccion: this.registerForm.direccion
        });

        if (!validacion.valido) {
          this.error = validacion.errores.join(', ');
          return;
        }

        await UsuarioService.register(
          this.registerForm.nombre,
          this.registerForm.email,
          this.registerForm.password,
          this.registerForm.direccion
        );

        this.success = '¡Cuenta creada exitosamente! Redirigiendo...';

        setTimeout(() => {
          this.redirigirSegunRol();
        }, 1500);

      } catch (error) {
        console.error('Error en registro:', error);
        this.error = error.message || 'Error al crear la cuenta. Intenta nuevamente.';
      } finally {
        this.cargando = false;
      }
    },

    redirigirSegunRol() {
      const rol = UsuarioService.obtenerRol();

      switch(rol) {
        case 'admin':
          this.$router.push('/admin/dashboard');
          break;
        case 'vendedor':
          this.$router.push('/vendedor/dashboard');
          break;
        case 'repartidor':
          this.$router.push('/repartidor/pedidos');
          break;
        case 'cliente':
        default:
          this.$router.push('/');
          break;
      }
    },

    limpiarFormularios() {
      this.loginForm = {
        email: '',
        password: ''
      };
      this.registerForm = {
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
        direccion: ''
      };
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap');

* {
  box-sizing: border-box;
}

.auth-view-background {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  padding-bottom: 60px;
}

/* Hero Section */
.auth-hero {
  background-image: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200');
  background-size: cover;
  background-position: center;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: -80px;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
}

.hero-title {
  font-family: 'Permanent Marker', sans-serif;
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.4);
  animation: fadeInUp 0.6s ease-out;
}

.hero-subtitle {
  font-size: 1.3rem;
  font-weight: 300;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.8s ease-out;
}

/* Container */
.auth-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 100;
}

.auth-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: fadeInUp 0.7s ease-out;
}

/* Pestañas */
.tabs {
  display: flex;
  padding: 10px;
  background: #f8f9fa;
  gap: 10px;
}

.tab {
  flex: 1;
  padding: 14px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-icon {
  font-size: 1.2rem;
}

.tab:hover:not(.active) {
  background: #fafafa;
  border-color: #ff9900;
  transform: translateY(-2px);
}

.tab.active {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  color: white;
  border-color: #ff9900;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 153, 0, 0.3);
}

/* Card Header */
.card-header {
  padding: 30px 40px 20px;
  text-align: center;
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.card-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

/* Alertas */
.alert {
  margin: 0 40px 20px;
  padding: 14px 18px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  animation: slideIn 0.4s ease-out;
}

.alert-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.alert-error {
  background: #fee;
  color: #c33;
  border-left: 4px solid #c33;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

/* Formulario */
.auth-form {
  padding: 0 40px 30px;
  animation: fadeIn 0.4s ease;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
}

.label-icon {
  font-size: 1.1rem;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fafafa;
}

input:focus {
  outline: none;
  border-color: #ff9900;
  background: white;
  box-shadow: 0 0 0 4px rgba(255, 153, 0, 0.1);
}

input::placeholder {
  color: #aaa;
}

/* Botón Submit */
.btn-submit {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  box-shadow: 0 4px 15px rgba(255, 153, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-submit span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 153, 0, 0.4);
}

.btn-submit:hover:not(:disabled) .btn-arrow {
  transform: translateX(5px);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Card Footer */
.card-footer {
  background: #f8f9fa;
  padding: 20px 40px;
  border-top: 1px solid #e0e0e0;
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #666;
  font-size: 0.9rem;
}

.footer-icon {
  font-size: 1.2rem;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .auth-hero {
    height: 250px;
    margin-bottom: -60px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .card-header,
  .auth-form,
  .card-footer {
    padding-left: 25px;
    padding-right: 25px;
  }

  .alert {
    margin-left: 25px;
    margin-right: 25px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .card-title {
    font-size: 1.7rem;
  }
}

@media (max-width: 576px) {
  .auth-hero {
    height: 200px;
    margin-bottom: -40px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .tabs {
    flex-direction: column;
  }

  .tab {
    padding: 12px 16px;
    font-size: 0.95rem;
  }

  .card-header,
  .auth-form,
  .card-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .alert {
    margin-left: 20px;
    margin-right: 20px;
    padding: 12px 15px;
  }
}
</style>