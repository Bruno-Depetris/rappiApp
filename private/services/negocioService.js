import { createCrud } from '../api/crudFactory.js';

const negocioCrud = createCrud('negocios');

export const NegocioService = {
  ...negocioCrud,
  
  getNegociosByCategoria: async (categoriaId) => {
    const response = await fetch(`${API_BASE}/negocios/categoria/${categoriaId}`);
    if (!response.ok) throw new Error('Negocios not found for categoria');
    return response.json();
  },
  
  getNegociosActivos: async () => {
    const response = await fetch(`${API_BASE}/negocios/activos`);
    if (!response.ok) throw new Error('Active negocios not found');
    return response.json();
  },
  
  buscarNegocios: async (termino) => {
    const response = await fetch(`${API_BASE}/negocios/buscar?q=${encodeURIComponent(termino)}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },
  
  cambiarEstadoNegocio: async (id, estado) => {
    const response = await fetch(`${API_BASE}/negocios/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    if (!response.ok) throw new Error('Failed to change negocio estado');
    return response.json();
  },
  
  getNegociosByVendedor: async (vendedorId) => {
    const response = await fetch(`${API_BASE}/negocios/vendedor/${vendedorId}`);
    if (!response.ok) throw new Error('Negocios not found for vendedor');
    return response.json();
  },

  // Actualizar el negocio creo que es nombre y un par mas de cosas pero despues se puede ver que validacion para ver que puede actualizar en especifico
  updateNegocio: async (id, data) => {
    return await negocioCrud.update(id, data);
  },

  // Obtener pedidos con mis productos
  //nose si ponerlo aca o en vendedor AYUDAAAA (y los que siguen)
  getPedidosConMisProductos: async (vendedorId) => {
    const pedidos = await pedidoCrud.getAll();
    return pedidos.filter(pedido => {
      if (!pedido.detalles) return false;
      return pedido.detalles.some(detalle => detalle.vendedorId === vendedorId);
    });
  },

  // Filtrar mis pedidos por estado
  getMisPedidosByEstado: async (vendedorId, estado) => {
    const pedidos = await NegocioService.getPedidosConMisProductos(vendedorId);
    return pedidos.filter(pedido => pedido.estado === estado);
  },

  // este se puede usar tambien para impuestos pero tampoco se donde ponerlo encima no me acuerdo si el negocio tiene esto, pero bueno XD
  calcularComision: (total, porcentaje) => {
    return (total * porcentaje) / 100;
  },

// Calcular ganancia neta para hacerle un pequeño informe al vendedor de cuanto va ganando (asi ve solo lo que gana y no lo que piernde con los hacer los productos le gana el consumismo y usa mas nuestra app)
  calcularGananciaNeta: (total, porcentaje) => {
    return total - NegocioService.calcularComision(total, porcentaje);
  },


  



};