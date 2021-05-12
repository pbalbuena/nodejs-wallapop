module.exports = function(app, swig, gestorBD) {


    /**
     * Lista las ofertas disponibles para comprar, no muestra las ofertas YA COMPRADAS o las del usuario LOGUEADO
     */
    app.get("/ofertas", function(req, res) {
        console.log("GET ofertas")
        let criterio = {
            autor : {$ne:req.session.usuario},
            usuarioCompra : ""
        }

        //para la busqueda
        if( req.query.busqueda != null ){
            criterio = {
                "titulo" :  {$regex : ".*"+req.query.busqueda+".*"},
                autor : {$ne:req.session.usuario},
                usuarioCompra : ""
            };
        }

        gestorBD.obtenerOfertas( criterio,function(ofertas) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bofertas.html',
                    {
                        usuario : req.session.usuario,
                        money : req.session.money,
                        ofertas : ofertas
                    });
                res.send(respuesta);
            }
        });
    });

    /**
     * responde a la petición GET de agregar una oferta y carga la vista
     */
    app.get('/ofertas/agregar', function (req, res) {
        console.log("GET ofertas agregar")
        let respuesta = swig.renderFile('views/bAgregarOferta.html', {
            usuario : req.session.usuario,
            money : req.session.money
        });
        res.send(respuesta);
    })

    /**
     * Responde a la petición get de eliminar una oferta según su ID
     * Debemos ser el autor de esa oferta, sino no se permitirá
     */
    app.get('/ofertas/eliminar/:id', function (req, res) {
        console.log("GET ofertas eliminar")
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarOferta(criterio,function(ofertas){
            if ( ofertas == null ){
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    });

    /**
     * Responde al formulario POST de agregar una nueva oferta
     */
    app.post('/oferta', function (req, res){
        console.log("POST oferta")
        let oferta = {
            titulo : req.body.titulo,
            detalle : req.body.detalle,
            precio : req.body.precio,
            autor : req.session.usuario,
            usuarioCompra : ""
        }

        //no permitimos que el precio sea menor o igual que 0
        if(req.body.precio <= 0){
            app.get("ErrorHandler")(new Error("El precio debe ser mayor que 0."), req, res);
        } else {
            // Conectarse
            gestorBD.insertarOferta(oferta, function (id) {
                if (id == null) {
                    res.send("Error al insertar oferta");
                } else {
                    console.log("Oferta añadida: " + req.body.titulo + " ---- " + oferta.detalle + " ---- " + oferta.precio)
                    res.redirect("/publicaciones");
                }
            });
        }
    })

    /**
     * Usuario compra una oferta (error si no tiene suficiente dinero)
     */
    app.get('/ofertas/comprar/:id', function (req, res) {
        console.log("GET ofertas comprar")
        let ofertaId = gestorBD.mongo.ObjectID(req.params.id);
        let criterio = {
            "_id" : ofertaId
        }
        //obtengo la oferta y envío error si su precio es igual o menor al dinero del usuario
        gestorBD.obtenerOfertas(criterio, function (ofertas){
            console.log("Precio de la oferta: " + ofertas[0].precio+ " € ");
            console.log("Dinero del usuario: " + req.session.money + " € ")
            if(ofertas[0].precio > req.session.money){
                app.get("ErrorHandler")(new Error("No tienes suficiente dinero para comprar esto."), req, res);
            } else {
                //si tengo dinero suficiente para comprar, decremento el saldo del usuario y asigno la compra
                if(ofertas[0].precio <= req.session.money){
                    let modifiedMoney = req.session.money - ofertas[0].precio;
                    let modifiedUser = {
                        money : modifiedMoney
                    }
                    gestorBD.modificarUsuario({"email" : req.session.usuario }, modifiedUser, function (usuario){
                        let compra = {
                            usuarioCompra : req.session.usuario
                        }
                        req.session.money = modifiedMoney;
                        gestorBD.modificarOferta(criterio, compra, function(idCompra){
                            console.log("Oferta comprada con id: " + ofertaId +" por " + compra.usuarioCompra)
                            res.redirect("/compras");
                        });
                    });
                }
            }
        })
    });

    /**
     * Ver nuestras propias compras (las ofertas del usuario logueado)
     */
    app.get("/compras", function(req, res) {
        console.log("GET compras")
        let criterio = {
            usuarioCompra : req.session.usuario
        };
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bcompras.html',
                    {
                        usuario : req.session.usuario,
                        money : req.session.money,
                        ofertas : ofertas
                    });
                res.send(respuesta);
            }
        });
    });
    /**
     * Ver nuestras propias ofertas (las ofertas del usuario logueado)
     */
    app.get("/publicaciones", function(req, res) {
        console.log("GET publicaciones")
        let criterio = { autor : req.session.usuario };
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        usuario : req.session.usuario,
                        money : req.session.money,
                        ofertas : ofertas
                    });
                res.send(respuesta);
            }
        });
    });
};