"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var app = express();
app.set('puerto', 2022);
app.get('/', function (request, response) {
    response.send('GET - servidor NodeJS');
});
var fs = require('fs');
app.use(express.json());
var jwt = require("jsonwebtoken");
app.set("key", "cl@ve_secreta");
app.use(express.urlencoded({ extended: false }));
var multer = require('multer');
var mime = require('mime-types');
var storage = multer.diskStorage({
    destination: "public/",
});
var upload = multer({
    storage: storage
});
var cors = require("cors");
app.use(cors());
app.use(express.static("public"));
var mysql = require('mysql');
var myconn = require('express-myconnection');
var db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'jugueteria_bd'
};
app.use(myconn(mysql, db_options, 'single'));
app.get('/', function (request, response) {
    response.send('GET - servidor NodeJS');
});
var verificar_jwt = express.Router();
verificar_jwt.use(function (request, response, next) {
    var token = request.headers["x-access-token"] || request.headers["authorization"];
    if (!token) {
        response.status(403).send({
            exito: false,
            error: "El JWT es requerido!!!"
        });
        return;
    }
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }
    if (token) {
        jwt.verify(token, app.get("key"), function (error, decoded) {
            if (error) {
                return response.status(403).json({
                    exito: false,
                    mensaje: "El JWT NO es válido!!!"
                });
            }
            else {
                console.log("middleware verificar_jwt");
                response.jwt = decoded;
                next();
            }
        });
    }
});
app.get('/listarUsuariosBD', verificar_jwt, function (request, response) {
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from usuarios", function (err, rows) {
            if (err) {
                response.status(424).json({
                    exito: false,
                    mensaje: "Error al buscar los usuarios en la base de datos",
                    dato: null,
                    status: response.statusCode
                });
            }
            var arrayuser = [];
            rows.forEach(function (user) {
                if (user != null && user != undefined) {
                    arrayuser.push(user);
                }
            });
            response.json({
                exito: true,
                mensaje: "Listado completo de los usuarios obtenidos de la base de datos",
                dato: arrayuser,
                status: response.statusCode
            });
        });
    });
});
app.post('/agregarJugueteBD', verificar_jwt, upload.single("foto"), function (request, response) {
    var file = request.file;
    var extension = mime.extension(file.mimetype);
    var obj = JSON.parse(request.body.juguete_json);
    var path = file.destination + "juguetes/fotos/" + obj.marca + "." + extension;
    fs.renameSync(file.path, path);
    obj.path_foto = path.split("public/")[1];
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("insert into juguetes set ?", [obj], function (err, rows) {
            if (err) {
                response.json({
                    exito: false,
                    mensaje: "Error al conectarse a la base de datos" + err
                });
            }
            else {
                response.json({
                    exito: true,
                    mensaje: "Se agrego a la base de datos"
                });
            }
        });
    });
});
app.get('/listarJuguetesBD', verificar_jwt, function (request, response) {
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from juguetes", function (err, rows) {
            if (err) {
                response.status(424).json({
                    exito: false,
                    mensaje: "Error en al listar los juguetes",
                    dato: null,
                    status: response.status
                });
            }
            response.json({
                exito: true,
                mensaje: "Listado completo de los juguetes obtenidos de la base de datos",
                dato: rows,
                status: response.status
            });
        });
    });
});
app.post("/login", function (request, response) {
    var obj = request.body;
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from usuarios where correo = ? and clave = ? ", [obj.correo, obj.clave], function (err, rows) {
            if (err)
                throw ("Error en consulta de base de datos.");
            if (rows.length == 1) {
                var user = rows[0];
                var payload = {
                    usuario: {
                        id: user.id,
                        correo: user.correo,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        foto: user.foto,
                        perfil: user.perfil
                    },
                    alumno: "camila tavera",
                    parcial: "segundo parcial",
                };
                var token = jwt.sign(payload, app.get("key"), {
                    expiresIn: "30s"
                });
                response.json({
                    exito: true,
                    mensaje: "JWT creado!!!",
                    jwt: token
                });
            }
            else {
                response.status(401).json({
                    exito: false,
                    mensaje: "Apellido y/o Legajo incorrectos.",
                    jwt: null
                });
            }
        });
    });
});
app.get('/login', function (request, response) {
    var token = request.headers["x-access-token"] || request.headers["authorization"];
    if (!token) {
        response.status(401).send({
            error: "El JWT es requerido!!!"
        });
        return;
    }
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }
    if (token) {
        jwt.verify(token, app.get("key"), function (error, decoded) {
            if (error) {
                response.status(403).json({
                    exito: false,
                    mensaje: "El JWT NO es válido!!!",
                    payload: null,
                    status: response.statusCode
                });
            }
            else {
                var decoded_1 = jwt.decode(token, { complete: true });
                response.status(200).json({
                    status: response.statusCode,
                    exito: true,
                    mensaje: "Se muestra el token valido",
                    payload: decoded_1.payload,
                });
            }
        });
    }
});
app.delete('/toys', verificar_jwt, function (request, response) {
    var id = request.body.id_juguete;
    var path_foto = "public/";
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select path_foto from juguetes where id = ?", [id], function (err, result) {
            if (err)
                throw ("Error en consulta de base de datos.");
            path_foto += result[0].path_foto;
        });
    });
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("delete from juguetes where id = ?", [id], function (err, rows) {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            fs.unlink(path_foto, function (err) {
                if (err)
                    throw err;
                console.log(path_foto + ' fue borrado.');
            });
            response.send("Producto eliminado de la bd.");
        });
    });
});
app.post('/toys', verificar_jwt, upload.single("foto"), function (request, response) {
    var file = request.file;
    var extension = mime.extension(file.mimetype);
    var obj = JSON.parse(request.body.juguete);
    var path = file.destination + obj.marca + "_modificacion." + extension;
    fs.renameSync(file.path, path);
    obj.path = path.split("public/")[1];
    var obj_modif = {};
    obj_modif.marca = obj.marca;
    obj_modif.precio = obj.precio;
    obj_modif.path_foto = obj.path;
    request.getConnection(function (err, conn) {
        if (err) {
            response.status(418).json({
                exito: false,
                mensaje: "Error en la conexion a la base de datos",
                status: response.statusCode,
            });
        }
        conn.query("update juguetes set marca=?, precio=?, path_foto=? where id=?", [obj.marca, obj.precio, obj.path, obj.id_juguete], function (err, rows) {
            if (err) {
                response.status(418).json({
                    exito: false,
                    mensaje: "Error al modificar la base de datos",
                    status: response.statusCode,
                });
            }
            response.status(200).json({
                exito: true,
                mensaje: "Se modifico la base de datos",
                status: response.statusCode,
            });
        });
    });
});
app.listen(app.get('puerto'), function () {
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});
//# sourceMappingURL=servidor_node.js.map