export class Pedido {
  constructor(data = {}) {
    this.pedidoId = data.pedidoId || null;
    this.usuarioId = data.usuarioId || null;
    this.negocioId = data.negocioId || null;
    this.repartidorId = data.repartidorId || null;
    this.metodoPagoId = data.metodoPagoId || null;
    this.estado = data.estado || 'pendiente';
    this.total = data.total || 0;
    this.direccion = data.direccion || '';
    this.fecha = data.fecha ? new Date(data.fecha) : new Date();
    this.items = data.items || [];
  }

  get totalFormateado() {
    return `$${this.total.toLocaleString('es-AR')}`;
  }

  get fechaFormateada() {
    return this.fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get estadoColor() {
    const colores = {
      pendiente: 'yellow',
      aceptado: 'blue',
      preparando: 'orange',
      listo: 'purple',
      en_camino: 'indigo',
      entregado: 'green',
      cancelado: 'red'
    };
    return colores[this.estado] || 'gray';
  }
}
