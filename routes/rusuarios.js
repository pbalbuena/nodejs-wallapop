module.exports = function(app, swig, gestorBD) {

    app.get("/registrarse", function(req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {

        });
        res.send(respuesta);
    });

    app.get("/identificarse", function(req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {

        });
        res.send(respuesta);
    });

    /**
     * Mostrar todos los usuarios del sistema (no mostrar admin)
     */
    app.get("/usuarios", function (req, res){
        let criterio = {

        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios){
            let respuesta = swig.renderFile('views/busuarios.html', {
                usuarios : usuarios
            });
            res.send(respuesta);
        });
    });


    /**
     * error si: password no repetida o usuario ya esta en el sistema
     */
    app.post('/usuario', function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let usuario = {
            email : req.body.email,
            password : seguro
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
     * Eliminar un usuario de la base de datos
     */
    app.get('/usuario/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarUsuario(criterio,function(usuarios){
            if ( usuarios == null ){
                res.send(respuesta);
            } else {
                res.redirect("/usuarios");
            }
        });
    });

    app.post("/identificarse", function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;

            } else {
                req.session.usuario = usuarios[0].email;
                req.session.money = usuarios[0].money;
                res.redirect("/ofertas");
            }
        });
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect("/identificarse");
    })



};