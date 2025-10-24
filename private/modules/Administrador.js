export class Administrador {
  constructor(data = {}) {
    this.adminId = data.adminId || null;
    this.usuario = data.usuario || '';
  }
}
