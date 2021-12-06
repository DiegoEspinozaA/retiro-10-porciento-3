const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn } = require('../passport/auth');

router.get('/profile', isLoggedIn, (req, res, next) => {
    const mensaje = req.session.my_variable;
    delete req.session.my_variable;
    res.render('front/signin', {
      mensaje
    });
  });
  
  router.post('/signin', (req, res, next) => {
    passport.authenticate('local.signin', {
      successRedirect: '/profile',
      failureRedirect: '/',
      failureFlash: true
    })(req, res, next);
  })

  router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
  });

  router.post('/admin', (req, res, next) =>{
    passport.authenticate('admin', {
    successRedirect: '/afiliados',
    failureRedirect: '/',
    failureFlash: true
    })(req, res, next);
    
  });
  
  

  router.use((req, res, next) => {
    isLoggedIn(req, res, next);
  });


  module.exports = router;