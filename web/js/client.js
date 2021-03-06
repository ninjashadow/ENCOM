/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function sesionFalse(men, status) {
    var color = {};
    color.rgb = (status == "BDError") ? "rgb(230,95,0)" : "rgb(255,0,0)";
    color.rgba = (status == "BDError") ? "rgba(230,95,0,.7)" : "rgb(255,0,0,.7)";
    color.msg = (status == "FatalError") ? "white" : color.rgb;
    color.finalBck = (status == "FatalError") ? color.rgba : "rgb(245,245,245)";
    color.finalBrd = (status == "FatalError") ? color.rgba : "#E3E3E3";
    men = (men == "Not Found") ? "Houston tenemos un problema :(" : men;
    $("#rdBtns").append("<span id='msg' style='display:none; width: 100px; color:" + color.msg + "; position:relative; float: left; font-size: small; text-align: left; bottom: 20px'>" + men + "</span>");
    var anim = $(".well, .input-group-addon");
    anim.animate({left: '15px'}, 100);
    anim.animate({left: '0px', right: '15px', backgroundColor: color.rgba, borderColor: color.rgb}, 100, function() {
        $("#msg").fadeIn("fast")
    });
    anim.animate({right: '0px', left: '15px'}, 100);
    anim.animate({left: '0px', backgroundColor: color.finalBck, borderColor: color.finalBrd}, 100);
}

function AlertMessage(element, id, message, status) {
    if (status == true) {
        element.animate({"backgroundColor": "rgba(255,0,0,.3)", "border": "1px solid rgba(255,0,0,.4)"}, "slow");
        if (element.find(".alert").length == 0) {
            element.append("<div class='alert frst'></div><div class='alert message'></div>");
            element.find(".frst").css({
                "width": "30px",
                "height": "15px",
                "background-color": "rgba(255,0,0,.3)",
                "border": "1px solid rgba(128,128,128,.4)",
                "position": "absolute",
                "padding": "0px",
                "left": "515px",
                "top": "39px",
                "opacity": "0"
            });
            element.find(".message").css({
                "width": "200px",
                "height": "100px",
                "background-color": "rgba(255,0,0,.3)",
                "border": "1px solid rgba(128,128,128,.4)",
                "position": "absolute",
                "padding": "10px 5px 10px 0",
                "left": "560px",
                "top": "-1px",
                "overflow": "hidden",
                "opacity": "0"
            })
                    .append("<ul></ul>");
            element.find(".message ul").css({
                "list-style-image": "url(../images/red_cross.png)",
                "padding-left": "30px"
            });
            element.find(".alert").fadeTo("slow", "1");
        }
        if (element.find("li#" + id).length == 0) {
            element.find(".message ul").append("<li id='" + id + "'>" + message + "</li>");
        }
    } else {
        if (element.find(".message li#" + id).length != 0) {
            element.find("li#" + id).remove();
            if (element.find(".message li").length == 0) {
                element.find(".alert").fadeTo("fast", "0", function() {
                    element.find(".alert").remove();
                });
            }
        }

        if (element.find(".alert").length == 0) {
            element.animate({"backgroundColor": "rgba(0,255,0,.3)", "border": "1px solid rgba(0,255,0,.4)"}, "slow");
        }
    }
}

function AlertMessage_Display(element, status) {
    if (status == true) {
        if (element.find(".alert") != 0) {
            element.find(".message").fadeTo(300, "0", function() {
                element.find(".alert").css({
                    "border": "1px solid rgba(0,0,255,.4)",
                    "background-color": "rgba(0,0,255,.3)"
                });
                $(this).css("height", "auto").fadeTo(300, "1");
            });

        }
    } else {
        if (element.find(".alert") != 0) {
            element.find(".message").fadeTo(300, "0", function() {
                element.find(".alert").css({
                    "border": "1px solid rgba(128,128,128,.4)",
                    "background-color": "rgba(255,0,0,.3)"
                });
                $(this).css("height", "100px").fadeTo(300, "1");
            });
        }
    }
}

function iniciarSesion() {
    $("#msg").fadeOut("fast", function() {
        $(this).remove();
    });
    var sourceInfo = {};
    sourceInfo.correo = jQuery("#correo").val();
    sourceInfo.password = jQuery("#passwd").val();
    if (sourceInfo.correo == "" || sourceInfo.password == "") {
        sesionFalse("No puede dejar campos vacios", "NoError");
        return false;
    }
    sourceInfo.administrador = false; //default
    var admin = $('input:radio[name=typeusr]:checked').val();
    if (admin == "1") {
        sourceInfo.administrador = true;
    }
    else if (admin == "0") {
        sourceInfo.administrador = false;
    }
    var JSONsrcInfo = JSON.stringify(sourceInfo);
    $.ajax
            ({
                async: false,
                type: 'POST',
                contentType: 'application/json',
                url: 'http://localhost:8080/ENCOM/API/Usuarios/IniciarSesion',
                dataType: "json",
                data: JSONsrcInfo,
                success: function(data) {
                    if (data.Sesion != null) {
                        if (data.Admin_User == true) {
                            $("body").fadeOut("fast");
                            localStorage.setItem("Sesion", true);
                            localStorage.setItem("Admin", true);
                            localStorage.setItem("ID", data.ID);
                            localStorage.setItem("Nombre", data.Nombre);
                            window.location = "Administrador/";
                        }
                        else {
                            $("body").fadeOut("fast");
                            localStorage.setItem("Sesion", true);
                            localStorage.setItem("Admin", false);
                            localStorage.setItem("ID", data.ID);
                            localStorage.setItem("Nombre", data.Nombre);
                            window.location = "Profesor/";
                        }
                    }
                    else {
                        if (data.Error == true) {
                            sesionFalse(data.Mensaje, "BDError");
                        } else {
                            sesionFalse(data.Mensaje, "NoError");
                        }
                        //window.location="index.jsp";
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    sesionFalse(xhr.statusText, "FatalError");
                }
            });
    return false;
}

function cerrarSesion() {
    localStorage.removeItem("Nombre");
    localStorage.removeItem("Sesion");
    localStorage.removeItem("Admin");
    localStorage.removeItem("ID");
    $("body").fadeOut("fast", function() {
        window.location.href = "../";
    });
}

function registrarEvento() {
    //validaciones inicio
    if ($("#nombre").val() == "") {
        $("#nombre").focus();
        return false;
    } else if ($("#fecha").val() == "") {
        $("#fecha").focus();
        return false;
    } else if ($("#hora").val() == "") {
        $("#hora").focus();
        return false;
    } else if ($("#descripcion").val() == "") {
        $("#descripcion").focus();
        return false;
    }

    if ($("div.campo .alert").length != 0) {
        $("div.campo .alert").eq(0).parents(".campo").find("input").focus();
        return false;
    }
    //validaciones fin

    var sourceInfo = {};
    sourceInfo.Nombre = jQuery("#nombre").val();
    sourceInfo.Descripcion = jQuery("#descripcion").val();
    sourceInfo.Fecha = jQuery("#fecha").val();
    var tmpHora = jQuery("#hora").val();
    if (tmpHora.length == 8) {
        sourceInfo.Hora = tmpHora;
    }
    else {
        sourceInfo.Hora = tmpHora + ":00";
    }
    sourceInfo.Duracion = jQuery("#duracion").val();

    var jsonString = JSON.stringify(sourceInfo);
    $.ajax({
        async: true,
        type: 'POST',
        contentType: 'application/json',
        url: 'http://localhost:8080/ENCOM/API/Eventos/RegistrarEvento',
        dataType: "json",
        data: jsonString,
        success: function(data) {
            alert(data.Mensaje);
            $("#Ev_Con").click();
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.statusText);
        }
    }
    );
    return false;
}
function obtenerEventos() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/ENCOM/API/Eventos/ObtenerEventos',
        dataType: "json",
        success: function(data) {
            for (var evento in data.Eventos) {
                var evts = data.Eventos[evento];
                var tr = {};
                tr.tdId = "<td>" + evts.ID_Evento + "</td>";
                tr.tdNo = "<td>" + evts.Nombre + "</td>";
                tr.tdDe = "<td>" + evts.Descripcion + "</td>";
                tr.tdFe = "<td>" + evts.Fecha + "</td>";
                tr.tdHo = "<td>" + evts.Hora + "</td>";
                tr.tdDu = "<td>" + evts.Duracion + "</td>";
                $("#tabla").append("<tr>" + tr.tdId + tr.tdNo + tr.tdDe + tr.tdFe + tr.tdHo + tr.tdDu + "</tr>");
            }
            $("#tabla tr").last().empty();
            $("#tabla").css("margin-bottom", "0px");
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.statusText);
        }
    });
    return false;
}
function obtenerEventoIndividual() {
    var x = $("#nombre").val();
    if (x == "") {
        $("#nombre").focus();
        return false;
    }
    var src = {};
    src.Nombre = jQuery("#nombre").val();
    var srcJs = JSON.stringify(src);
    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: 'http://localhost:8080/ENCOM/API/Eventos/ObtenerDatosEvento',
        dataType: "json",
        data: srcJs,
        success: function(data) {
            if (data.Busqueda == true)
            {
                jQuery("#busqueda").fadeOut("fast");
                jQuery("#modificar").fadeIn("fast");
                $("#modificar form").prepend("<input type='hidden' id='id' value='" + data.Id + "'/>");
                $("#nombre2").val(data.Nombre);
                $("#descripcion").val(data.Descripcion);
                $("#fecha").val(data.Fecha);
                $("#hora").val(data.Hora);
                $("#duracion").val(data.Duracion);
            }
            else {
                alert(data.Mensaje);
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.statusText);
        }
    });
    return false;
}
function actualizarEvento() {
    if ($("#fecha").val() == "") {
        $("#fecha").focus();
        return false;
    } else if ($("#hora").val() == "") {
        $("#hora").focus();
        return false;
    } else if ($("#descripcion").val() == "") {
        $("#descripcion").focus();
        return false;
    }
    if ($("div.campo .alert").length != 0) {
        $("div.campo .alert").eq(0).parents(".campo").find("input").focus();
        return false;
    }
    var sourceInfo = {};
    sourceInfo.Id = jQuery("#id").val();
    sourceInfo.Nombre = jQuery("#nombre2").val();
    sourceInfo.Descripcion = jQuery("#descripcion").val();
    sourceInfo.Fecha = jQuery("#fecha").val();
    var tmpHora = jQuery("#hora").val();
    if (tmpHora.length == 8) {
        sourceInfo.Hora = tmpHora;
    }
    else {
        sourceInfo.Hora = tmpHora + ":00";
    }
    sourceInfo.Duracion = jQuery("#duracion").val();

    var jsonString = JSON.stringify(sourceInfo);
    $.ajax({
        async: true,
        type: 'PUT',
        contentType: 'application/json',
        url: 'http://localhost:8080/ENCOM/API/Eventos/ModificarEvento',
        dataType: "json",
        data: jsonString,
        success: function(data) {
            alert(data.Mensaje);
            $("#Ev_Con").click();
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.statusText);
        }
    }
    );
    return false;
}
function CaducarEvento() {
    if ($("#nombre").val() == "") {
        $("#nombre").focus();
        return false;
    }
    var x = confirm("Esta seguro que quiere caducar el evento? Una vez realizado no se podra recuperar");
    if (x == true) {
        var src = {};
        src.Nombre = jQuery("#nombre").val();
        var srcJs = JSON.stringify(src);
        $.ajax({
            type: 'PUT',
            contentType: 'application/json',
            url: 'http://localhost:8080/ENCOM/API/Eventos/CaducarEvento',
            dataType: "json",
            data: srcJs,
            success: function(data) {
                if (data.Deshabilitar == true) {
                    alert(data.Mensaje);
                    $("#Ev_Con").click();
                }
                else {
                    alert(data.Mensaje);
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                alert(xhr.statusText);
            }
        });
    }
    else {
        return false;
    }
    return false;
}

function registrarUsuario() {
    if ($("#correo").val() == "") {
        $("#correo").focus();
        return false;
    } else if ($("#passwd").val() == "") {
        $("#passwd").focus();
        return false;
    } else if ($("#idW").val() == "") {
        ;
        $("#idW").focus();
        return false;
    } else if ($("#nombre").val() == "") {
        $("#nombre").focus();
        return false;
    } else if ($("#direccion").val() == "") {
        $("#direccion").focus();
        return false;
    }
    if ($("div.campo .alert").length != 0) {
        $("div.campo .alert").eq(0).parents(".campo").find("input").focus();
        return false;
    }
    var src = {};
    src.correo = jQuery("#correo").val();
    src.password = jQuery("#passwd").val();
    src.id = jQuery("#idW").val();
    src.nombre = jQuery("#nombre").val();
    src.direccion = jQuery("#direccion").val();
    var admin = $('input:radio[name=typeusr]:checked').val();
    if (admin == "1") {
        src.administrador = true;
    }
    else {
        src.administrador = false;
    }
    var jstring = JSON.stringify(src);
    $.ajax({
        async: true,
        type: 'POST',
        contentType: 'application/json',
        url: 'http://localhost:8080/ENCOM/API/Usuarios/RegistrarUsuario',
        dataType: "json",
        data: jstring,
        success: function(data) {
            alert(data.Mensaje);
            $("#Us_ConG").click();
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.statusText);
        }
    }
    );
    return false;
}
function obtenerUsuarios() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/ENCOM/API/Usuarios/ObtenerDatosGenerales',
        dataType: "json",
        success: function(data) {
            for (var usuario in data.Usuarios) {
                var users = data.Usuarios[usuario];
                var tr = {};
                var admin = (users.Administrador == 1) ? "Si" : "No";
                tr.tdCo = "<td>" + users.Correo + "</td>";
                tr.tdId = "<td>" + users.ID + "</td>";
                tr.tdNo = "<td>" + users.Nombre + "</td>";
                tr.tdDi = "<td>" + users.Direccion + "</td>";
                tr.tdAd = "<td>" + admin + "</td>";
                $("#tabla").append("<tr>" + tr.tdNo + tr.tdId + tr.tdCo + tr.tdDi + tr.tdAd + "</tr>");
            }
            $("#tabla tr").last().empty();
            $("#tabla").css("margin-bottom", "0px");
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.statusText);
        }
    });
    return false;
}
function busquedaUsuario() {
    if ($("#idWT").val() == "") {
        $("#idWT").focus();
        return false;
    }
    if ($("div.campo .alert").length != 0) {
        $("div.campo .alert").eq(0).parents(".campo").find("input").focus();
        return false;
    }
    var src = {};
    src.correo = jQuery("#idWT").val();
    var jsonString = JSON.stringify(src);
    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: 'http://localhost:8080/ENCOM/API/Usuarios/ObtenerDatosPersonales',
        dataType: "json",
        data: jsonString,
        success: function(data) {
            if (data.Busqueda == true)
            {
                var admin = (data.Administrador == 1) ? "Si" : "No";
                var tr = {};
                tr.tdCo = "<td>" + data.Correo + "</td>";
                tr.tdId = "<td>" + data.ID + "</td>";
                tr.tdNo = "<td>" + data.Nombre + "</td>";
                tr.tdDi = "<td>" + data.Direccion + "</td>";
                tr.tdPa = "<td>" + data.Password + "</td>";
                tr.tdAd = "<td>" + admin + "</td>";
                $("#tabla").append("<tr>" + tr.tdCo + tr.tdPa + tr.tdId + tr.tdNo + tr.tdDi + tr.tdAd + "</tr>");

                jQuery("#busqueda").fadeOut("fast");
                jQuery("#mostrar").fadeIn("fast");
            }
            else {
                alert(data.Mensaje);
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.statusText);
        }
    });
    return false;
}
function busquedaUsuarioM() {
    if ($("#idWT").val() == "") {
        $("#idWT").focus();
        return false;
    }
    if ($("div.campo .alert").length != 0) {
        $("div.campo .alert").eq(0).parents(".campo").find("input").focus();
        return false;
    }
    var src = {};
    src.correo = jQuery("#idWT").val();
    var jsonString = JSON.stringify(src);
    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: 'http://localhost:8080/ENCOM/API/Usuarios/ObtenerDatosPersonales',
        dataType: "json",
        data: jsonString,
        success: function(data) {
            if (data.Busqueda == true)
            {
                jQuery("#correo").val(data.Correo);
                jQuery("#passwd").val(data.Password);
                jQuery("#cpasswd").val(data.Password);
                jQuery("#idW").val(data.ID);
                jQuery("#nombre").val(data.Nombre);
                jQuery("#direccion").val(data.Direccion);
                if (data.Administrador == true) {
                    jQuery("#typeusr").val("Permisos de administrador");
                }
                else {
                    jQuery("#typeusr").val("Permisos de usuario estandar");
                }
                $("#search").fadeOut("fast");
                $("#change").fadeIn("fast");
            }
            else {
                alert(data.Mensaje);
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.statusText);
        }
    });
    return false;
}
function updateUser() {
    if ($("#passwd").val() == "") {
        $("#passwd").focus();
        return false;
    } else if ($("#idW").val() == "") {
        $("#idW").focus();
        return false;
    } else if ($("#direccion").val() == "") {
        $("#direccion").focus();
        return false;
    }
    if ($("div.campo .alert").length != 0) {
        $("div.campo .alert").eq(0).parents(".campo").find("input").focus();
        return false;
    }
    var src = {};
    src.correo = jQuery("#correo").val();
    src.password = jQuery("#passwd").val();
    src.usuario = jQuery("#nombre").val();
    src.id = jQuery("#idW").val();
    src.direccion = jQuery("#direccion").val();
    var datos = JSON.stringify(src);
    $.ajax({
        type: 'PUT',
        contentType: 'application/json',
        url: 'http://localhost:8080/ENCOM/API/Usuarios/ModificarDatosUsuario',
        dataType: 'json',
        data: datos,
        success: function(data) {
            if (data.Arreglado == true) {
                alert(data.Mensaje);
                $("#Us_ConG").click();
            }
            else {
                alert(data.Mensaje);
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.statusText);
        }
    });
    return false;
}
function EliminarUsuario() {
    if ($("#idWT").val() == "") {
        $("#idWT").focus();
        return false;
    }
    if ($("div.campo .alert").length != 0) {
        $("div.campo .alert").eq(0).parents(".campo").find("input").focus();
        return false;
    }
    var x = confirm("Se eliminara permanentemente al usuario, sea administrador o profesor, ¿desea continuar?");
    if (x == true) {
        var src = {};
        src.correo = jQuery("#idWT").val();
        var jsonString = JSON.stringify(src);

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: 'http://localhost:8080/ENCOM/API/Usuarios/EliminarUsuario',
            dataType: 'json',
            data: jsonString,
            success: function(data) {
                if (data.Eliminado == true) {
                    alert(data.Mensaje);
                    $("#Us_ConG").click();
                } else {
                    alert(data.Mensaje);
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                alert(xhr.statusText);
            }
        });
        return false;
    }
    else {
        return false;
    }
}

function registrarMateria() {

    if ($("#idMat").val() == "") {
        $("#idMat").focus();
        return false;
    } else if ($("#nombreMat").val() == "") {
        $("#nombreMat").focus();
        return false;
    } else if ($("#semestre").val() == "") {
        $("#semestre").focus();
        return false;
    }
    if ($("div.campo .alert").length != 0) {
        $("div.campo .alert").eq(0).parents(".campo").find("input").focus();
        return false;
    }

    var sourceInfo = {};
    sourceInfo.nombreMat = jQuery("#nombreMat").val();
    sourceInfo.idMat = jQuery("#idMat").val();
    sourceInfo.Semestre = jQuery("#semestre").val();
    var jsonString = JSON.stringify(sourceInfo);
    $.ajax({
        async: true,
        type: 'POST',
        contentType: 'application/json',
        url: 'http://localhost:8080/ENCOM/API/Horarios/RegistrarMateria',
        dataType: "json",
        data: jsonString,
        success: function(data) {
            alert(data.Mensaje);
            if (data.ID != true) {
                $("#Ho_RegMa").click();
            } else {
                $("#idMat").focus();
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.statusText);
        }
    }
    );
    return false;
}

            