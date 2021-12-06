const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const db = require('../database');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'rut',
  passwordField: 'pass',
  passReqToCallback: true
}, async (req, rut, pass, done) => {
  let variable = [];
  db.query(`SELECT * FROM AFILIADO WHERE RUT = ${rut}`, (err, result) => {
    if(!err) {
      if(result.length > 0){
        const user = result[0];
        if (pass == user.pass) {
          done(null, user);
        } else {
          done(null, false, req.flash('signinMessage', 'Contraseña incorrecta'));
        }      
      }
      else {
        return done(null, false, req.flash('signinMessage', 'Usuario no encontrado'));
      }
    } else {
      throw err
    }
});
}));

passport.use('admin', new LocalStrategy({
  usernameField: 'rut',
  passwordField: 'pass',
  passReqToCallback: true
}, async (req, rut, pass, done) => {
  let variable = [];
  db.query(`SELECT * FROM administrador WHERE RUT = ${rut}`, (err, result) => {
    if(!err) {
      if(result.length > 0){
        const user = result[0];
        if (pass == user.pass) {
          done(null, user);
        } else {
          done(null, false, req.flash('signinMessage',  'Contraseña incorrecta'));
        }      
      }
      else {
        return done(null, false, req.flash('signinMessage', 'Admin no encontrado.'));
      }
    } else {
      throw err
    }
});
}));


passport.serializeUser((user, done) => {
  done(null, user.RUT);
});

passport.deserializeUser(async (rut, done) => {
  db.query(`SELECT * FROM AFILIADO JOIN CUENTA ON AFILIADO.RUT = CUENTA.RUT_AFILIADO WHERE RUT = ${rut}`, (err, result) => {
    if(result.length == 0){
      //analizar admin
      db.query(`SELECT * FROM ADMINISTRADOR WHERE RUT = ${rut}`, (error, resultado) => {
        done(null, resultado[0]);
    });
    }
    else{
    done(null, result[0]);
    }
});
});