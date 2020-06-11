
const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');


let app = express();
let Productos = require('../models/producto');



// =======================
// Obtener Productos
// =======================



app.get('/productos/', verificaToken, (req, res) => {
    // trae todos los produtos
    // popplate: usuarios Producto
    // paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Productos.find({ disponible: true })
                .skip(desde)
                .limit(limite)
                .sort('nombre')
                .populate('usuario', 'nombre email')
                .populate('categoria', 'descripcion')
                
                .exec((err, Productos) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }

                    res.json({
                        ok: true,
                        Productos
                    });

                });

});

app.get('/productos/:id', verificaToken, (req, res) => {
  
    let id = req.params.id;

    Productos.findById( id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es valido.'
                }
            });
        }

        res.json({
            ok: true,
            categoria: productoDB
        });

    });


});

// =======================
// Buscar Productos
// =======================

app.get('/productos/buscar/:termino', verificaToken, (req, res) =>{

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Productos.find({nombre: regex})
        .populate('categoria', 'nombre')
        .exec((err, producto) => { 

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto
            })

        })


})

// =======================
// Crear Productos
// =======================

app.post('/productos', verificaToken, (req, res) => {
    // Grabar el usuario
    // Graba una Categoria del listado

    let body = req.body;

    let producto = new Productos({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save( (err, productoDB) =>{
        
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            Producto: productoDB
        });

        
    });


});

// =======================
// Actualizar Productos
// =======================

app.put('/productos/:id', verificaToken, (req, res) => {
  
    let id = req.params.id;
    let body = req.body;

    let nomProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion
    }

    Productos.findByIdAndUpdate( id, nomProducto, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto:productoDB
        })
    });


});

// =======================
// Borrar Productos
// =======================

app.delete('/productos/:id', verificaToken, (req, res) => {
  
    //deshabolitar disponible
    
    let id = req.params.id;

    let dispProducto = {
        disponible: false
    }

    Productos.findByIdAndUpdate(id, dispProducto, { new: true }, (err, productoBorrado) =>{

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if ( !productoBorrado ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto:productoBorrado
        })





    })
});










module.exports = app;