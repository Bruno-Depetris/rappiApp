import { ref, computed } from 'vue';
import { CarritoService } from '../../private/services'; 
import { Notificar } from "../utils/notificaciones";
import { UsuarioService } from '../../private/services/usuarioService'; 

const carritoItems = ref([]);
const carritoCupones = ref([]);
const carritoInfo = ref({}); 
const isDeleting = ref(false);
const isLoading = ref(false);

const carritoUnidades = computed(() => 
    carritoItems.value.length
);

const carritoCount = computed(() => 
    CarritoService.contarItems(carritoItems.value)
);

const carritoSubtotal = computed(() => 
    carritoInfo.value.subtotal || 0
);

const carritoDescuentos = computed(() => 
    carritoInfo.value.totalDescuentos || 0
);

const carritoTotal = computed(() => 
    carritoInfo.value.total || 0
);

const carritoEstado = computed(() => 
    carritoInfo.value.estado || 'Activo'
);

const carritoId = computed(() => 
    carritoInfo.value.carritoId || null
);

const carritoVacio = computed(() => 
    carritoItems.value.length === 0
);

const syncCarritoData = async () => {
    try {
        isLoading.value = true;
        const respuestaCarrito = await CarritoService.getMiCarrito(); 

        carritoItems.value = respuestaCarrito.items || [];
        carritoCupones.value = respuestaCarrito.cupones || [];
        carritoInfo.value = respuestaCarrito; 
        
    } catch (error) {
        console.error('Error al sincronizar el carrito:', error);
        carritoItems.value = [];
        carritoCupones.value = [];
        carritoInfo.value = {};
    } finally {
        isLoading.value = false;
    }
};

const agregarAlCarrito = async (productoId, cantidad = 1) => {
    const token = UsuarioService.obtenerToken(); 
    const usuarioId = UsuarioService.obtenerUsuarioId(); 
    
    if (!usuarioId || !token) {
        Notificar.error("Debes iniciar sesión para agregar productos al carrito.", 4);
        return; 
    }

    try {
        await CarritoService.agregarItem(productoId, cantidad); 
        await syncCarritoData(); 
        
        Notificar.exito('Producto agregado correctamente', 3);

    } catch (error) {
        if (error.message && error.message.includes('401')) {
            Notificar.error('Tu sesión expiró. Inicia sesión de nuevo.', 5);
        } else if (error.message && error.message.includes('Stock insuficiente')) {
            Notificar.error('No hay suficiente stock disponible', 3);
        } else {
            Notificar.error('Error al agregar producto al carrito', 3);
        }
        console.error('Error al agregar al carrito:', error);
    }
};

const actualizarCantidad = async (itemId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
        return eliminarItem(itemId);
    }

    try {
        await CarritoService.actualizarCantidad(itemId, nuevaCantidad);
        await syncCarritoData();
        Notificar.exito('Cantidad actualizada');
    } catch (error) {
        if (error.message && error.message.includes('Stock insuficiente')) {
            Notificar.error('No hay suficiente stock', 3);
            await syncCarritoData(); 
        } else {
            console.error('Error al actualizar cantidad:', error);
            Notificar.error('Error al actualizar cantidad', 3);
        }
    }
};

const eliminarItem = async (itemId) => {
    isDeleting.value = true;
    try {
        await CarritoService.eliminarItem(itemId);

        carritoItems.value = carritoItems.value.filter(
            item => item.carritoItemId !== itemId
        );

        syncCarritoData(); 
        
        Notificar.exito('Producto eliminado del carrito', 3);
        
    } catch (error) {
        console.error('Error al eliminar item:', error);
        Notificar.error('No se pudo eliminar. Revisando estado del carrito', 3);
        await syncCarritoData();
    } finally {
        isDeleting.value = false;
    }
};

const vaciarCarrito = async () => {
    try {
        await CarritoService.vaciarCarrito();
        await syncCarritoData();
        Notificar.exito('El carrito fue vaciado', 3);
    } catch (error) {
        console.error('Error al vaciar carrito:', error);
        Notificar.error('Error al intentar vaciar el carrito', 3);
    }
};

const aplicarCupon = async (codigo) => {
    if (!codigo || codigo.trim() === '') {
        Notificar.error('Ingresa un código de cupón', 3);
        return;
    }

    try {
        await CarritoService.aplicarCupon(codigo.trim().toUpperCase());
        await syncCarritoData();
        Notificar.exito('Cupón aplicado correctamente', 3);
    } catch (error) {
        console.error('Error al aplicar cupón:', error);
        
        if (error.message) {
            if (error.message.includes('no encontrado')) {
                Notificar.error('Cupón no válido', 3);
            } else if (error.message.includes('expirado')) {
                Notificar.error('El cupón ha expirado', 3);
            } else if (error.message.includes('límite')) {
                Notificar.error('El cupón alcanzó su límite de usos', 3);
            } else if (error.message.includes('ya está aplicado')) {
                Notificar.error('Este cupón ya está aplicado', 3);
            } else if (error.message.includes('vacío')) {
                Notificar.error('Agrega productos antes de aplicar un cupón', 3);
            } else {
                Notificar.error('Error al aplicar cupón', 3);
            }
        } else {
            Notificar.error('Error al aplicar cupón', 3);
        }
    }
};

const removerCupon = async (carritoCuponId) => {
    try {
        await CarritoService.removerCupon(carritoCuponId);
        await syncCarritoData();
        Notificar.info('Cupón removido');
    } catch (error) {
        console.error('Error al remover cupón:', error);
        Notificar.error('Error al remover cupón', 3);
    }
};

const productoEnCarrito = (productoId) => {
    return CarritoService.productoEnCarrito(carritoItems.value, productoId);
};

const buscarItemPorProducto = (productoId) => {
    return CarritoService.buscarItemPorProducto(carritoItems.value, productoId);
};

const formatearPrecio = (precio) => {
    return CarritoService.formatearPrecio(precio);
};

export function useCarrito() {
    return {
        carritoItems,
        carritoCupones,
        carritoInfo,
        isDeleting,
        isLoading,

        carritoCount,
        carritoUnidades,
        carritoSubtotal,
        carritoDescuentos,
        carritoTotal,
        carritoEstado,
        carritoId,
        carritoVacio,

        syncCarritoData,

        agregarAlCarrito,
        actualizarCantidad,
        eliminarItem,
        vaciarCarrito,

        aplicarCupon,
        removerCupon,

        productoEnCarrito,
        buscarItemPorProducto,
        formatearPrecio,
    };
}