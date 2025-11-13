// src/composables/useFavoritos.js

import { ref } from 'vue';
import { FavoritoService } from '../../private/services/favoritoService'; // Asegúrate de la ruta correcta
import { UsuarioService } from '../../private/services/usuarioService'; // Para obtener el usuarioId
import { Notificar } from "../utils/notificaciones";

// Estado centralizado
const favoritos = ref([]);

const useFavoritos = () => {
    
    const usuarioId = UsuarioService.obtenerUsuarioId(); // Asumiendo que esta función existe y devuelve el ID
    
    const syncFavoritos = async () => {
        if (!usuarioId) {
            favoritos.value = [];
            return;
        }
        try {
            // El servicio ya filtra por usuarioId, pero lo pasamos por seguridad
            const lista = await FavoritoService.getFavoritosByUsuario(usuarioId);
            // El backend debe devolver una lista de objetos que tienen productoId.
            // Mapeamos para tener solo los IDs de producto favoritos para facilitar la búsqueda
            favoritos.value = lista.map(fav => fav.productoId); 
        } catch (error) {
            console.error('Error al sincronizar favoritos:', error);
            Notificar.error('Error al cargar tus favoritos.');
        }
    };

    const isFavorito = (productoId) => {
        return favoritos.value.includes(productoId);
    };

    const toggleFavorito = async (productoId) => {
        if (!usuarioId) {
            Notificar.advertencia("Debes iniciar sesión para agregar favoritos.");
            return;
        }

        try {
            if (isFavorito(productoId)) {
                // Eliminar
                await FavoritoService.eliminarDeFavoritos(usuarioId, productoId);
                // Actualización rápida en el frontend
                favoritos.value = favoritos.value.filter(id => id !== productoId);
                Notificar.info('Producto eliminado de favoritos.', 2);
            } else {
                // Agregar
                await FavoritoService.agregarAFavoritos(usuarioId, productoId);
                // Actualización rápida en el frontend
                favoritos.value.push(productoId);
                Notificar.exito('Producto agregado a favoritos. ❤️', 2);
            }
        } catch (error) {
            console.error('Error al cambiar estado de favorito:', error);
            Notificar.error('Error al guardar favorito. Inténtalo de nuevo.');
            // En caso de fallo, forzamos sincronización
            syncFavoritos(); 
        }
    };
    
    return {
        favoritos,
        syncFavoritos,
        isFavorito,
        toggleFavorito
    };
};

export { useFavoritos };