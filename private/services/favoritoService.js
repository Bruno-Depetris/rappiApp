import { createCrud } from '../api/crudFactory.js';

const favoritoCrud = createCrud('favoritos');

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