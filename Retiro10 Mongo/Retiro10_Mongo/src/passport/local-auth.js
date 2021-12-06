const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const afiliados = require('../models/afiliado');
const administradores = require('../models/administrador')

passport.serializeUser((afiliados, done) => {
  done(null, afiliados.rut);
});

passport.deserializeUser(async (rut, done) => {
  const afiliado = await afiliados.findOne({rut: rut});
  if(!afiliado){
    const administrador = await administradores.findOne({rut: rut})
    done(null, administrador)
  }
  else{
    done(null, afiliado);
  }
});

passport.use('local-signin', new LocalStrategy({
  usernameField: 'rut',
  passwordField: 'pass',
  passReqToCallback: true
}, async (req, rut, pass, done) => {
  const afiliado = await afiliados.findOne({rut: rut});
  if(!afiliado) {
    return done(null, false, req.flash('signinMessage', 'Usuario no encontrado'));
  }
  else if(afiliado.pass != pass) {
    return done(null, false, req.flash('signinMessage', 'Contraseña incorrecta'));
  }
  return done(null, afiliado);
}));


passport.use('admin', new LocalStrategy({
  usernameField: 'rut',
  passwordField: 'pass',
  passReqToCallback: true
}, async (req, rut, pass, done) => {
  const admin = await administradores.findOne({rut: rut});
  if(!admin || admin.pass != pass) {
    return done(null, false, req.flash('signinMessage', 'Admin no encotnrado'));
  }
  return done(null, admin);
}));