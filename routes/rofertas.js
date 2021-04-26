module.exports = function(app, swig, gestorBD) {

    let criterio = {

    }

    app.get("/ofertas", function(req, res) {
        gestorBD.obtenerOfertas( criterio,function(ofertas) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bofertas.html',
                    {
                        ofertas : ofertas
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/ofertas/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/bAgregarOferta.html', {

        });
        res.send(respuesta);
    })

    app.post('/oferta', function (req, res){
        let oferta = {
            titulo : req.body.titulo,
            detalle : req.body.detalle,
            precio : req.body.precio,
            autor : req.session.usuario
        }

        // Conectarse
        gestorBD.insertarOferta(oferta, function(id) {
            if (id == null) {
                res.send("Error al insertar oferta");
            } else {
                console.log("Oferta: " + req.body.titulo +"-" + oferta.detalle +"-"+ oferta.precio)
                res.redirect("/publicaciones");
            }
        });
    })

    app.get("/publicaciones", function(req, res) {
        let criterio = { autor : req.session.usuario };
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        ofertas : ofertas
                    });
                res.send(respuesta);
            }
        });
    });
};