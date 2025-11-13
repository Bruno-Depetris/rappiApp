<template>
  <div class="perfil-background">
    <!-- Hero Banner -->
    <div class="perfil-hero-banner">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">Mi Perfil</h1>
        <p class="hero-subtitle">Gestiona tu información personal</p>
      </div>
    </div>

    <div class="container perfil-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container text-center">
        <div class="spinner"></div>
        <p class="loading-text">Cargando tu perfil...</p>
      </div>

      <!-- Perfil Content -->
      <div v-else class="row g-4">
        <!-- Información Personal -->
        <div class="col-lg-4">
          <div class="perfil-card">
            <div class="perfil-avatar">
              <div class="avatar-circle">
                {{ iniciales }}
              </div>
            </div>
            <h2 class="perfil-nombre">{{ usuario.nombre }} {{ usuario.apellido }}</h2>
            <p class="perfil-email">{{ usuario.email }}</p>
            <span :class="['perfil-rol', `rol-${usuario.rol.toLowerCase()}`]">
              {{ formatearRol(usuario.rol) }}
            </span>

            <div class="perfil-stats">
              <div class="stat-item">
                <span class="stat-label">Miembro desde</span>
                <span class="stat-value">{{ formatearFecha(usuario.fechaCreacion) }}</span>
              </div>
            </div>

            <button @click="modoEdicion = !modoEdicion" class="btn-editar-perfil">
              {{ modoEdicion ? '✕ Cancelar' : '✏️ Editar Perfil' }}
            </button>
          </div>
        </div>

        <!-- Detalles del Perfil -->
        <div class="col-lg-8">
          <!-- Modo Vista -->
          <div v-if="!modoEdicion" class="detalles-card">
            <h3 class="detalles-titulo">Información Personal</h3>
            
            <div class="detalle-seccion">
              <div class="detalle-item">
                <span class="detalle-icono">👤</span>
                <div class="detalle-info">
                  <span class="detalle-label">Nombre Completo</span>
                  <span class="detalle-valor">{{ usuario.nombre }} {{ usuario.apellido }}</span>
                </div>
              </div>

              <div class="detalle-item">
                <span class="detalle-icono">📧</span>
                <div class="detalle-info">
                  <span class="detalle-label">Email</span>
                  <span class="detalle-valor">{{ usuario.email }}</span>
                </div>
              </div>

              <div class="detalle-item">
                <span class="detalle-icono">📍</span>
                <div class="detalle-info">
                  <span class="detalle-label">Dirección</span>
                  <span class="detalle-valor">{{ usuario.direccion || 'No especificada' }}</span>
                </div>
              </div>

            </div>
            <!-- Opciones de Cambio de Rol (si es cliente) -->
            <div v-if="usuario.rol === 'cliente'" class="cambio-rol-seccion">
              <h4 class="seccion-titulo">¿Querés convertirte en?</h4>
              <div class="cambio-rol-botones">
                <button @click="mostrarFormularioVendedor = true" class="btn-cambio-rol vendedor">
                  🏪 Ser Vendedor
                </button>
                <button @click="mostrarFormularioRepartidor = true" class="btn-cambio-rol repartidor">
                  🚚 Ser Repartidor
                </button>
              </div>
            </div>
          </div>

          <!-- Modo Edición -->
          <div v-else class="detalles-card">
            <h3 class="detalles-titulo">Editar Información</h3>
            
            <form @submit.prevent="guardarCambios" class="form-edicion">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Nombre</label>
                    <input 
                      v-model="formulario.nombre" 
                      type="text"
                      class="form-input"
                      required
                    />
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Apellido</label>
                    <input 
                      v-model="formulario.apellido" 
                      type="text"
                      class="form-input"
                      required
                    />
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Teléfono</label>
                    <input 
                      v-model="formulario.telefono" 
                      type="tel"
                      class="form-input"
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">DNI</label>
                    <input 
                      v-model="formulario.dni" 
                      type="text"
                      class="form-input"
                      placeholder="12345678"
                    />
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-group">
                    <label class="form-label">Dirección</label>
                    <input 
                      v-model="formulario.direccion" 
                      type="text"
                      class="form-input"
                      placeholder="Calle 123, Ciudad, Provincia"
                    />
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Fecha de Nacimiento</label>
                    <input 
                      v-model="formulario.fechaNacimiento" 
                      type="date"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>

              <div class="form-acciones">
                <button 
                  type="submit" 
                  :disabled="guardando"
                  class="btn-guardar"
                >
                  {{ guardando ? 'Guardando...' : '💾 Guardar Cambios' }}
                </button>
                <button 
                  type="button"
                  @click="cancelarEdicion"
                  class="btn-cancelar"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Formulario Vendedor -->
    <div v-if="mostrarFormularioVendedor" class="modal-overlay" @click="cerrarModales">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Convertirse en Vendedor</h3>
          <button @click="cerrarModales" class="btn-cerrar-modal">✕</button>
        </div>
        
        <div class="modal-body">
          <p class="modal-descripcion">
            Completa la información de tu negocio para empezar a vender en nuestra plataforma.
          </p>

          <form @submit.prevent="solicitarVendedor" class="form-modal">
            <div class="form-group">
              <label class="form-label">Nombre del Negocio</label>
              <input 
                v-model="formularioVendedor.nombreNegocio" 
                type="text"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Dirección del Negocio</label>
              <input 
                v-model="formularioVendedor.direccion" 
                type="text"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input 
                v-model="formularioVendedor.telefono" 
                type="tel"
                class="form-input"
                required
              />
            </div>

            <div class="row g-3">
              <div class="col-6">
                <div class="form-group">
                  <label class="form-label">Horario Apertura</label>
                  <input 
                    v-model="formularioVendedor.horarioApertura" 
                    type="time"
                    class="form-input"
                    required
                  />
                </div>
              </div>

              <div class="col-6">
                <div class="form-group">
                  <label class="form-label">Horario Cierre</label>
                  <input 
                    v-model="formularioVendedor.horarioCierre" 
                    type="time"
                    class="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Categoría</label>
              <select 
                v-model="formularioVendedor.categoriaId" 
                class="form-select"
                required
              >
                <option value="">Seleccionar categoría</option>
                <option 
                  v-for="categoria in categorias" 
                  :key="categoria.categoriaId"
                  :value="categoria.categoriaId"
                >
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>

            <button 
              type="submit" 
              :disabled="guardando"
              class="btn-modal-confirmar"
            >
              {{ guardando ? 'Enviando...' : 'Enviar Solicitud' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Formulario Repartidor -->
    <div v-if="mostrarFormularioRepartidor" class="modal-overlay" @click="cerrarModales">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Convertirse en Repartidor</h3>
          <button @click="cerrarModales" class="btn-cerrar-modal">✕</button>
        </div>
        
        <div class="modal-body">
          <p class="modal-descripcion">
            Completa tu información para empezar a repartir pedidos.
          </p>

          <form @submit.prevent="solicitarRepartidor" class="form-modal">
            <div class="form-group">
              <label class="form-label">Tipo de Vehículo</label>
              <select 
                v-model="formularioRepartidor.vehiculo" 
                class="form-select"
                required
              >
                <option value="">Seleccionar vehículo</option>
                <option value="Bicicleta">🚲 Bicicleta</option>
                <option value="Moto">🏍️ Moto</option>
                <option value="Auto">🚗 Auto</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Disponibilidad</label>
              <select 
                v-model="formularioRepartidor.disponibilidad" 
                class="form-select"
                required
              >
                <option value="">Seleccionar disponibilidad</option>
                <option value="Tiempo Completo">Tiempo Completo</option>
                <option value="Medio Tiempo">Medio Tiempo</option>
                <option value="Fines de Semana">Fines de Semana</option>
              </select>
            </div>

            <button 
              type="submit" 
              :disabled="guardando"
              class="btn-modal-confirmar"
            >
              {{ guardando ? 'Enviando...' : 'Enviar Solicitud' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { UsuarioService } from '../../private/services/UsuarioService';
import { CategoriaService } from '../../private/services/CategoriaService';
import { Notificar } from '../utils/notificaciones';

export default {
  name: 'PerfilView',
  setup() {
    const loading = ref(true);
    const guardando = ref(false);
    const modoEdicion = ref(false);
    const mostrarFormularioVendedor = ref(false);
    const mostrarFormularioRepartidor = ref(false);
    
    const usuario = ref({});
    const categorias = ref([]);
    
    const formulario = ref({
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      dni: '',
    });

    const formularioVendedor = ref({
      nombreNegocio: '',
      direccion: '',
      telefono: '',
      horarioApertura: '',
      horarioCierre: '',
      categoriaId: '',
    });

    const formularioRepartidor = ref({
      vehiculo: '',
      disponibilidad: '',
    });

    // Computed
    const iniciales = computed(() => {
      if (!usuario.value.nombre || !usuario.value.apellido) return '?';
      return `${usuario.value.nombre[0]}${usuario.value.apellido[0]}`.toUpperCase();
    });

    // Métodos
    const cargarPerfil = async () => {
      try {
        loading.value = true;
        const perfil = await UsuarioService.getPerfil();
        usuario.value = perfil;

        // Cargar también las categorías para el formulario de vendedor
        if (perfil.rol === 'cliente') {
          categorias.value = await CategoriaService.getAll();
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        Notificar.error('Error al cargar tu perfil');
      } finally {
        loading.value = false;
      }
    };

    const cancelarEdicion = () => {
      modoEdicion.value = false;
      formulario.value = {
        nombre: usuario.value.nombre,
        apellido: usuario.value.apellido,
        telefono: usuario.value.telefono,
        direccion: usuario.value.direccion,
        fechaNacimiento: usuario.value.fechaNacimiento,
        dni: usuario.value.dni,
      };
    };

    const guardarCambios = async () => {
      guardando.value = true;
      try {
        // Aquí llamarías al endpoint de actualizar perfil
        // await UsuarioService.actualizarPerfil(formulario.value);
        
        // Por ahora, solo actualizamos localmente
        Object.assign(usuario.value, formulario.value);
        
        Notificar.exito('Perfil actualizado correctamente');
        modoEdicion.value = false;
      } catch (error) {
        console.error('Error al actualizar perfil:', error);
        Notificar.error('Error al actualizar el perfil');
      } finally {
        guardando.value = false;
      }
    };

    const solicitarVendedor = async () => {
      guardando.value = true;
      try {
        await UsuarioService.cambiarAVendedor(formularioVendedor.value);
        Notificar.exito('Solicitud enviada. Espera la aprobación del administrador', 5);
        cerrarModales();
        await cargarPerfil();
      } catch (error) {
        console.error('Error:', error);
        Notificar.error('Error al enviar la solicitud');
      } finally {
        guardando.value = false;
      }
    };

    const solicitarRepartidor = async () => {
      guardando.value = true;
      try {
        await UsuarioService.cambiarARepartidor(formularioRepartidor.value);
        Notificar.exito('¡Ahora eres repartidor! Ya puedes empezar a tomar pedidos', 5);
        cerrarModales();
        await cargarPerfil();
      } catch (error) {
        console.error('Error:', error);
        Notificar.error('Error al cambiar a repartidor');
      } finally {
        guardando.value = false;
      }
    };

    const cerrarModales = () => {
      mostrarFormularioVendedor.value = false;
      mostrarFormularioRepartidor.value = false;
    };

    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };

    const formatearFechaNacimiento = (fecha) => {
      return new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const formatearRol = (rol) => {
      const roles = {
        'cliente': '👤 Cliente',
        'vendedor': '🏪 Vendedor',
        'repartidor': '🚚 Repartidor',
        'admin': '⚙️ Administrador'
      };
      return roles[rol] || rol;
    };

    onMounted(() => {
      cargarPerfil();
    });

    return {
      loading,
      guardando,
      modoEdicion,
      mostrarFormularioVendedor,
      mostrarFormularioRepartidor,
      usuario,
      categorias,
      formulario,
      formularioVendedor,
      formularioRepartidor,
      iniciales,
      cancelarEdicion,
      guardarCambios,
      solicitarVendedor,
      solicitarRepartidor,
      cerrarModales,
      formatearFecha,
      formatearFechaNacimiento,
      formatearRol,
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

* {
  box-sizing: border-box;
}

.perfil-background {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  padding-bottom: 60px;
}

/* Hero Banner */
.perfil-hero-banner {
  background-image: url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200');
  background-size: cover;
  background-position: center;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 3rem;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.8) 100%);
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
}

.hero-title {
  font-family: 'Permanent Marker', sans-serif;
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.4);
}

.hero-subtitle {
  font-size: 1.2rem;
  font-weight: 300;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Container */
.perfil-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Loading */
.loading-container {
  padding: 5rem 0;
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #666;
  font-size: 1.2rem;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Perfil Card */
.perfil-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  position: sticky;
  top: 20px;
}

.perfil-avatar {
  margin-bottom: 20px;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 800;
  color: white;
  box-shadow: 0 8px 30px rgba(255, 153, 0, 0.3);
}

.perfil-nombre {
  font-size: 1.8rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 0.5rem;
}

.perfil-email {
  color: #666;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.perfil-rol {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.95rem;
  color: white;
  margin-bottom: 1.5rem;
}

.rol-cliente { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); }
.rol-vendedor { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); }
.rol-repartidor { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); }
.rol-admin { background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%); }

.perfil-stats {
  border-top: 2px solid #f0f0f0;
  padding-top: 20px;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  color: #333;
  font-weight: 700;
  font-size: 1rem;
}

.btn-editar-perfil {
  width: 100%;
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  color: white;
  border: none;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 153, 0, 0.3);
}

.btn-editar-perfil:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 153, 0, 0.4);
}

/* Detalles Card */
.detalles-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.detalles-titulo {
  font-size: 1.8rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #ff9900;
}

.detalle-seccion {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detalle-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.detalle-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.detalle-icono {
  font-size: 2rem;
  flex-shrink: 0;
}

.detalle-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detalle-label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 600;
}

.detalle-valor {
  color: #333;
  font-size: 1.1rem;
  font-weight: 700;
}

/* Cambio de Rol */
.cambio-rol-seccion {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.seccion-titulo {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.cambio-rol-botones {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.btn-cambio-rol {
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.btn-cambio-rol.vendedor {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-cambio-rol.repartidor {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.btn-cambio-rol:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

/* Formulario */
.form-edicion,
.form-modal {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.form-input,
.form-select {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #ff9900;
  box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.1);
}

.form-acciones {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn-guardar,
.btn-cancelar,
.btn-modal-confirmar {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-guardar,
.btn-modal-confirmar {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-guardar:hover:not(:disabled),
.btn-modal-confirmar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(76, 175, 80, 0.4);
}

.btn-guardar:disabled,
.btn-modal-confirmar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancelar {
  background: #f44336;
  color: white;
}

.btn-cancelar:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

.btn-modal-confirmar {
  width: 100%;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  padding: 24px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
}

.modal-header h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.btn-cerrar-modal {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.8rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cerrar-modal:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 30px;
}

.modal-descripcion {
  color: #666;
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 991px) {
  .perfil-card {
    position: relative;
    top: 0;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .detalles-card {
    padding: 24px;
  }

  .form-acciones {
    flex-direction: column;
  }
}
</style>