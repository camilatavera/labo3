"use strict";
$(function () {
    alert("estoy aca");
    $("#btnEnviar").on("click", Login);
});
function Login() {
    var jwt = localStorage.getItem("jwt");
    var correo = $("#correo").val();
    var clave = $("#clave").val();
    var obj = {};
    obj.correo = correo;
    obj.clave = clave;
    alert("estoy en el login");
    $.ajax({
        type: 'POST',
        url: URL_API + "login",
        dataType: "json",
        data: obj,
        async: true
    })
        .done(function (resultado) {
        alert("estoy en el doone");
        console.log(resultado);
        localStorage.setItem("jwt", resultado.jwt);
        setTimeout(function () {
            $(location).attr('href', URL_BASE + "principal.html");
        }, 2000);
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
        alert("estoy en el fail");
        var retorno = JSON.parse(jqXHR.responseText);
        console.log(retorno.mensaje);
        alert(retorno.mensaje);
    });
}
//# sourceMappingURL=login.js.map