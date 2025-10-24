export class Vendedor {
  constructor(data = {}) {
    this.vendedorId = data.vendedorId || null;
    this.usuarioId = data.usuarioId || null;
    this.negocioId = data.negocioId || null;
    this.direccion = data.direccion || '';
    this.telefono = data.telefono || '';
    this.horario = data.horario || '';
    this.comision = data.comision || 0;
  }
}
