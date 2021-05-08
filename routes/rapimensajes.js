module.exports = function(app, gestorBD) {

    /**
     * Sirve para obtener los mensajes de chat entre un usuario interesado y el vendedor de la oferta
     */
    app.get("/api/ofertas/:id", function(req, res) {
        let criterioOferta = {
            "_id" : gestorBD.mongo.ObjectID(req.params.id),
        }

        gestorBD.obtenerOfertas(criterioOferta, function (ofertas){
            let criterioChat = {
                "oferta_id" : gestorBD.mongo.ObjectID(req.params.id),
                "vendedor" : ofertas[0].autor,
                "interesado" : res.usuario,
            }

            gestorBD.obtenerChats(criterioChat, function (chats){
                let chat = {
                    "oferta_id": criterioChat.oferta_id,
                    "vendedor": criterioChat.vendedor,
                    "interesado": criterioChat.interesado,
                    "mensajes": {

                    }
                }
                if (chats.length == 0) {
                    //si no hay chat lo creamos

                    console.log("Nuevo chat creado entre: " + chat.interesado + " y " + chat.vendedor)
                    gestorBD.insertarChat(chat, function (id){
                        res.status(201);
                        res.json({
                            mensaje : "chat insertada",
                            _id : id
                        })
                    })

                    /*
                    res.status(500);
                    res.json({
                        error : "se ha producido un error"
                    })
                    */
                } else {
                    //si ya existen chats pues los devolvemos
                    console.log("Mostrando "+  chats.length + " mensaje(s).")
                    res.status(200);
                    res.send( JSON.stringify(chats) );
                }
            })
        });
    });

    /**
     * Aquí modificamos el chat concreto para añadir mensajes
     */
    app.put("/api/ofertas/:id", function (req,res){

        let criterioOferta = {
            "_id" : gestorBD.mongo.ObjectID(req.params.id),
        }

        gestorBD.obtenerOfertas(criterioOferta, function (ofertas) {
            let criterioChat = {
                "oferta_id": gestorBD.mongo.ObjectID(req.params.id),
                "vendedor": ofertas[0].autor,
                "interesado": res.usuario,
            }

            let chatModificado = {
                "mensajes": {
                    "autor": res.usuario,
                    "texto": req.body.texto,
                    "fecha": new Date(),
                    "leido": false
                }
            }

            gestorBD.modificarChat(criterioChat, chatModificado, function (result){
                if (result == null) {
                    res.status(500);
                    res.json({
                        error: "se ha producido un error"
                    })
                } else {
                    res.status(200);
                    res.json({
                        mensaje: "chat modificada",
                        _id: req.params.id
                    })
                }
            })

        })
    })
}

