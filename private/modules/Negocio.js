export class Negocio {
  constructor(data = {}) {
    this.negocioId = data.negocioId || null;
    this.categoriaId = data.categoriaId || null;
    this.nombreNegocio = data.nombreNegocio || '';
    this.categoria = data.categoria || null;
  }
}
