export class CarritoItem {
  constructor(data = {}) {
    this.carritoItemId = data.carritoItemId || null;
    this.carritoId = data.carritoId || null;
    this.productoId = data.productoId || null;
    this.cantidad = data.cantidad || 1;
    this.precioUnitario = data.precioUnitario || 0;
    this.producto = data.producto || null;
  }

  get subtotal() {
    return this.cantidad * this.precioUnitario;
  }

  get subtotalFormateado() {
    return `$${this.subtotal.toLocaleString('es-AR')}`;
  }

  incrementar() {
    this.cantidad++;
  }

  decrementar() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }
}

