




import { resourceLimits } from "worker_threads";
import {Usuario} from "./poo/usuario.js"

const express = require('express');

const app = express();

app.set('puerto', 2022);

app.get('/', (request:any, response:any)=>{
    response.send('GET - servidor NodeJS');
});

//AGREGO FILE SYSTEM
const fs = require('fs');

//AGREGO JSON
app.use(express.json());

//AGREGO JWT
const jwt = require("jsonwebtoken");

//SE ESTABLECE LA CLAVE SECRETA PARA EL TOKEN
app.set("key", "cl@ve_secreta");

app.use(express.urlencoded({extended:false}));

//AGREGO MULTER
const multer = require('multer');

//AGREGO MIME-TYPES
const mime = require('mime-types');

//AGREGO STORAGE
const storage = multer.diskStorage({

    destination: "public/",
});

const upload = multer({

    storage: storage
});

//AGREGO CORS (por default aplica a http://localhost)
const cors = require("cors");

//AGREGO MW 
app.use(cors());

//DIRECTORIO DE ARCHIVOS ESTÁTICOS
app.use(express.static("public"));


//AGREGO MYSQL y EXPRESS-MYCONNECTION
const mysql = require('mysql');
const myconn = require('express-myconnection');
const db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'jugueteria_bd'
};

app.use(myconn(mysql, db_options, 'single'));

app.get('/', (request:any, response:any)=>{
    response.send('GET - servidor NodeJS');
});





const verificar_jwt = express.Router();

verificar_jwt.use((request:any, response:any, next:any)=>{

    //SE RECUPERA EL TOKEN DEL ENCABEZADO DE LA PETICIÓN
    let token = request.headers["x-access-token"] || request.headers["authorization"];
    
    if (! token) {
        response.status(403).send({
            exito: false,
            error: "El JWT es requerido!!!"
        });
        return;
    }

    if(token.startsWith("Bearer ")){
        token = token.slice(7, token.length);
    }

    if(token){
        //SE VERIFICA EL TOKEN CON LA CLAVE SECRETA
        jwt.verify(token, app.get("key"), (error:any, decoded:any)=>{

            if(error){
                return response.status(403).json({
                    exito: false,
                    mensaje:"El JWT NO es válido!!!"
                });
            }
            else{

                console.log("middleware verificar_jwt");

                //SE AGREGA EL TOKEN AL OBJETO DE LA RESPUESTA
                response.jwt = decoded;
                //SE INVOCA AL PRÓXIMO CALLEABLE
                next();
            }
        });
    }
});


app.get('/listarUsuariosBD', verificar_jwt,  (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from usuarios", (err:any, rows:any)=>{

            if(err) {
                    response.status(424).json({
                        exito : false,
                        mensaje : "Error al buscar los usuarios en la base de datos",
                        dato: null,
                        status:   response.statusCode
                    });
            }

           // var user= new Usuario();

           let arrayuser : Array<Usuario> = [];

           rows.forEach( (user:Usuario) => {
   
               if(user != null  && user != undefined){
   
                    arrayuser.push(user);
               }
           });

            //response.send(arrayuser);
            response.json({
                exito : true,
                mensaje : "Listado completo de los usuarios obtenidos de la base de datos",
                dato: arrayuser,
                status:   response.statusCode
            });

           // response.send(JSON.stringify(rows));
        });
    });

});




//AGREGAR
app.post('/agregarJugueteBD', verificar_jwt, upload.single("foto"), (request:any, response:any)=>{
   
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.juguete_json);
    let path : string = file.destination +"juguetes/fotos/" + obj.marca + "." + extension;

    fs.renameSync(file.path, path);

    obj.path_foto = path.split("public/")[1];

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("insert into juguetes set ?", [obj], (err:any, rows:any)=>{

            if(err) 
            {
                response.json({
                    exito : false,
                    mensaje : "Error al conectarse a la base de datos" + err
                })
            }
            else
            {
               
                response.json({
                    exito : true,
                    mensaje : "Se agrego a la base de datos"
                })
            }

            
        });
    });
});



app.get('/listarJuguetesBD', verificar_jwt, (request:any, response:any)=>{

    
    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from juguetes", (err:any, rows:any)=>{

            if(err) { 
                response.status(424).json({
                exito : false,
                mensaje : "Error en al listar los juguetes",
                dato: null,
                status:   response.statusCode
            });}

            response.json({
                exito : true,
                mensaje : "Listado completo de los juguetes obtenidos de la base de datos",
                dato: rows,
                status:   response.statusCode
            });

        });
    });

});



app.post("/login", (request:any, response:any)=>{

    //SE RECUPERA EL USUARIO DEL OBJETO DE LA RESPUESTA

    let obj = request.body;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from usuarios where correo = ? and clave = ? ", [obj.correo, obj.clave], (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            if(rows.length == 1){

                let user = rows[0];

                 //SE CREA EL PAYLOAD CON LOS ATRIBUTOS QUE NECESITAMOS
                const payload = { 
                    usuario: {
                        id : user.id,
                        correo : user.correo,
                        nombre : user.nombre,
                        apellido : user.apellido,
                        foto : user.foto,
                        perfil : user.perfil
                    },
                    alumno: "camila tavera",
                    parcial:"segundo parcial",
                    //api : "productos_usuar,os",
                };

                //SE FIRMA EL TOKEN CON EL PAYLOAD Y LA CLAVE SECRETA
                const token = jwt.sign(payload, app.get("key"), {
                    expiresIn : "30s"
                });

                response.json({
                    exito : true,
                    mensaje : "JWT creado!!!",
                    jwt : token
                });



            }
            else{
                response.status(401).json({
                    exito : false,
                    mensaje : "Apellido y/o Legajo incorrectos.",
                    jwt : null
                });
            }
           
        });
    });




   

});



app.get('/login', (request:any, response:any)=>{

    
      //SE RECUPERA EL TOKEN DEL ENCABEZADO DE LA PETICIÓN
      let token = request.headers["x-access-token"] || request.headers["authorization"];
    
      if (! token) {
          response.status(401).send({
              error: "El JWT es requerido!!!"
          });
          return;
      }
  
      if(token.startsWith("Bearer ")){
          token = token.slice(7, token.length);
      }
  
      if(token){
          //SE VERIFICA EL TOKEN CON LA CLAVE SECRETA
          jwt.verify(token, app.get("key"), (error:any, decoded:any)=>{
  
              if(error){
                    response.status(403).json({
                      exito: false,
                      mensaje:"El JWT NO es válido!!!",
                      payload: null,
                      status: response.statusCode
                  });
              }
              else{
                 let decoded = jwt.decode(token, {complete: true})
  
                    response.status(200).json({
                        status:response.statusCode,
                        exito: true,
                        mensaje:"Se muestra el token valido",
                        payload: decoded.payload,
                    });
              }
          });
      }

});



app.delete('/toys', verificar_jwt, (request:any, response:any)=>{
   
    let id = request.body.id_juguete;
    let path_foto : string = "public/";

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        //obtengo el path de la foto del producto a ser eliminado
        conn.query("select path_foto from juguetes where id = ?", [id], (err:any, result:any)=>{

            if(err) throw("Error en consulta de base de datos.");


            path_foto += result[0].path_foto;
        });
    });


    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("delete from juguetes where id = ?", [id], (err:any, rows:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos.");}

            fs.unlink(path_foto, (err:any) => {
                if (err) throw err;
                console.log(path_foto + ' fue borrado.');
            });

            response.send("Producto eliminado de la bd.");
        });
    });
});


//MODIFICAR
app.post('/toys', verificar_jwt, upload.single("foto"), (request:any, response:any)=>{
    
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.juguete);
    let path : string = file.destination + obj.marca + "_modificacion." + extension;

    fs.renameSync(file.path, path);

    obj.path = path.split("public/")[1];

    let obj_modif : any = {};
    obj_modif.marca = obj.marca;
    obj_modif.precio = obj.precio;
    obj_modif.path_foto = obj.path;

    request.getConnection((err:any, conn:any)=>{

        if(err) 
        {
            response.status(418).json({
                exito: false,
                mensaje:"Error en la conexion a la base de datos",
                status:response.statusCode,
            });
            
        }

        conn.query("update juguetes set marca=?, precio=?, path_foto=? where id=?", [obj.marca, obj.precio, obj.path, obj.id_juguete],  (err:any, rows:any)=>{

            if(err) {
                response.status(418).json({
                    exito: false,
                    mensaje:"Error al modificar la base de datos",
                    status:response.statusCode,
                });
            }

            
            response.status(200).json({
                exito: true,
                mensaje:"Se modifico la base de datos",
                status:response.statusCode,
            });
        });
    });
});







app.listen(app.get('puerto'), ()=>{
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});
