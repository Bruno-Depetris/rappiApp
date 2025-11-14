import { createCrud } from '../api/crudFactory.js';

// Función auxiliar para obtener el token actual
const obtenerToken = () => localStorage.getItem('rappi_token');

// Función auxiliar para crear CRUD con token
const crearCrudConToken = (entity) => {
  return {
    getAll: () => {
      const token = obtenerToken();
      return createCrud(entity, token).getAll();
    },
    getById: (id) => {
      const token = obtenerToken();
      return createCrud(entity, token).getById(id);
    },
    create: (data) => {
      const token = obtenerToken();
      return createCrud(entity, token).create(data);
    },
    update: (id, data) => {
      const token = obtenerToken();
      return createCrud(entity, token).update(id, data);
    },
    delete: (id) => {
      const token = obtenerToken();
      return createCrud(entity, token).delete(id);
    }
  };
};

const favoritoCrud = crearCrudConToken('favoritos');
const productoCrud = crearCrudConToken('productos');
const negocioCrud = crearCrudConToken('negocios');

export const FavoritoService = {
  ...favoritoCrud,

  // Obtener favoritos de un usuario
  getFavoritosUsuario: async (usuarioId) => {
    try {
      const favoritos = await favoritoCrud.getAll();
      return favoritos.filter(f => 
        f.usuarioId === usuarioId && !f.isDeleted
      );
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return [];
    }
  },

  // Verificar si un producto es favorito
  esProductoFavorito: async (usuarioId, productoId) => {
    try {
      const favoritos = await FavoritoService.getFavoritosUsuario(usuarioId);
      return favoritos.some(f => 
        f.productoId === productoId && f.tipo === 'producto'
      );
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      return false;
    }
  },

  // Agregar producto a favoritos
  agregarProductoFavorito: async (usuarioId, productoId) => {
    try {
      const yaEsFavorito = await FavoritoService.esProductoFavorito(usuarioId, productoId);
      if (yaEsFavorito) {
        throw new Error('El producto ya está en favoritos');
      }

      const nuevoFavorito = {
        usuarioId,
        productoId,
        negocioId: null,
        tipo: 'producto',
        fechaCreacion: new Date().toISOString(),
        isDeleted: false
      };

      return await favoritoCrud.create(nuevoFavorito);
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
      throw error;
    }
  },

  // Toggle favorito de producto
  toggleProductoFavorito: async (usuarioId, productoId) => {
    try {
      const esFavorito = await FavoritoService.esProductoFavorito(usuarioId, productoId);
      
      if (esFavorito) {
        const favoritos = await FavoritoService.getFavoritosUsuario(usuarioId);
        const favorito = favoritos.find(f => 
          f.productoId === productoId && f.tipo === 'producto'
        );
        if (favorito) {
          await favoritoCrud.update(favorito.id, { isDeleted: true });
        }
        return false;
      } else {
        await FavoritoService.agregarProductoFavorito(usuarioId, productoId);
        return true;
      }
    } catch (error) {
      console.error('Error al toggle favorito:', error);
      throw error;
    }
  },

  // Obtener productos favoritos con detalles
  getProductosFavoritos: async (usuarioId) => {
    try {
      const favoritos = await FavoritoService.getFavoritosUsuario(usuarioId);
      const productosFavoritos = favoritos.filter(f => f.tipo === 'producto');
      
      const productos = await productoCrud.getAll();
      
      return productosFavoritos.map(favorito => {
        const producto = productos.find(p => p.id === favorito.productoId);
        return {
          ...favorito,
          producto
        };
      }).filter(f => f.producto);
      
    } catch (error) {
      console.error('Error al obtener productos favoritos:', error);
      return [];
    }
  },

  // Métodos compatibles con implementación anterior
  getFavoritosByUsuario: async (usuarioId) => {
    return await FavoritoService.getFavoritosUsuario(usuarioId);
  },
  
  agregarAFavoritos: async (usuarioId, productoId) => {
    return await FavoritoService.agregarProductoFavorito(usuarioId, productoId);
  },
  
  eliminarDeFavoritos: async (usuarioId, productoId) => {
    const favoritos = await FavoritoService.getFavoritosUsuario(usuarioId);
    const favorito = favoritos.find(fav => fav.productoId === productoId);
    if (favorito) {
      return await favoritoCrud.update(favorito.id, { isDeleted: true });
    }
  }
};