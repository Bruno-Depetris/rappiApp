export class Categoria {
  constructor(data = {}) {
    this.categoriaId = data.categoriaId || null;
    this.nombre = data.nombre || '';
  }
}
