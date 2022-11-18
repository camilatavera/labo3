





$(()=>{


    $("#listar_usuarios").on("click", ()=>{
        ObtenerListadoUsuarios();
    });
    $("#listar_juguetes").on("click", ()=>{
        ObtenerListadoJuguetes();
    });

});






function ObtenerListadoJuguetes() {
   
    $("#divTablaIzq").html("");

    let jwt = localStorage.getItem("jwt");

    $.ajax({
        type: 'GET',
        url: URL_API + "listarJuguetesBD",
        dataType: "json",
        data: {},
        headers : {'Authorization': 'Bearer ' + jwt},
        async: true
    })
    .done(function (resultado:any) {

        console.log(resultado);

        let tabla:string = ArmarTablaJuguetes(resultado.dato);

        $("#divTablaIzq").html(tabla).show(1000);

    })
    .fail(function (jqXHR:any, textStatus:any, errorThrown:any) {

        let retorno = JSON.parse(jqXHR.responseText);

        alert(retorno.mensaje);
        console.log(retorno.mensaje);

        alert(jqXHR.status);

        if(jqXHR.status==403){
            alert("entre");
            setTimeout(() => {
                $(location).attr('href', URL_BASE + "login.html");
            }, 2000);
        }
        
            
    });    
}



function ObtenerListadoUsuarios() {
   
    $("#divTablaDer").html("");

    let jwt = localStorage.getItem("jwt");

    $.ajax({
        type: 'GET',
        url: URL_API + "listarUsuariosBD",
        dataType: "json",
        data: {},
        headers : {'Authorization': 'Bearer ' + jwt},
        async: true
    })
    .done(function (resultado:any) {

        console.log(resultado);

        let tabla:string = ArmarTablaUsuarios(resultado.dato);

        $("#divTablaDer").html(tabla).show(1000);

    })
    .fail(function (jqXHR:any, textStatus:any, errorThrown:any) {

        let retorno = JSON.parse(jqXHR.responseText);

        alert(retorno.mensaje);
        console.log(retorno.mensaje);

        alert(jqXHR.status);

        if(jqXHR.status==403){
            alert("entre");
            setTimeout(() => {
                $(location).attr('href', URL_BASE + "login.html");
            }, 2000);
        }
        
            
    });    
}


function ArmarTablaUsuarios(usuarios:[]) : string 
{   
    let tabla:string = '<table class="table table-dark table-hover">';
    tabla += '<tr><th>CORREO</th><th>NOMBRE</th><th>APELLIDO</th><th>PERFIL</th><th style="width:110px">FOTO</th></tr>';

    if(usuarios.length == 0)
    {
        tabla += '<tr><td>---</td><td>---</td><td>---</td><td>---</td><th>---</td></tr>';
    }
    else
    {
        usuarios.forEach((user : any) => {

            tabla += "<tr><td>"+user.correo+"</td><td>"+user.nombre+"</td><td>"+user.apellido+"</td><td>"+user.perfil+"</td>"+
            "<td><img src='"+URL_API+user.foto+"' width='50px' height='50px'></td><th>"
            
        });
    }

    tabla += "</table>";

    return tabla;
}



function ArmarTablaJuguetes(juguetes:any) : string 
{

    let tabla:string = '<table class="table table-dark table-hover">';
    tabla += '<tr><th>ID</th><th>MARCA</th><th>PRECIO</th><th>FOTO</th>></tr>';

    if(juguetes.length == 0)
    {
        tabla += '<tr><td>---</td><td>---</td><td>---</td><td>---</td></tr>';
    }
    else
    {
        juguetes.forEach((item : any) => {

            tabla += "<tr><td>"+item.id+"</td><td>"+item.marca+"</td><td>"+item.precio+"</td>"+
            "<td><img src='"+URL_API+item.path_foto+"' width='50px' height='50px'></td><th>"
            
        });
    }

    tabla += "</table>";

    return tabla;
}