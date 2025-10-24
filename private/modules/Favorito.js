export class Favorito {
  constructor(data = {}) {
    this.favoritoId = data.favoritoId || null;
    this.usuarioId = data.usuarioId || null;
    this.negocioId = data.negocioId || null;
    this.negocio = data.negocio || null;
  }
}
