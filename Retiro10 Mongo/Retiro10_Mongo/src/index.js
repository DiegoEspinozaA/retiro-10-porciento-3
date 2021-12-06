const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash')

// Intializations
const app = express();
//require('./database');
require('./passport/local-auth')

mongoose.connect('mongodb://localhost/retiro10')
  .then(db => console.log("Conectado a MongoDB"))
  .catch(err => console.log(err));

// Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

//  Middlewares
app.use('/public', express.static('public'));
app.use(express.json()); //Transfomar a formato JSON
app.use(bodyParser.urlencoded({extended: true})); // analiza el texto como datos codificados de URL y expone el objeto resultante (FORMULARIOS)

app.use(session({
  secret: 'myscretsession',
  resave: false,
  saveUninitialized: false
}))


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  app.locals.signinMessage = req.flash('signinMessage');
  app.locals.afiliado = req.user;
  app.locals.messages = req.flash('success');
  next();
});
//  Rutas
app.use(require('./routes/back.js'));
app.use(require('./routes/front.js'));
app.use(require('./routes/auth.js'));
//  Iniciando el servidor

app.listen(app.get('port'), ()=>{
  console.log('Servidor en puerto',app.get('port'))
});