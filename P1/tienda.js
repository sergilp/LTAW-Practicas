//-- Importar módulos
const http = require('http');   //-- Módulo para crear servidores HTTP
const fs = require('fs');       //-- Módulo para leer los archivos
const path = require('path');   //-- Módulo para rutas de archivos

//-- Puerto a utilizar 
const PORT = 8090;

const pagina_error = fs.readFileSync('./Pages/pagina_error.html','utf8');


//-- Función para leer archivos
function leerFichero(fichero, callback) {
    fs.readFile(fichero, (err, data) => {
        if (err) {
            console.error('No se puede leer el archivo:', fichero, err);
            callback(err, null);
        } else {
            console.log(`Lectura correcta de ${fichero}`);
            callback(null, data);
                }
    });
}

const server = http.createServer((req, res) => {
    console.log('Petición recibida:', req.url);

    //-- Se declara el Content-Type y recurso
    if (req.url.endsWith('png')) {          //-- Acceso a archivos PNG
            content_type = 'image/png';
            recurso = './Images/' + req.url.split('/').pop();
            
    }
})