const { query } = require('express');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../passport/islogged');

const solicitudes = require('../models/solicitudes')
const afiliados = require('../models/afiliado')

router.get('/', async (req, res, next) => {
    res.render('front/home');
});


router.get('/profile/solicitudes/:rut', isLoggedIn, async (req, res, next) => {
  const rut = String(req.params.rut);
  const data = await solicitudes.find({rut: rut});
  res.render('front/solicitudes', {
    data: data
  })
});

router.post('/solicitarRetiro', isLoggedIn, async (req, res, done) => {
    const rut = req.body.rut;
    const verificar = await solicitudes.find({rut: rut, estado: { $in: ["pendiente", "aceptada"]}});
    let resp;
    if(verificar.length != 0){
      resp = req.session.estado = "Error: Tiene solicitudes pendientes o su retiro ya ha sido aceptado"; 

    }
    else{
      const solicitud = new solicitudes(req.body);
      solicitud.monto = req.body.saldo * (req.body.porcentaje / 100);
      solicitud.saldo_disponible = req.body.saldo;
      solicitud.fecha = Date();

      await solicitud.save();
      resp = req.session.estado = "Solicitud enviada exitosamente";

    }
    res.redirect('/profile')
  });

module.exports = router;