"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
var Usuario = (function () {
    function Usuario(id, marca, precio, path_foto) {
        if (id === void 0) { id = 0; }
        if (marca === void 0) { marca = ""; }
        if (precio === void 0) { precio = 0; }
        if (path_foto === void 0) { path_foto = ""; }
        this.id = id;
        this.marca = marca;
        this.precio = precio;
        this.path_foto = path_foto;
    }
    return Usuario;
}());
exports.Usuario = Usuario;
//# sourceMappingURL=usuario.js.map