// Utilidades de debugging para la aplicación
export const Debug = {
  // Función para mostrar el estado completo de la autenticación
  mostrarEstadoAuth() {
    console.group('🔍 ESTADO DE AUTENTICACIÓN');
    
    const token = localStorage.getItem('rappi_token');
    const userString = localStorage.getItem('rappi_user');
    
    console.log('🔑 Token en localStorage:', token ? 'EXISTE' : 'NO EXISTE');
    if (token) {
      console.log('🔑 Token (primeros 20 chars):', token.substring(0, 20) + '...');
    }
    
    console.log('👤 Usuario en localStorage:', userString ? 'EXISTE' : 'NO EXISTE');
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        console.log('👤 Usuario parseado:', user);
        console.log('🎯 Rol del usuario:', user.rol);
        console.log('📧 Email del usuario:', user.email);
        console.log('📛 Nombre del usuario:', user.nombre);
        console.log('✅ Estado del usuario:', user.estado);
      } catch (error) {
        console.error('❌ Error al parsear usuario:', error);
        console.log('📝 Usuario raw:', userString);
      }
    }
    
    // Importar y verificar UsuarioService
    import('../../private/services/usuarioService.js').then(({ UsuarioService }) => {
      console.log('🔍 UsuarioService.estaAutenticado():', UsuarioService.estaAutenticado());
      console.log('🔍 UsuarioService.obtenerToken():', UsuarioService.obtenerToken());
      console.log('🔍 UsuarioService.obtenerUsuario():', UsuarioService.obtenerUsuario());
      console.log('🔍 UsuarioService.obtenerRol():', UsuarioService.obtenerRol());
    });
    
    console.groupEnd();
  },

  // Función para limpiar completamente el estado de autenticación
  limpiarAuth() {
    console.log('🧹 Limpiando estado de autenticación...');
    localStorage.removeItem('rappi_token');
    localStorage.removeItem('rappi_user');
    console.log('✅ Estado de autenticación limpiado');
    this.mostrarEstadoAuth();
  },

  // Función para simular login manual
  simularLogin(email, rol = 'Cliente') {
    console.log(`🎭 Simulando login para ${email} con rol ${rol}`);
    
    const token = 'debug_token_' + Math.random().toString(36);
    const user = {
      id: Math.floor(Math.random() * 1000) + 100,
      nombre: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email: email,
      rol: rol,
      estado: 'Activo'
    };

    localStorage.setItem('rappi_token', token);
    localStorage.setItem('rappi_user', JSON.stringify(user));

    console.log('✅ Login simulado completado');
    this.mostrarEstadoAuth();
    
    return { token, user };
  },

  // Función para mostrar información de rutas
  mostrarInfoRuta(router) {
    console.group('🗺️ INFORMACIÓN DE RUTAS');
    console.log('📍 Ruta actual:', router.currentRoute.value.path);
    console.log('📍 Nombre de ruta:', router.currentRoute.value.name);
    console.log('📍 Parámetros:', router.currentRoute.value.params);
    console.log('📍 Query:', router.currentRoute.value.query);
    console.log('📍 Meta:', router.currentRoute.value.meta);
    console.groupEnd();
  },

  // Función para probar todos los tipos de usuario
  async probarTodosLosUsuarios() {
    console.group('🧪 PROBANDO TODOS LOS TIPOS DE USUARIO');
    
    const usuarios = [
      { email: 'cliente@test.com', rol: 'Cliente' },
      { email: 'vendedor@test.com', rol: 'Vendedor' },
      { email: 'repartidor@test.com', rol: 'Repartidor' },
      { email: 'admin@test.com', rol: 'Administrador' }
    ];

    for (const usuario of usuarios) {
      console.log(`\n--- Probando ${usuario.rol} ---`);
      this.limpiarAuth();
      
      const { UsuarioService } = await import('../../private/services/usuarioService.js');
      
      try {
        const result = await UsuarioService.login(usuario.email, '123456');
        console.log(`✅ Login exitoso para ${usuario.rol}:`, result);
        
        const rolGuardado = UsuarioService.obtenerRol();
        console.log(`🎯 Rol guardado: ${rolGuardado}`);
        
        if (rolGuardado === usuario.rol) {
          console.log(`✅ Rol coincide correctamente`);
        } else {
          console.error(`❌ Rol no coincide. Esperado: ${usuario.rol}, Obtenido: ${rolGuardado}`);
        }
        
      } catch (error) {
        console.error(`❌ Error en login para ${usuario.rol}:`, error);
      }
    }
    
    console.groupEnd();
  },

  // Funciones de debugging para el carrito
  async mostrarEstadoCarrito() {
    console.group('🛒 ESTADO DEL CARRITO');
    
    try {
      const { UsuarioService } = await import('../../private/services/usuarioService.js');
      const { CarritoService } = await import('../../private/services/carritoService.js');
      
      const usuario = UsuarioService.obtenerUsuario();
      console.log('👤 Usuario actual:', usuario);
      
      if (usuario) {
        const carrito = await CarritoService.getMiCarrito(usuario.id);
        console.log('🛒 Carrito completo:', carrito);
        console.log('📦 Items del carrito:', carrito.items || []);
        console.log('💰 Total del carrito:', carrito.total || 0);
      } else {
        console.log('❌ No hay usuario logueado');
      }
    } catch (error) {
      console.error('❌ Error al obtener carrito:', error);
    }
    
    console.groupEnd();
  },

  async agregarProductoAlCarrito(productoId = 1, cantidad = 1) {
    console.log(`🛒 Agregando producto ${productoId} con cantidad ${cantidad}`);
    
    try {
      const { UsuarioService } = await import('../../private/services/usuarioService.js');
      const { CarritoService } = await import('../../private/services/carritoService.js');
      
      const usuario = UsuarioService.obtenerUsuario();
      if (!usuario) {
        console.error('❌ No hay usuario logueado');
        return;
      }
      
      const resultado = await CarritoService.agregarProducto(usuario.id, productoId, cantidad);
      console.log('✅ Producto agregado:', resultado);
      
      // Mostrar estado actualizado
      await this.mostrarEstadoCarrito();
      
      // Disparar evento para actualizar UI
      window.dispatchEvent(new CustomEvent('carritoActualizado'));
      
    } catch (error) {
      console.error('❌ Error al agregar producto:', error);
    }
  },

  async vaciarCarritoDebug() {
    console.log('🧹 Vaciando carrito...');
    
    try {
      const { UsuarioService } = await import('../../private/services/usuarioService.js');
      const { CarritoService } = await import('../../private/services/carritoService.js');
      
      const usuario = UsuarioService.obtenerUsuario();
      if (!usuario) {
        console.error('❌ No hay usuario logueado');
        return;
      }
      
      const carrito = await CarritoService.getMiCarrito(usuario.id);
      await CarritoService.vaciarCarrito(carrito.id);
      
      console.log('✅ Carrito vaciado');
      
      // Mostrar estado actualizado
      await this.mostrarEstadoCarrito();
      
      // Disparar evento para actualizar UI
      window.dispatchEvent(new CustomEvent('carritoActualizado'));
      
    } catch (error) {
      console.error('❌ Error al vaciar carrito:', error);
    }
  },

  async simularCompraCompleta() {
    console.group('🛍️ SIMULANDO COMPRA COMPLETA');
    
    // 1. Verificar usuario
    await this.mostrarEstadoAuth();
    
    // 2. Agregar productos al carrito
    console.log('📦 Agregando productos...');
    await this.agregarProductoAlCarrito(1, 2);
    await this.agregarProductoAlCarrito(2, 1);
    
    // 3. Mostrar carrito
    await this.mostrarEstadoCarrito();
    
    // 4. Simular creación de pedido (sin realmente crearlo)
    console.log('📝 Para continuar, ve a /checkout y completa el pedido');
    console.log('🔄 Después del pedido, el carrito debería estar vacío');
    
    console.groupEnd();
  }
};

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.Debug = Debug;
  console.log('🔧 Debug utilities loaded. Use window.Debug.mostrarEstadoAuth() to check auth state');
}

export default Debug;