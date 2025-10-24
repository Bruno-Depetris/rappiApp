export class CategoriaProducto {
  constructor(data = {}) {
    this.categoriaProductoId = data.categoriaProductoId || null;
    this.nombre = data.nombre || '';
  }
}
