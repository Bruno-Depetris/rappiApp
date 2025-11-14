// Datos mock para desarrollo mientras la API está en construcción
export const mockData = {
  usuarios: [
    {
      id: 1,
      nombre: "Juan Pérez",
      email: "juan@ejemplo.com",
      rol: "Cliente",
      estado: "Activo",
      telefono: "555-1234",
      direccion: "Calle 123, Ciudad"
    },
    {
      id: 2,
      nombre: "María García",
      email: "maria@vendor.com", 
      rol: "Vendedor",
      estado: "Aprobado",
      telefono: "555-5678",
      direccion: "Av. Comercio 456, Ciudad"
    },
    {
      id: 3,
      nombre: "Carlos López",
      email: "carlos@delivery.com",
      rol: "Repartidor", 
      estado: "Activo",
      telefono: "555-9012",
      vehiculo: "Motocicleta"
    },
    {
      id: 4,
      nombre: "Admin Sistema",
      email: "admin@sistema.com",
      rol: "Administrador",
      estado: "Activo",
      telefono: "555-0000"
    }
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
      categoria: { id: 1, categoria: "Comida Rápida" },
      vendedor: { usuarioId: 2, nombre: "María García" },
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
      categoria: { id: 2, categoria: "Café y Bebidas" },
      vendedor: { usuarioId: 2, nombre: "María García" },
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
      categoria: "Pizzas",
      imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23ff6b6b'/%3E%3Ccircle cx='120' cy='100' r='80' fill='%23ff5722'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='14'%3E🍕%3C/text%3E%3C/svg%3E",
      vendedorId: 2,
      negocioId: 1,
      estado: "Activo"
    },
    {
      id: 2,
      nombre: "Pizza Pepperoni",
      descripcion: "Pizza con salsa de tomate, mozzarella y pepperoni",
      precio: 14.99,
      disponibilidad: 8,
      categoria: "Pizzas",
      imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23ff6b6b'/%3E%3Ccircle cx='120' cy='100' r='80' fill='%23d32f2f'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='14'%3E🍕%3C/text%3E%3C/svg%3E",
      vendedorId: 2,
      negocioId: 1,
      estado: "Activo"
    },
    {
      id: 3,
      nombre: "Café Americano",
      descripcion: "Café negro tradicional",
      precio: 3.50,
      disponibilidad: 50,
      categoria: "Bebidas Calientes",
      imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='200'%3E%3Crect width='100%25' height='100%25' fill='%236f4e37'/%3E%3Ccircle cx='120' cy='100' r='60' fill='%238b4513'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16'%3E☕%3C/text%3E%3C/svg%3E",
      vendedorId: 2,
      negocioId: 2,
      estado: "Activo"
    },
    {
      id: 4,
      nombre: "Croissant de Chocolate",
      descripcion: "Croissant recién horneado relleno de chocolate",
      precio: 4.25,
      disponibilidad: 0,
      categoria: "Repostería",
      imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23feca57'/%3E%3Cpath d='M60 120 Q120 80 180 120 Q180 140 120 140 Q60 140 60 120' fill='%23daa520'/%3E%3Ctext x='50%25' y='75%25' text-anchor='middle' dy='.3em' fill='white' font-size='14'%3E🥐%3C/text%3E%3C/svg%3E",
      vendedorId: 2,
      negocioId: 2,
      estado: "Activo"
    }
  ],

  carrito: [
    {
      id: 1,
      usuarioId: 1,
      items: [
        {
          id: 1,
          productoId: 1,
          nombreProducto: "Pizza Margherita",
          cantidad: 1,
          precioUnitario: 12.99,
          subtotal: 12.99,
          imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23ff6b6b'/%3E%3Ccircle cx='120' cy='100' r='80' fill='%23ff5722'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='14'%3E🍕%3C/text%3E%3C/svg%3E"
        }
      ],
      cupones: [],
      subtotal: 12.99,
      descuentos: 0,
      total: 12.99,
      fechaCreacion: new Date().toISOString()
    }
  ],

  pedidos: [
    {
      id: 1,
      usuarioId: 1,
      estado: "Pendiente",
      total: 27.98,
      fechaPedido: new Date().toISOString(),
      direccionEntrega: "Calle 123, Ciudad",
      detalles: [
        {
          id: 1,
          productoId: 1,
          nombreProducto: "Pizza Margherita",
          cantidad: 2,
          precioUnitario: 12.99,
          subtotal: 25.98,
          vendedorId: 2
        },
        {
          id: 2,
          productoId: 3,
          nombreProducto: "Café Americano",
          cantidad: 1,
          precioUnitario: 3.50,
          subtotal: 3.50,
          vendedorId: 2
        }
      ]
    },
    {
      id: 2,
      usuarioId: 1,
      estado: "EnCamino",
      total: 14.99,
      fechaPedido: new Date(Date.now() - 3600000).toISOString(),
      direccionEntrega: "Calle 123, Ciudad",
      repartidorId: 3,
      detalles: [
        {
          id: 3,
          productoId: 2,
          nombreProducto: "Pizza Pepperoni",
          cantidad: 1,
          precioUnitario: 14.99,
          subtotal: 14.99,
          vendedorId: 2
        }
      ]
    }
  ],

  categorias: [
    { id: 1, categoria: "Comida Rápida", descripcion: "Restaurantes de comida rápida" },
    { id: 2, categoria: "Café y Bebidas", descripcion: "Cafeterías y bebidas" },
    { id: 3, categoria: "Postres", descripcion: "Heladerías y reposterías" },
    { id: 4, categoria: "Comida Saludable", descripcion: "Opciones saludables y veganas" }
  ],

  repartidores: [
    {
      id: 3,
      usuarioId: 3,
      vehiculo: "Motocicleta",
      licencia: "ABC123",
      estado: "Disponible",
      ubicacionActual: { lat: -34.6037, lng: -58.3816 },
      pedidoActual: 2
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