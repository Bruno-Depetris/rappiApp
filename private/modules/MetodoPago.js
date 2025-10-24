export class MetodoPago {
  constructor(data = {}) {
    this.metodoPagoId = data.metodoPagoId || null;
    this.usuarioId = data.usuarioId || null;
    this.tipoMetodo = data.tipoMetodo || 'efectivo';
    this.detalles = data.detalles || {};
  }

  get nombreMetodo() {
    const nombres = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta de Crédito/Débito',
      transferencia: 'Transferencia Bancaria',
      mercadopago: 'Mercado Pago'
    };
    return nombres[this.tipoMetodo] || this.tipoMetodo;
  }
}
