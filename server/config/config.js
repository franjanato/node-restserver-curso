



//==========================
//Puerto
//==========================
process.env.PORT = process.env.PORT || 3000;

//=========================
//Entorno
//=========================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://franjanato:l2t86e74fH1b06sN@cluster0-pinzr.mongodb.net/cafe'
}

process.env.URLDB = urlDB;


