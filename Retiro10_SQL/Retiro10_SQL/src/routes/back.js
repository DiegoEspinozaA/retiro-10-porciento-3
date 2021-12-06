const { query } = require('express');
const express = require('express');
const router = express.Router();
const db = require('../database')
const { isLoggedIn } = require('../passport/auth');

router.get('/solicitudes', isLoggedIn, async (req, res) => {
  
  db.query("select * from solicitud_retiro join afiliado on solicitud_retiro.rut_afiliado = afiliado.RUT join Cuenta on cuenta.rut_afiliado = afiliado.RUT", (err, result) => {
    if(!err) {
      const mensaje = req.session.back;
      delete req.session.back;
      res.render('back/solicitudes',{
        data: result,
        mensaje
      });
    } else {
      throw err
    }
});
});

router.get('/admin', async (req, res) => {
  res.render("back/admin")
});

router.get('/agregarAfiliado', isLoggedIn, (req, res) =>{
  res.render('back/agregarAfiliado')
})

router.get('/afiliados', isLoggedIn, (req, res, next) => {
  db.query("select * from afiliado join afp on afp.nombre = afiliado.nombre_afp", (err, result) => {
    if(!err) {
      res.render('back/mostrar',{
        data: result
      });
    } else {
      throw err
    }
  });
});

  
  //Añadir afiliado
  router.post('/add', isLoggedIn, async (req, res) => {
    const { RUT, n_documento, email, pass, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, nombre_afp, saldo} = req.body;
    db.query('INSERT into afiliado SET ? ',{
        RUT: RUT,
        n_documento: n_documento,
        email: email,
        pass: pass,
        primer_nombre: primer_nombre,
        segundo_nombre: segundo_nombre,
        primer_apellido: primer_apellido,
        segundo_apellido: segundo_apellido,
        nombre_afp: nombre_afp
    }, (err, result) => {
        if(err) {
            throw err
        }
    });

    db.query('INSERT into Cuenta SET ? ',{
      rut_afiliado: RUT,
      saldo: saldo
      }, (err, result) => {
      if(err) {
          throw err
      }
    });
    res.redirect('/afiliados')
  });
  
  router.get('/delete/:rut', isLoggedIn, async (req, res) => {
    db.query('SET FOREIGN_KEY_CHECKS=0;');
    db.query('DELETE FROM cuenta WHERE rut_afiliado = ?', req.params.rut);
    db.query('DELETE FROM afiliado WHERE RUT = ?', req.params.rut);
    res.redirect('/afiliados');
  });
  

  //Solicitudes
  router.post('/aceptarSolicitud', isLoggedIn, async (req, res) => {
    const id = req.body.id;
    db.query(`select * from solicitud_retiro where id_retiro = ${id} and (estado = "aceptada" or estado ="rechazada")`,  (err, result) => {
      
      if(!err){
        if(result.length == 1){
          console.log("No se puede cambiar nuevamente el estado esta solicitud")
          resp = req.session.back = "Error: No se puede cambiar nuevamente el estado esta solicitud"; 
        }
        else{
          db.query(`select * from evalua join solicitud_retiro on evalua.id_retiro_fk = solicitud_retiro.id_retiro where id_retiro = ${id}`, (error, resultado) => {
            if(resultado.length == 1){
              console.log("Ya se ha aceptado su solicitud anteriormente")
              resp = req.session.back = "Error: Ya se ha aceptado una solicitud de retiro suya";   
            }
            else{
                const rut = req.body.rut;
              const nuevo_saldo = Number(req.body.saldo - req.body.monto);
              db.query('update solicitud_retiro set estado = "aceptada" where ID_retiro = ?', [id])
              db.query(`update cuenta set saldo = ${nuevo_saldo} where rut_afiliado = ${rut}`)
              db.query('INSERT into evalua SET ? ',{
                rut_admin: 8596487,
                id_retiro_fk: id
                }, (err, result) => {
                if(err) {
                    throw err
                }
              });
            }
          })
        }
      }
    })

    
    //Actualizar saldo en afiliado
    res.redirect("/solicitudes");
  });
  
  router.get('/denegarSolicitud/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    db.query(`select estado from solicitud_retiro where id_retiro = ${id}`, (error, resultado) => {
      if(resultado[0].estado == 'aceptada' || resultado[0].estado == 'rechazada'){
        console.log("No se puede cambiar nuevamente el estado de esta solicitud")
      }
      else{
        db.query(`update solicitud_retiro set estado = "rechazada" where id_retiro = ${id}`)
      }
    })
    res.redirect("/solicitudes");
  });
  
  router.get('/eliminarSolicitud/:id', async (req, res) => {
    db.query('delete from evalua where id_retiro_fk = ?', req.params.id)
    db.query('delete from solicitud_retiro where id_retiro = ?', req.params.id)
    res.redirect("/solicitudes");
  });

  
  //Update
  router.get('/edit', isLoggedIn, function (req, res, next) {
    db.query('select * from afiliado where rut = ?', req.query.RUT, function (err, rs){
      res.render('back/update', {book: rs[0]});
    })
  })
  
  router.post('/edit', isLoggedIn, function (req, res, next) {
    var param = [
      req.body,
      req.body.RUT
    ]
    db.query('update afiliado set ? where RUT = ?', param, function(err, rs){
      res.redirect('/afiliados')
    })
  })


//solicitudes entrega 1
//ALTER
/*conn.query('alter table afp modify dir_web varchar(100);',(err, resp, campos) =>{
  console.log(resp)
});
//query para añadir el check a porcentaje y que los valores sean menores o iguales a 10.
conn.query('alter table retiro add check (porcentaje<=10);',(err, resp, campos) =>{
  console.log(resp)
});


//SELECT
conn.query('select primer_nombre, primer_apellido from afiliado;',(err, resp, campos) =>{
  console.log(resp)
});
conn.query('select rut, primer_nombre,primer_apellido as nombre_completo from afiliado join cuenta on afiliado.rut = cuenta.rut_afiliado;',(err, resp, campos) =>{
  console.log(resp)
});
conn.query('select rut, primer_nombre, primer_apellido as nombre_completo from (afiliado join retiro on afiliado.rut = retiro.rut_afiliado) where monto >= 500000;',(err, resp, campos) =>{
  console.log(resp)
});

//UPDATE
conn.query("update afiliado set primer_nombre = 'Daniel' where rut = 20479539;",(err, resp, campos) =>{
  console.log(resp)
});
conn.query("update afiliado set contrasena = 'uno2tres@' where n_documento = 111111;",(err, resp, campos) =>{
  console.log(resp)
});


//INSERT
conn.query("insert into afp values ('Plan Vital', 'afpplanvital@gmail.com','asdasd 123','600 6000 301');",(err, resp, campos) =>{
  console.log(resp)
});
conn.query("insert into direccion values('Av baquedano 1245',20479539);",(err, resp, campos) =>{
  console.log(resp)
});
conn.query("insert into telefono values('97745254',20479539);",(err, resp, campos) =>{
  console.log(resp)
});


//DELETE
conn.query("delete from telefono where rut_afiliado = 20479539;",(err, resp, campos) =>{
  console.log(resp)
});
conn.query("delete from direccion where rut_afiliado = 20479539;",(err, resp, campos) =>{
  console.log(resp)
});*/


//Solicitudes entrega 2 - 3 
//Obtener nombre y monto total de los afiliados que hicieron retiro de fondos (x) veces, (tiene que estar aceptada la solicitud de retiros).
db.query('select concat(primer_apellido," ",primer_nombre) as Nombre, sum(monto) as total_retirado from (afiliado join solicitud_retiro on rut = rut_afiliado and estado = "aceptada") group by rut_afiliado having count(*) = 1 order by primer_apellido desc;',(err, resp, campos) =>{
    console.log(resp)
});
//Mostrar el id y valor del retiro de la cuenta que hizo el retiro máximo x fecha solo si el porcentaje indicado es = 10% para todas las AFP menos PlanVital y Cuprum.
db.query('select id_cuenta, monto as cantidad from (afp join afiliado on nombre = nombre_afp join solicitud_retiro on rut = solicitud_retiro.rut_afiliado join cuenta on rut = cuenta.rut_afiliado ) where estado = "aceptada" and fecha = "2021-05-12" and porcentaje = 10 and nombre not in ("PlanVital","Cuprum");',(err, resp, campos) =>{
  console.log(resp)
});

//obtener la cantidad de retiros y total retirado por AFP de todos los afiliados que hicieron retiros antes del año (2022) ordenados por cantidad de retiros de manera descendente.
db.query('select nombre_afp, count(rut_afiliado) as cant_retiros, sum(monto) total from afp join afiliado on nombre = nombre_afp join solicitud_retiro on rut = rut_afiliado where estado = "aceptada" group by nombre having max(fecha) <= "2021-12-31" order by count(rut_afiliado) desc;',(err, resp, campos) =>{
  console.log(resp)
});

//Mostrar la información de los administradores ordenados por la cantidad de solicitudes que analizaron.
db.query('select rut, concat(primer_apellido," ",primer_nombre) as Nombre, count(*) as sol_analizadas from administrador join evalua on administrador.RUT = evalua.rut_admin order by sol_analizadas;',(err, resp, campos) =>{
  console.log(resp)
});


//Mostrar los montos totales de las solicitudes según su estado.
db.query('select estado, sum(monto) as Total from solicitud_retiro GROUP by estado;',(err, resp, campos) =>{
  console.log(resp)
});

//########## Subconsultas ##############
//Mostrar la información de los afiliados que hicieron retiros por sobre la media ordenados de manera descendente por el primer apellido.
db.query('select concat(primer_apellido," " ,primer_nombre) as Nombre, rut, monto from solicitud_retiro join afiliado on solicitud_retiro.rut_afiliado = afiliado.rut where monto > (select avg(monto) from solicitud_retiro) and estado = "aceptada " order by primer_apellido;',(err, resp, campos) =>{
  console.log(resp)
});

//Mostrar la información de los afiliados que hicieron retiros por bajo la media.
db.query('select concat(primer_apellido, "  ",primer_nombre) as Nombre, rut, monto from solicitud_retiro join afiliado on solicitud_retiro.rut_afiliado = afiliado.rut where monto < (select avg(monto) from solicitud_retiro) and estado = "aceptada" order by primer_apellido;',(err, resp, campos) =>{
  console.log(resp)
});

//Mostrar la cantidad de usuarios que solicitaron retiros y que fueron rechazados o siguen estando pendiente.
db.query('select count(*) as Total from afiliado where rut not in (select rut_afiliado from solicitud_retiro where estado = "aceptada");',(err, resp, campos) =>{
  console.log(resp)
});

//Mostrar la informacion, cantidad de solicitudes de los usuarios que solitaron retiros y que fueron rechazas o siguen estando pendiente.
db.query('select concat(primer_apellido," ",primer_nombre) as Nombre, rut_afiliado, count(*) as total from solicitud_retiro join afiliado on afiliado.rut = solicitud_retiro.rut_afiliado where rut_afiliado not in (select rut_afiliado from solicitud_retiro where estado = "aceptada") group by RUT order by count(*) desc;',(err, resp, campos) =>{
  console.log(resp)
});


//########## GROUP BY ##############
//Mostrar la cantidad de retiros e información de cada afiliado, ordenados de manera desc por cantidad de retiros.
db.query('select concat(primer_apellido, " ",primer_nombre) as Nombre, rut, count(*) as total from afiliado join solicitud_retiro on solicitud_retiro.rut_afiliado=afiliado.RUT where estado = "aceptada" group by RUT;',(err, resp, campos) =>{
  console.log(resp)
});

//Mostrar el conteo de solicitudes aceptadas organizadas por AFP.
db.query('select nombre_afp, count(*) as aceptadas from solicitud_retiro join afiliado on solicitud_retiro.rut_afiliado = afiliado.rut join AFP on afp.nombre = afiliado.nombre_afp where estado = "aceptada" group by nombre;',(err, resp, campos) =>{
  console.log(resp)
});

//Mostrar el conteo de solicitudes rechazadas organizadas por AFP.
db.query('select nombre_afp, count(*) as rechazadas from solicitud_retiro join afiliado on solicitud_retiro.rut_afiliado = afiliado.rut join AFP on afp.nombre = afiliado.nombre_afp where estado = "rechazada" group by nombre;',(err, resp, campos) =>{
  console.log(resp)
});

//Mostrar el conteo total de solicitud organizadas por su estado.
db.query('select estado, count(*) as Cantidad  from solicitud_retiro group by estado;',(err, resp, campos) =>{
  console.log(resp)
});

//Mostrar el conteo de retiros dependiendo del porcentaje que se retiró ordenado por total de manera descendente.
db.query('select porcentaje, COUNT(*) as total from solicitud_retiro where estado = "aceptada" GROUP by porcentaje order by total desc;',(err, resp, campos) =>{
  console.log(resp)
});

//Mostrar la media de porcentaje que se solicita para retiro y nombre de la AFP para los retiros que fueron aceptados.
db.query('select ROUND(AVG(porcentaje),1) as Media_porcentaje, nombre_afp from solicitud_retiro join afiliado on solicitud_retiro.rut_afiliado = afiliado.rut join afp on afp.nombre = afiliado.nombre_afp where estado = "Aceptada"   group by nombre_afp;',(err, resp, campos) =>{
  console.log(resp)
});


module.exports = router;