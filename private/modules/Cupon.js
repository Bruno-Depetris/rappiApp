export class Cupon {
  constructor(data = {}) {
    this.cuponId = data.cuponId || null;
    this.descuento = data.descuento || 0;
    this.codigo = data.codigo || '';
    this.fechaExpiracion = data.fechaExpiracion ? new Date(data.fechaExpiracion) : null;
  }

  get estaVigente() {
    if (!this.fechaExpiracion) return true;
    return new Date() < this.fechaExpiracion;
  }

  calcularDescuento(total) {
    return (total * this.descuento) / 100;
  }
}

