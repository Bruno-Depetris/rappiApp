export class Carrito {
  constructor(data = {}) {
    this.carritoId = data.carritoId || null;
    this.usuarioId = data.usuarioId || null;
    this.negocioId = data.negocioId || null;
    this.items = data.items || [];
  }

  get total() {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get totalFormateado() {
    return `$${this.total.toLocaleString('es-AR')}`;
  }

  get cantidadItems() {
    return this.items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  agregarProducto(producto, cantidad = 1) {
    const itemExistente = this.items.find(item => item.productoId === producto.productoId);
    
    if (itemExistente) {
      itemExistente.cantidad += cantidad;
    } else {
      this.items.push(new CarritoItem({
        productoId: producto.productoId,
        producto: producto,
        cantidad: cantidad,
        precioUnitario: producto.precio
      }));
    }
  }

  eliminarProducto(productoId) {
    this.items = this.items.filter(item => item.productoId !== productoId);
  }

  vaciar() {
    this.items = [];
  }
}
