export class Usuario {
  constructor(data = {}) {
    this.usuarioId = data.usuarioId || null;
    this.nombre = data.nombre || '';
    this.email = data.email || '';
    this.rol = data.rol || 'cliente';
    this.direccion = data.direccion || '';
  }
}
