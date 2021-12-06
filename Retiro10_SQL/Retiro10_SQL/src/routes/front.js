const { query } = require('express');
const express = require('express');
const router = express.Router();
const db = require('../database')

router.get('/', async (req, res, next) => {
    res.render('front/home');
});


router.get('/profile/solicitudes/:rut', async (req, res, next) => {
  db.query("select * from solicitud_retiro where rut_afiliado = ?", [req.params.rut], (err, result) => {
    if(!err) {
      res.render('front/solicitudes',{
        data: result
      });
    } else {
      throw err
    }
  });
});

router.post('/solicitarRetiro', async (req, res, done) => {
    const rut = req.body.rut;
    let respuesta;
    db.query(`select * from solicitud_retiro where rut_afiliado = ${rut} and (estado = "pendiente" or estado = "aceptada")`, (err, result) => {
    if (!err) {
      if (result.length == 0) {
        //enviar solicitud de retiro

        const { porcentaje, tipo_cuenta_retiro, RUT_afiliado } = req.body;
        var _saldo = req.body.saldo;
        var fecha = new Date();
        var monto = _saldo * (porcentaje / 100);
        db.query('INSERT into solicitud_retiro SET ? ', {
          fecha: fecha,
          porcentaje: porcentaje,
          monto: monto,
          estado: 'pendiente',
          tipo_cuenta_retiro: tipo_cuenta_retiro,
          RUT_afiliado: rut
        }, (err, result) => {
          if (err) {
            throw err;
          }else{
            respuesta = req.session.my_variable = "Solicitud enviada exitosamente"
          }
        });
      }
      else {
        respuesta = req.session.my_variable =  "Error: Tiene solicitudes pendientes o su retiro ya ha sido aceptado";
      }
    } else {
      throw err;
    }
  });


    res.redirect('/profile');
  });

module.exports = router;