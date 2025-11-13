// src/composables/useCarrito.js

import { ref, computed } from 'vue';
import { CarritoService } from '../../private/services'; // Asegúrate de que apunte a tu CarritoService.js
import { Notificar } from "../utils/notificaciones";
import { UsuarioService } from '../../private/services/usuarioService'; // Asegúrate de la ruta

// Estado centralizado (Fuera de la función para que sea compartido)
const carritoItems = ref([]);
const carritoCupones = ref([]);
const carritoInfo = ref({}); // Para guardar información general como subtotal, descuentos, etc.

// ==================== FUNCIONES COMPUTADAS ====================

// Calcula el total de productos únicos
const carritoUnidades = computed(() => 
    carritoItems.value.length
);

// Calcula la cantidad total de productos (sumando las cantidades de cada item)
const carritoCount = computed(() => 
    CarritoService.contarItems(carritoItems.value)
);

// Calcula el subtotal basándose en los datos locales
const carritoSubtotalLocal = computed(() =>
    // Asumimos que los items ya tienen precioUnitario cargado
    carritoItems.value.reduce((total, item) => total + (item.cantidad * item.precioUnitario), 0)
);

// Total final (usa el total de la API si está disponible, si no, usa el local)
const carritoTotal = computed(() => {
    return carritoInfo.value.total || carritoSubtotalLocal.value;
});


// ==================== LÓGICA DE PERSISTENCIA Y SINCRONIZACIÓN ====================

const syncCarritoData = async () => {
    try {
        // Obtenemos el carrito (que incluye items, cupones, subtotales, etc. del backend)
        const respuestaCarrito = await CarritoService.getMiCarrito(); 
        
        // Actualizamos los refs
        carritoItems.value = respuestaCarrito.items || [];
        carritoCupones.value = respuestaCarrito.cupones || [];
        // Guardamos el resumen calculado por el backend (más fiable)
        carritoInfo.value = respuestaCarrito; 
        
    } catch (error) {
        console.error('Error al sincronizar el carrito:', error);
        // Si el usuario no está logueado o no hay carrito, los arrays quedan vacíos
        carritoItems.value = [];
        carritoCupones.value = [];
        carritoInfo.value = {};
    }
}


// ==================== ACCIONES DEL CARRITO ====================

// En src/composables/useCarrito.js

const agregarAlCarrito = async (productoId, cantidad = 1) => {
    // 🛑 CORRECCIÓN: Usar UsuarioService para obtener las credenciales
    const token = UsuarioService.obtenerToken(); // Lee 'rappi_token'
    const usuarioId = UsuarioService.obtenerUsuarioId(); // Lee 'usuarioId' de 'rappi_usuario'
    
    // Si no hay token o usuario, detenemos la llamada 401 y notificamos.
    if (!usuarioId || !token) {
        Notificar.error("❌ Debes iniciar sesión para agregar productos al carrito.", 4);
        return; 
    }

    try {
        // 2. Llamada al servicio (Si el backend lo permite)
        await CarritoService.agregarItem(productoId, cantidad); 
        await syncCarritoData(); // Sincroniza el estado global después de la operación
        
        Notificar.exito('Producto agregado correctamente', 3);

    } catch (error) {
        // 3. Manejo de error 401 y otros errores de servidor
        if (error.message && error.message.includes('401')) {
            Notificar.error('Tu sesión expiró o no tienes permiso. Inicia sesión de nuevo.', 5);
        } else {
            Notificar.error('Error al cargar producto al carrito', 3);
        }
        console.error('Error al agregar al carrito:', error);
    }
};

const actualizarCantidad = async (itemId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
        // Si la cantidad es 0 o menos, mejor eliminar el item
        return eliminarItem(itemId);
    }

    try {
        await CarritoService.actualizarCantidad(itemId, nuevaCantidad);
        await syncCarritoData();
        Notificar.info('Cantidad actualizada.');
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
    }
};

const isDeleting = ref(false); // Estado para deshabilitar el botón

const eliminarItem = async (itemId) => {
    isDeleting.value = true; // Bloquea la UI al inicio
    try {
        console.log("⚠️ Intento de DELETE en item ID:", itemId);
        
        // 1. Llamada al DELETE original
        await CarritoService.eliminarItem(itemId);
        
        // 2. FILTRO INMEDIATO: Eliminamos el ítem del estado local (desaparece al instante)
        carritoItems.value = carritoItems.value.filter(item => item.carritoItemId !== itemId);
        
        // 3. Sincronización asíncrona: Llama a GET para actualizar totales SIN bloquear el DOM
        syncCarritoData(); 
        
        Notificar.exito('Producto eliminado del carrito.', 3);
        
    } catch (error) {
        // En caso de ERROR (404, 403, etc.), forzamos la sincronización SÍ o SÍ 
        // para limpiar cualquier ID obsoleto que causó el fallo.
        console.error('Error al eliminar item:', error);
        Notificar.error('No se pudo eliminar. Revisando estado del carrito.', 3);
        await syncCarritoData();
        
    } finally {
        isDeleting.value = false; // Desbloquea la UI al final
    }
};


const vaciarCarrito = async () => {
    try {
        await CarritoService.vaciarCarrito();
        await syncCarritoData();
        Notificar.exito('El carrito fue vaciado.', 3);
    } catch (error) {
        console.error('Error al vaciar carrito:', error);
        Notificar.error('Error al intentar vaciar el carrito.', 3);
    }
};


// ==================== FUNCIÓN PRINCIPAL ====================

export function useCarrito() {
    return {
        carritoItems,
        carritoCupones,
        carritoInfo,
        carritoCount,
        carritoTotal,
        carritoUnidades,
        syncCarritoData, // Función de carga inicial/sincronización
        agregarAlCarrito,
        actualizarCantidad,
        eliminarItem,
        vaciarCarrito,
        isDeleting, // <-- Exportamos el estado para deshabilitar botones
        // Otras acciones como aplicarCupon, etc., se añadirían aquí.
    };
}