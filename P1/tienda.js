//-- Importar módulos
const http = require('http');   //-- Módulo para crear servidores HTTP
const fs = require('fs');       //-- Módulo para leer los archivos
const path = require('path');   //-- Módulo para rutas de archivos

//-- Puerto a utilizar 
const PORT = 8090;

const pagina_error = fs.readFileSync('./Pages/pagina-error.html','utf8');


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

    let content_type;
    let recurso;

    //-- Se declara el Content-Type y recurso
    if (req.url.endsWith('.png')) {             //-- Acceso a archivos PNG
            content_type = 'image/png';
            recurso = path.join(__dirname, 'Images', path.basename(req.url));

    } else if (req.url.endsWith('.css')) {      //-- Acceso a los archivos CSS
        content_type = 'text/css';
        recurso = path.join(__dirname, 'Style', path.basename(req.url));

    } else if (req.url.endsWith('.html')) {     //-- Acceso a los archivos HTML
        content_type = 'text/html';
        recurso = path.join(__dirname, 'Pages', path.basename(req.url));

    } else if (req.url.endsWith('.js')) {       //-- Acceso a los archivos JS
        content_type = 'application/javascript';
        recurso = path.join(__dirname, 'JS', path.basename(req.url));

    } else if (req.url.endsWith('.jpeg') || req.url.endsWith('.jpg')) {     //-- Acceso a los archivos JPEG o JPG
        content_type = 'image/jpeg';
        recurso = path.join(__dirname, 'Images', path.basename(req.url));

    } else if (req.url == '/') {
        content_type = 'text.html';
        recurso = path.join(__dirname, 'Pages', 'tienda.html');

    } else {                                    //-- Acceso a cualquier otra ruta
        content_type = 'text.html';
        recurso = null;
    }

    if (recurso) {
        leerFichero(recurso, (err, data) => {
            if (err) {
                res.statusCode = 404;
                res.statusMessage = 'Not Found'
                res.setHeader('Content-Type', 'text/html');
                res.write(pagina_error);
                res.end();
            } else {
                res.statusCode = 200;
                res.statusMessage = "OK";
                res.setHeader('Content-Type', content_type);
                res.write(data);
                res.end();
            }
        });
    } else {
        res.statusCode = 404;
        res.statusMessage = "Not Found";
        res.setHeader('Content-Type', 'text/html');
        res.write(pagina_error);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log('Escuchando en el puerto: ' + PORT);
});