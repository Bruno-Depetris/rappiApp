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

export const FavoritoService = {
  ...favoritoCrud,
  
  getFavoritosByUsuario: async (usuarioId) => {
    return await favoritoCrud.getAll().then(favoritos => 
      favoritos.filter(fav => fav.usuarioId === usuarioId)
    );
  },
  
  agregarAFavoritos: async (usuarioId, productoId) => {
    const nuevoFavorito = { usuarioId, productoId };
    return await favoritoCrud.create(nuevoFavorito);
  },
  
  eliminarDeFavoritos: async (usuarioId, productoId) => {
    const favoritos = await favoritoCrud.getAll();
    const favorito = favoritos.find(fav => fav.usuarioId === usuarioId && fav.productoId === productoId);
    if (favorito) {
      return await favoritoCrud.delete(favorito.id);
    }
  },
  
  getProductosFavoritosByCategoria: async (usuarioId, categoriaId) => {
    const favoritos = await favoritoCrud.getAll();
    return favoritos.filter(fav => fav.usuarioId === usuarioId && fav.producto.categoriaId === categoriaId);
  },
  



  
};