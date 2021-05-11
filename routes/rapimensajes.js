module.exports = function(app, gestorBD) {

    /**
     * Sirve para obtener los mensajes de chat entre un usuario interesado y el vendedor de la oferta
     */
    app.get("/api/ofertas/:id", function(req, res) {
        console.log("GET api mensajes del chat")
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
                    "mensajes": [
                        //creo array vacío, se use []
                    ]
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
                } else {
                    //si ya existen chats pues los devolvemos
                    console.log("Mostrando "+  chats[0].mensajes.length + " mensaje(s).")
                    //console.log(chats)
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
        console.log("PUT api nuevo mensaje")
        let criterioOferta = {
            "_id" : gestorBD.mongo.ObjectID(req.params.id),
        }

        gestorBD.obtenerOfertas(criterioOferta, function (ofertas) {
            let criterioChat = {
                "oferta_id": gestorBD.mongo.ObjectID(req.params.id),
                "vendedor": ofertas[0].autor,
                "interesado": res.usuario
            }

            //console.log("criterio chat: ")
            //console.log(criterioChat.oferta_id + "..." + criterioChat.interesado + "..." + criterioChat.vendedor)


            let mensajes = {
                "autor": res.usuario,
                "texto": req.body.texto,
                "fecha": new Date(),
                "leido": false
            }

            //console.log("chat modificado: ")
            //console.log(mensajes.autor + "..." + mensajes.texto + "..." +mensajes.fecha)

            gestorBD.modificarChat(criterioChat, {
                mensajes
            }
            , function (result){
                if (result == null) {
                    //console.log("modificar chat: se ha producido un error")
                    //console.log(result)
                    res.status(500);
                    res.json({
                        error: "se ha producido un error"
                    })
                } else {
                    res.status(200);
                    res.json({
                        autor: "autor del mensaje: " + mensajes.autor,
                        mensaje: "texto enviado:  " + mensajes.texto,
                        _id: req.params.id
                    })
                }
            })

        })
    })
}

