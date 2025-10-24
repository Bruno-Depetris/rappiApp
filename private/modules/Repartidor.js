export class Repartidor {
  constructor(data = {}) {
    this.repartidorId = data.repartidorId || null;
    this.usuarioId = data.usuarioId || null;
    this.vehiculo = data.vehiculo || '';
  }
}
