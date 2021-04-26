//Modulos
let express = require('express');
let app = express();
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

// Variables
app.set('port', 8081);
app.set('db','mongodb://admin:sdi@tiendamusica-shard-00-00.ffb8z.mongodb.net:27017,tiendamusica-shard-00-01.ffb8z.mongodb.net:27017,tiendamusica-shard-00-02.ffb8z.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-thy2zp-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave','abcdefg');
app.set('crypto',crypto);

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rofertas.js")(app, swig, gestorBD);

//lanzar servidor
app.listen(app.get('port'), function (){
    console.log('servidor activo')
})