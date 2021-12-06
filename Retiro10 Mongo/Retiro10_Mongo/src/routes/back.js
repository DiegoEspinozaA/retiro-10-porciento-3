const { query } = require('express');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../passport/islogged');

const afiliados = require('../models/afiliado');
const solicitudes = require('../models/solicitudes')


router.get('/solicitudes', isLoggedIn, async (req, res) => {
  const solis = await solicitudes.find();
  const mensaje = req.session.back;
  delete req.session.back;
  res.render('back/solicitudes', {
    data: solis,
    mensaje
  })
});

router.get('/agregarAfiliado', isLoggedIn, async (req, res) =>{
  res.render('back/agregarAfiliado')
})
router.get('/admin', async (req, res) => {
  res.render("back/admin")
});


router.get('/afiliados', isLoggedIn, async (req, res, next) => {
  const afld = await afiliados.find();
  res.render("back/mostrar", {
    data: afld
  });
});

  
  //Añadir afiliado
  router.post('/add', isLoggedIn, async (req, res) => {
    const afiliado = new afiliados(req.body);
    await afiliado.save();
    res.redirect("/afiliados");
  });
  
  router.get('/delete/:id',isLoggedIn,  async (req, res) => {
    const { id } = req.params;
    await afiliados.deleteOne({_id:id});
    res.redirect("/afiliados");
  });
  

  //Solicitudes
  router.post('/aceptarSolicitud', isLoggedIn, async (req, res) => {
    const id = req.body.id;
    const ver = await solicitudes.findById(id);
    let resp;
    if(ver.estado == 'aceptada'){
      resp = req.session.back = "Error: Tiene solicitudes pendientes o su retiro ya ha sido aceptado";     
    }
    else if(ver.estado == 'rechazada'){
      resp = req.session.back = "Error: No puede aceptar una solicitud que ya fue rechazada"; 
    }
    else{
      
    const rut = req.body.rut;
    const nuevo_saldo = Number(req.body.saldo_cuenta - req.body.monto);
    await solicitudes.findByIdAndUpdate(id, { estado: 'aceptada', rut_administrador: '1'});
    //Actualizar saldo en afiliado
    await solicitudes.findByIdAndUpdate(id, {saldo_disponible: nuevo_saldo});
    await afiliados.findOneAndUpdate(rut, {saldo_cuenta: nuevo_saldo});

    }
    res.redirect("/solicitudes");
  });
  
  router.get('/denegarSolicitud/:id',isLoggedIn,  async (req, res) => {
    const { id } = req.params;
    const ver = await solicitudes.findById(id);
    let resp;
    if(ver.estado == 'aceptada'){
      resp = req.session.back = "Error: No se puede rechazar una solicitud que ya fue aceptada"; 
    }
    else if(ver.estado == 'rechazada'){
      resp = req.session.back = "Error: Esta solicitud ya fue rechadaza";
    }
    else{
      await solicitudes.findByIdAndUpdate(id, { estado: 'rechazada' }); 
    }
    //await solicitudes.deleteOne({_id:id});
    res.redirect("/solicitudes");
  });
  
  router.get('/eliminarSolicitud/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await solicitudes.deleteOne({_id:id});
    res.redirect("/solicitudes");
  });


  
  //Update
  router.get('/edit/:rut', isLoggedIn, async(req, res, next) => {
    rut = req.params.rut;
    const afi = await afiliados.findOne({rut: rut});
      res.render('back/update',{
        afi
      });
  })
  
  router.post('/edit', isLoggedIn, async (req, res, next) => {
    await afiliados.updateOne(req.body.rut, {pass: req.body.pass, email: req.body.email, nombre: req.body.nombre, saldo_cuenta: req.body.saldo_cuenta, nombre_afp: req.body.nombre_afp});
    res.redirect('/afiliados')
    
  })
  module.exports = router;