module.exports = function(app, gestorBD) {


    /**
     * Esta función responde a la petición POST del formulario de identificación, permitiendo
     * al usuario identificarse mediante la API REST
     */
    app.post('/api/autenticar', function (req,res){
        console.log("POST api autenticar")
        let seguro =  app.get("crypto").createHmac('sha256', app.get('clave')).
        update(req.body.password).digest('hex');

        let criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios){
            if(usuarios == null || usuarios.length == 0){
                res.status(401); //unauthorized
                res.json({
                    autenticado : false
                });
            }  else {
                let token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado : true,
                    token : token
                });
            }
        });
    });
}