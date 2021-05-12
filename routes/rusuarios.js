module.exports = function(app, swig, gestorBD) {

    /**
     * Ruta que responde a la petición GET de registro del usuario
     */
    app.get("/registrarse", function(req, res) {
        console.log("GET registrarse")
        let respuesta = swig.renderFile('views/bregistro.html', {

        });
        res.send(respuesta);
    });

    /**
     * Ruta que responde a la petición GET de identificación del usuario
     */
    app.get("/identificarse", function(req, res) {
        console.log("GET identificarse")
        let respuesta = swig.renderFile('views/bidentificacion.html', {

        });
        res.send(respuesta);
    });

    /**
     * Ruta que responde a la petición GET de listar los usuarios
     * Mostrar todos los usuarios del sistema (no mostrar admin)
     */
    app.get("/usuarios", function (req, res){
        console.log("GET usuarios")
        let criterio = {
            email : {$ne:req.session.usuario}
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios){
            let respuesta = swig.renderFile('views/busuarios.html', {
                usuario : req.session.usuario,
                money : req.session.money,
                usuarios : usuarios
            });
            res.send(respuesta);
        });
    });


    /**
     * Ruta que responde al formulario de registro de usuario y crea uno nuevo
     * error si: password no repetida o usuario ya esta en el sistema
     */
    app.post('/usuario', function(req, res) {
        console.log("POST usuario")
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let usuario = {
            email : req.body.email,
            password : seguro,
            money : 100.0
        }
        if(req.body.password != req.body.passwordConfirm){
            app.get("ErrorHandler")(new Error("Las contraseñas no coinciden"), req, res);
        }
        if(req.body.password == req.body.passwordConfirm){
            let criterio = {
                email : usuario.email
            }
            gestorBD.obtenerUsuarios(criterio, function(usuarios) {
                if(usuarios.length > 0){
                    app.get("ErrorHandler")(new Error("Ya existe un usuario con ese email"), req, res);
                } else{
                    gestorBD.insertarUsuario(usuario, function(id) {
                            res.redirect("/ofertas");
                    });
                }
            });
        }
    });

    /**
     * Ruta que responde a la petición GET de eliminar un usuario de la base de datos según su id
     * Eliminar un usuario de la base de datos
     * Eliminaremos también las ofertas cuyo autor sea el usuario eliminado
     * Eliminaremos también los chats donde haya participado
     */
    app.get('/usuario/eliminar/:id', function (req, res) {
        console.log("GET usuario eliminar")
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerUsuarios(criterio, function (usuarios){
            let criterioOferta = {"autor" : usuarios[0].email}
            gestorBD.eliminarOferta(criterioOferta, function (ofertas){
                let criterioChat = {
                        "$or" : [
                        { "vendedor" : usuarios[0].email },
                        { "interesado" : usuarios[0].email }
                    ]
                }
                gestorBD.eliminarChat(criterioChat, function (chats){
                    gestorBD.eliminarUsuario(criterio,function(usuarios){
                        res.redirect("/usuarios");
                    })
                })
            });
        })
    });

    /**
     * Ruta que responde al formulario de identificación
     * error si: las credenciales son incorrectas
     */
    app.post("/identificarse", function(req, res) {
        console.log("POST identificarse")
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                app.get("ErrorHandler")(new Error("Las credenciales son incorrectas"), req, res);
            } else {
                req.session.usuario = usuarios[0].email;
                req.session.money = usuarios[0].money;
                res.redirect("/ofertas");
            }
        });
    });

    /**
     * Ruta que responde a la petición GET de desconexión de un usuario
     */
    app.get('/desconectarse', function (req, res) {
        console.log("GET desconectarse")
        req.session.usuario = null;
        res.redirect("/identificarse");
    })



};