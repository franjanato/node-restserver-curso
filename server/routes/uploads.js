const expess = require('express');
const fileUpload = require('express-fileupload');
const app = expess();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;


    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha selecionado ningún archivo'
            }
        });
    }

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: ' Los tipos permitidas son: ' + tiposValidos.join(', ')
            }
        });
    }

    let archivo = req.files.archivo;

    // Extensiones permitidas

    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'sgv'];
    let nombdeCortado = archivo.name.split('.');
    let extension = nombdeCortado[nombdeCortado.length - 1];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: ' Las extensiones permitidas son ' + extensionesValidas.join(', ')
            },
            ext: extension
        });
    }

    //Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`


    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`./uploads/${tipo}/${nombreArchivo}`, function (err) {

        if (err) {

            return res.status(500).json({
                ok: false,
                err
            });

        }

        //Aqui, imagen cargada

        switch( tipo ){
            case 'usuarios':
                imagenUsuario(id, res, nombreArchivo);
            break;

            case 'productos':
                imagenProduncto(id, res, nombreArchivo);
            break;
        }

        
        

    });

});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchivo(usuarioDB.img, 'usuarios');


        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })

    });


}

function imagenProduncto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borraArchivo(productoDB.img, 'Productos');


        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        })

    });

}

function borraArchivo(nombreImg, tipo) {

    let pathUrl = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImg}`);
    if (fs.existsSync(pathUrl)) {
        fs.unlinkSync(pathUrl);
    }

}


module.exports = app;