export class ItemPedido {
  constructor(data = {}) {
    this.itemPedidoId = data.itemPedidoId || null;
    this.pedidoId = data.pedidoId || null;
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
}
