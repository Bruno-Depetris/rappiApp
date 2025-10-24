export class Producto {
  constructor(data = {}) {
    this.productoId = data.productoId || null;
    this.vendedorId = data.vendedorId || null;
    this.categoriaProductoId = data.categoriaProductoId || null;
    this.nombre = data.nombre || '';
    this.precio = data.precio || 0;
    this.descripcion = data.descripcion || '';
    this.disponibilidad = data.disponibilidad || 1;
    this.imagenes = data.imagenes || [];
  }
  get precioFormateado() {
    return `$${this.precio.toLocaleString('es-AR')}`;
  }

  get estaDisponible() {
    return this.disponibilidad === 1;
  }

  get imagenPrincipal() {
    return this.imagenes[0] || '/placeholder-producto.jpg';
  }
}
