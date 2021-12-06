const router = require('express').Router();
const passport = require('passport');
const { isLoggedIn } = require('../passport/islogged');

router.get('/profile', isLoggedIn, (req, res, next) => {
  const mensaje = req.session.estado;
  delete req.session.estado;
    res.render('front/signin',{
      mensaje
    });
  });
  
  router.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
    
  }));

  router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
  });

  router.post('/admin', passport.authenticate('admin', {
    successRedirect: '/afiliados',
    failureRedirect: '/',
    failureFlash: true
    
  }));

  
  
  router.get('/profile',isLoggedIn, (req, res, next) => {
    res.render('profile');
  });


  module.exports = router;