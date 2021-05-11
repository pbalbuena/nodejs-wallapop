module.exports = function(app, gestorBD) {

    /**
     * Esta función responde a la peticion GET de la API REST devolviendo las ofertas disponibles para
     * una compra para el usuario identificado mediante el token
     */
    app.get("/api/ofertas", function(req, res) {
        console.log("GET api ofertas")
        let criterio = {
            // no se puede usar session en el cliente ligero, hay que usar el token (res.usuario)
            //autor : {$ne:req.session.usuario},
            autor : {$ne:res.usuario},
            usuarioCompra : ""
        }
        gestorBD.obtenerOfertas( criterio , function(ofertas) {
            if (ofertas == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(ofertas) );
            }
        });
    });

}

