/// <reference path="../node_modules/@types/jquery/index.d.ts" />



$(function(){
    alert("estoy aca");
    $("#btnEnviar").on("click", Login );
})



function Login():void 
{  

    let jwt = localStorage.getItem("jwt");

    let correo = $("#correo").val();
    let clave = $("#clave").val();

    let obj : any = {};
    obj.correo = correo;
    obj.clave = clave;
    alert("estoy en el login");

    $.ajax({
        
        type: 'POST',
        url: URL_API + "login",
        dataType: "json",
        //cache: false,
       // contentType: false,
       // processData: false,
        data: obj,
        //headers : {'Authorization': 'Bearer ' + jwt},
        async: true
    })
    .done(function (resultado:any) {
        alert("estoy en el doone");

        console.log(resultado);

        //let alerta:string = ArmarAlert(resultado);

        localStorage.setItem("jwt", resultado.jwt); 
        setTimeout(() => {
            $(location).attr('href', URL_BASE + "principal.html");
        }, 2000);        
    })
    .fail(function (jqXHR:any, textStatus:any, errorThrown:any) {

        alert("estoy en el fail");


        let retorno = JSON.parse(jqXHR.responseText);

        //let alerta:string = ArmarAlert(retorno.mensaje, "danger");
        console.log(retorno.mensaje);
        alert(retorno.mensaje);

    });    
}

