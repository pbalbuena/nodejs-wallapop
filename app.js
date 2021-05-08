//Modulos
let express = require('express');
let app = express();

//solo en fase de desarrollo para permitir todos estos headers
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});


let swig = require('swig');
let mongo = require('mongodb');
let crypto = require('crypto');

let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);


let jwt = require('jsonwebtoken');
app.set('jwt',jwt);





// Variables
app.set('port', 8081);
app.set('db','mongodb://admin:sdi@tiendamusica-shard-00-00.ffb8z.mongodb.net:27017,tiendamusica-shard-00-01.ffb8z.mongodb.net:27017,tiendamusica-shard-00-02.ffb8z.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-thy2zp-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave','abcdefg');
app.set('crypto',crypto);


//routers

// routerUsuarioToken
let routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    let token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe
                return;

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403); // Forbidden
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});
// Aplicar routerUsuarioToken
app.use('/api/ofertas', routerUsuarioToken);

//recursos estaticos
app.use(express.static('public'));

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rofertas.js")(app, swig, gestorBD);
require("./routes/rapiofertas.js")(app, gestorBD);
require("./routes/rapiusuarios.js")(app, gestorBD);
require("./routes/rapimensajes.js")(app, gestorBD);

//manejador de errores
const clientErrorHandler = (err, req, res, next) => {
    console.log(err.message);
    res.status(400);

    let respuesta = swig.renderFile('views/error.html',
        {
            usuario : req.session.usuario,
            money : req.session.money,
            error : err.message
        });
    res.send(respuesta);
};

app.use(clientErrorHandler);
app.set('ErrorHandler', clientErrorHandler);

//lanzar servidor
app.listen(app.get('port'), function (){
    console.log('servidor activo')
})