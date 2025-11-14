// Datos mock actualizados según la estructura de la base de datos
export const mockData = {
  usuarios: [
    {
      id: 1,
      nombre: "Juan Pérez",
      email: "juan@ejemplo.com",
      password: "123456",
      rol: "Cliente",
      estado: "Activo",
      telefono: "555-1234",
      direccion: "Calle 123, Ciudad"
    },
    {
      id: 2,
      nombre: "María García",
      email: "maria@vendor.com", 
      password: "123456",
      rol: "Vendedor",
      estado: "Activo",
      telefono: "555-5678",
      direccion: "Av. Comercio 456, Ciudad"
    },
    {
      id: 3,
      nombre: "Carlos López",
      email: "carlos@delivery.com",
      password: "123456",
      rol: "Repartidor", 
      estado: "Activo",
      telefono: "555-9012",
      direccion: "Centro 789, Ciudad"
    },
    {
      id: 4,
      nombre: "Admin Sistema",
      email: "admin@sistema.com",
      password: "123456",
      rol: "Administrador",
      estado: "Activo",
      telefono: "555-0000",
      direccion: "Oficina Central"
    },
    {
      id: 5,
      nombre: "Cliente de Prueba",
      email: "cliente@test.com",
      password: "123456",
      rol: "Cliente",
      estado: "Activo",
      telefono: "555-1111",
      direccion: "Dirección del Cliente"
    },
    {
      id: 6,
      nombre: "Vendedor de Prueba",
      email: "vendedor@test.com",
      password: "123456",
      rol: "Vendedor",
      estado: "Activo",
      telefono: "555-2222",
      direccion: "Dirección del Vendedor"
    },
    {
      id: 7,
      nombre: "Repartidor de Prueba",
      email: "repartidor@test.com",
      password: "123456",
      rol: "Repartidor",
      estado: "Activo",
      telefono: "555-3333",
      direccion: "Dirección del Repartidor"
    },
    {
      id: 8,
      nombre: "Admin de Prueba",
      email: "admin@test.com",
      password: "123456",
      rol: "Administrador",
      estado: "Activo",
      telefono: "555-4444",
      direccion: "Dirección del Admin"
    },
    {
      id: 5,
      nombre: "Cliente de Prueba",
      email: "cliente@test.com",
      password: "123456",
      rol: "Cliente",
      estado: "Activo",
      telefono: "555-1111",
      direccion: "Dirección del Cliente"
    },
    {
      id: 6,
      nombre: "Vendedor de Prueba",
      email: "vendedor@test.com",
      password: "123456",
      rol: "Vendedor",
      estado: "Activo",
      telefono: "555-2222",
      direccion: "Dirección del Vendedor"
    },
    {
      id: 7,
      nombre: "Repartidor de Prueba",
      email: "repartidor@test.com",
      password: "123456",
      rol: "Repartidor",
      estado: "Activo",
      telefono: "555-3333",
      direccion: "Dirección del Repartidor"
    },
    {
      id: 8,
      nombre: "Admin de Prueba",
      email: "admin@test.com",
      password: "123456",
      rol: "Administrador",
      estado: "Activo",
      telefono: "555-4444",
      direccion: "Dirección del Admin"
    }
  ],

  administrador: [
    {
      id: 1,
      usuarioId: 4,
      usuario: "admin@sistema.com",
      password: "admin123"
    }
  ],

  vendedor: [
    {
      id: 1,
      usuarioId: 2,
      direccion: "Av. Comercio 456",
      telefono: "555-5678",
      estado: "Activo"
    }
  ],

  repartidor: [
    {
      id: 1,
      usuarioId: 3,
      vehiculo: "Motocicleta",
      estado: "Disponible",
      ubicacionActual: { lat: -34.6037, lng: -58.3816 }
    }
  ],

  categorias: [
    { id: 1, categoria: "Comida Rápida", descripcion: "Restaurantes de comida rápida" },
    { id: 2, categoria: "Café y Bebidas", descripcion: "Cafeterías y bebidas" },
    { id: 3, categoria: "Postres", descripcion: "Heladerías y reposterías" },
    { id: 4, categoria: "Comida Saludable", descripcion: "Opciones saludables y veganas" }
  ],

  categoriasProductos: [
    { id: 1, nombre: "Pizzas", descripcion: "Pizzas tradicionales y especiales" },
    { id: 2, nombre: "Bebidas Calientes", descripcion: "Café, té y bebidas calientes" },
    { id: 3, nombre: "Repostería", descripcion: "Pasteles, croissants y dulces" },
    { id: 4, nombre: "Bebidas Frías", descripcion: "Jugos, gaseosas y bebidas frías" }
  ],

  negocios: [
    {
      id: 1,
      nombreNegocio: "Pizzería Don Luigi",
      descripcion: "Las mejores pizzas de la ciudad",
      direccion: "Av. Principal 123",
      telefono: "555-PIZZA",
      email: "contacto@donluigi.com",
      estado: "Activo",
      horarioApertura: "18:00",
      horarioCierre: "23:00",
      categoriaId: 1,
      vendedorId: 1,
      imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23ff6b6b'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16'%3EPizzería%3C/text%3E%3C/svg%3E"
    },
    {
      id: 2,
      nombreNegocio: "Café Central",
      descripcion: "Café artesanal y repostería",
      direccion: "Centro Comercial Plaza",
      telefono: "555-CAFE",
      email: "info@cafecentral.com",
      estado: "Activo",
      horarioApertura: "07:00",
      horarioCierre: "20:00",
      categoriaId: 2,
      vendedorId: 1,
      imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23feca57'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16'%3ECafetería%3C/text%3E%3C/svg%3E"
    }
  ],

  productos: [
    {
      id: 1,
      nombre: "Pizza Margherita",
      descripcion: "Pizza clásica con tomate, mozzarella y albahaca",
      precio: 12.99,
      disponibilidad: 15,
      categoriaProductoId: 1,
      imagenes: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23ff6b6b'/%3E%3Ccircle cx='120' cy='100' r='80' fill='%23ff5722'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='14'%3E🍕%3C/text%3E%3C/svg%3E",
      vendedorId: 1,
      isDeleted: false
    },
    {
      id: 2,
      nombre: "Pizza Pepperoni",
      descripcion: "Pizza con salsa de tomate, mozzarella y pepperoni",
      precio: 14.99,
      disponibilidad: 8,
      categoriaProductoId: 1,
      imagenes: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23ff6b6b'/%3E%3Ccircle cx='120' cy='100' r='80' fill='%23d32f2f'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='14'%3E🍕%3C/text%3E%3C/svg%3E",
      vendedorId: 1,
      isDeleted: false
    },
    {
      id: 3,
      nombre: "Café Americano",
      descripcion: "Café negro tradicional",
      precio: 3.50,
      disponibilidad: 50,
      categoriaProductoId: 2,
      imagenes: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='200'%3E%3Crect width='100%25' height='100%25' fill='%236f4e37'/%3E%3Ccircle cx='120' cy='100' r='60' fill='%238b4513'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16'%3E☕%3C/text%3E%3C/svg%3E",
      vendedorId: 1,
      isDeleted: false
    }
  ],

  carrito: [
    {
      id: 1,
      usuarioId: 1,
      subtotal: 12.99,
      totalDescuentos: 0,
      total: 12.99,
      fechaCreacion: new Date().toISOString()
    }
  ],

  carritoItem: [
    {
      id: 1,
      carritoId: 1,
      productoId: 1,
      cantidad: 1,
      precioUnitario: 12.99,
      subtotal: 12.99,
      isDeleted: false
    }
  ],

  cupon: [
    {
      id: 1,
      codigo: "DESCUENTO10",
      tipoDescuento: "Porcentaje",
      descuento: 10,
      fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usoMaximo: 100,
      usoActuales: 5,
      isDeleted: false
    }
  ],

  carritoCupon: [
    {
      id: 1,
      carritoId: 1,
      cuponId: 1,
      descuentoAplicado: 1.30,
      fechaAplicacion: new Date().toISOString(),
      isDeleted: false
    }
  ],

  metodoPago: [
    {
      id: 1,
      metodo: "Efectivo"
    },
    {
      id: 2, 
      metodo: "Tarjeta de Crédito"
    },
    {
      id: 3,
      metodo: "Transferencia"
    }
  ],

  pedidos: [
    {
      id: 1,
      usuarioId: 1,
      repartidorId: null,
      metodoPagoId: 1,
      subtotal: 27.98,
      totalDescuentos: 0,
      costoEnvio: 2.50,
      total: 30.48,
      estado: "Pendiente",
      fechaCreacion: new Date().toISOString(),
      fechaEntrega: null,
      direccionEntrega: "Calle 123, Ciudad",
      reseña: null,
      isDeleted: false
    }
  ],

  detallesPedido: [
    {
      id: 1,
      pedidoId: 1,
      productoId: 1,
      cantidad: 2,
      precioUnitario: 12.99,
      subtotal: 25.98,
      isDeleted: false
    },
    {
      id: 2,
      pedidoId: 1,
      productoId: 3,
      cantidad: 1,
      precioUnitario: 3.50,
      subtotal: 3.50,
      isDeleted: false
    }
  ],

  favoritos: [
    {
      id: 1,
      usuarioId: 1,
      productoId: 1,
      isDeleted: false
    }
  ],

  soporte: [
    {
      id: 1,
      usuarioId: 1,
      reclamo: "El pedido llegó frío",
      isDeleted: false,
      fechaCreacion: new Date().toISOString()
    }
  ],

  favoritos: [
    {
      id: 1,
      usuarioId: 1,
      productoId: 1,
      negocioId: null,
      tipo: "producto",
      fechaCreacion: new Date().toISOString(),
      isDeleted: false
    },
    {
      id: 2,
      usuarioId: 1,
      productoId: 3,
      negocioId: null,
      tipo: "producto",
      fechaCreacion: new Date().toISOString(),
      isDeleted: false
    }
  ]
};

// Función para simular delay de red
export const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Función para obtener datos mock con delay simulado
export const getMockData = async (entity) => {
  await delay(Math.random() * 500 + 200); // 200-700ms delay
  return mockData[entity] || [];
};

// Función para obtener un elemento por ID
export const getMockById = async (entity, id) => {
  await delay(Math.random() * 300 + 100);
  const data = mockData[entity] || [];
  return data.find(item => item.id == id);
};

// Función para crear un nuevo elemento
export const createMockData = async (entity, newItem) => {
  await delay(Math.random() * 500 + 200);
  
  // Manejar endpoints especiales como auth/register
  if (entity.includes('/')) {
    const parts = entity.split('/');
    if (parts[0] === 'auth' && parts[1] === 'register') {
      entity = 'usuarios'; // Redirigir auth/register a usuarios
    }
  }
  
  // Asegurar que la entidad existe en mockData
  if (!mockData[entity]) {
    mockData[entity] = [];
  }
  
  const data = mockData[entity];
  const newId = Math.max(...data.map(item => item.id || 0), 0) + 1;
  const itemWithId = { ...newItem, id: newId };
  mockData[entity].push(itemWithId);
  return itemWithId;
};

// Función para actualizar un elemento
export const updateMockData = async (entity, id, updatedItem) => {
  await delay(Math.random() * 500 + 200);
  const data = mockData[entity] || [];
  const index = data.findIndex(item => item.id == id);
  if (index !== -1) {
    mockData[entity][index] = { ...mockData[entity][index], ...updatedItem };
    return mockData[entity][index];
  }
  throw new Error(`${entity} with id ${id} not found`);
};

// Función para eliminar un elemento
export const deleteMockData = async (entity, id) => {
  await delay(Math.random() * 300 + 100);
  const data = mockData[entity] || [];
  const index = data.findIndex(item => item.id == id);
  if (index !== -1) {
    const deleted = mockData[entity].splice(index, 1)[0];
    return deleted;
  }
  throw new Error(`${entity} with id ${id} not found`);
};