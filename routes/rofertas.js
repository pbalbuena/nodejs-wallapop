module.exports = function(app, swig, gestorBD) {


    /**
     * Lista las ofertas disponibles para comprar, no muestra las ofertas YA COMPRADAS o las del usuario LOGUEADO
     */
    app.get("/ofertas", function(req, res) {
        let criterio = {
            autor : {$ne:req.session.usuario},
            usuarioCompra : ""
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

    app.get('/ofertas/agregar', function (req, res) {

        let respuesta = swig.renderFile('views/bAgregarOferta.html', {
            usuario : req.session.usuario,
            money : req.session.money
        });
        res.send(respuesta);
    })

    app.get('/ofertas/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarOferta(criterio,function(ofertas){
            if ( ofertas == null ){
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    });



    app.post('/oferta', function (req, res){
        let oferta = {
            titulo : req.body.titulo,
            detalle : req.body.detalle,
            precio : req.body.precio,
            autor : req.session.usuario,
            usuarioCompra : ""
        }

        // Conectarse
        gestorBD.insertarOferta(oferta, function(id) {
            if (id == null) {
                res.send("Error al insertar oferta");
            } else {
                console.log("Oferta añadida: " + req.body.titulo +" ---- " + oferta.detalle +" ---- "+ oferta.precio)
                res.redirect("/publicaciones");
            }
        });
    })

    /**
     * Usuario compra una oferta (error si no tiene suficiente dinero)
     */
    app.get('/ofertas/comprar/:id', function (req, res) {
        let ofertaId = gestorBD.mongo.ObjectID(req.params.id);
        let criterio = {
            "_id" : ofertaId
        }
        //obtengo la oferta y envío error si su precio es igual o menor al dinero del usuario
        gestorBD.obtenerOfertas(criterio, function (ofertas){
            console.log("Precio de la oferta: " + ofertas[0].precio+ " € ");
            console.log("Dinero del usuario: " + req.session.money + " € ")
            if(ofertas[0].precio > req.session.money){
                throw new Error("No tienes suficiente dinero para comprar esto")
            }
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
        })
    });

    /**
     * Ver nuestras propias compras (las ofertas del usuario logueado)
     */
    app.get("/compras", function(req, res) {
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