<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="tabs">
        <button 
          :class="['tab', { active: modo === 'login' }]"
          @click="cambiarModo('login')"
        >
          Iniciar Sesión
        </button>
        <button 
          :class="['tab', { active: modo === 'register' }]"
          @click="cambiarModo('register')"
        >
          Registrarse
        </button>
      </div>

      <h1>{{ modo === 'login' ? 'Bienvenido' : 'Crear Cuenta' }}</h1>
      <p class="subtitle">
        {{ modo === 'login' ? 'Inicia sesión en Rappi Clone' : 'Regístrate en Rappi Clone' }}
      </p>

      <div v-if="modo === 'login'" class="test-users">
        <p><strong>👤 Usuarios de prueba:</strong></p>
        <div class="test-buttons">
          <button type="button" @click="loginRapido('cliente@test.com')" class="btn-test">Cliente</button>
          <button type="button" @click="loginRapido('vendedor@test.com')" class="btn-test">Vendedor</button>
          <button type="button" @click="loginRapido('repartidor@test.com')" class="btn-test">Repartidor</button>
          <button type="button" @click="loginRapido('admin@test.com')" class="btn-test">Admin</button>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="success" class="success-message">
        {{ success }}
      </div>

      <!-- Formulario de Login -->
      <form v-if="modo === 'login'" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="login-email">Email</label>
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
          <label for="login-password">Contraseña</label>
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
          {{ cargando ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <!-- Formulario de Register -->
      <form v-else @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="register-nombre">Nombre Completo</label>
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
          <label for="register-email">Email</label>
          <input
            id="register-email"
            v-model="registerForm.email"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="register-password">Contraseña</label>
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
          <label for="register-confirm">Confirmar Contraseña</label>
          <input
            id="register-confirm"
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
            required
          />
        </div>

        <div class="form-group">
          <label for="register-direccion">Dirección</label>
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
          {{ cargando ? 'Registrando...' : 'Crear Cuenta' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { UsuarioService } from '../../private/services/usuarioService';

export default {
  name: 'AuthView',
  data() {
    return {
      modo: 'login', // 'login' o 'register'
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

        // Validar que las contraseñas coincidan
        if (this.registerForm.password !== this.registerForm.confirmPassword) {
          this.error = 'Las contraseñas no coinciden';
          return;
        }

        // Validar formulario completo
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

        // Registrar usuario
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
      console.log('🔍 Rol obtenido:', rol);
      console.log('🔍 Usuario completo:', UsuarioService.obtenerUsuario());

      switch(rol) {
        case 'Administrador':
          console.log('➡️ Redirigiendo a admin dashboard');
          this.$router.push('/admin/dashboard');
          break;
        case 'Vendedor':
          console.log('➡️ Redirigiendo a vendedor dashboard');
          this.$router.push('/vendedor/dashboard');
          break;
        case 'Repartidor':
          console.log('➡️ Redirigiendo a repartidor pedidos');
          this.$router.push('/repartidor/pedidos');
          break;
        case 'Cliente':
        default:
          console.log('➡️ Redirigiendo a home (cliente o default)');
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
    },

    // Login rápido para testing
    loginRapido(email) {
      this.loginForm.email = email;
      this.loginForm.password = '123456'; // Password de prueba
      this.handleLogin();
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
}

/* Pestañas */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tab {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.tab:hover:not(.active) {
  background: #e0e0e0;
}

h1 {
  margin: 0 0 10px 0;
  color: #333;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 10px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #c33;
  animation: slideIn 0.3s ease;
}

.success-message {
  background: #efe;
  color: #3c3;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #3c3;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transiciones suaves entre formularios */
form {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Usuarios de prueba */
.test-users {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.test-users p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #495057;
}

.test-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.btn-test {
  padding: 8px 12px;
  border: 1px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-test:hover {
  background: #667eea;
  color: white;
}
</style>