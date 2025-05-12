const http = require('http');
const fs = require('fs');
const path = require('path');

let tiendaDB = require('./tienda.json');

const PORT = 8001;
const pagina_error = fs.readFileSync('./Pages/pagina_error.html', 'utf8');

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

    // ---- Ruta para la búsqueda de productos
    if (req.url.startsWith('/productos?param1=') && req.method === 'GET') {
        const query = new URLSearchParams(req.url.split('?')[1]);
        const searchTerm = query.get('param1').toLowerCase(); // Termino de búsqueda
        
        // Filtrar productos que coincidan con el término de búsqueda
        const productosFiltrados = tiendaDB.productos.filter(prod =>
            prod.nombre.toLowerCase().includes(searchTerm)
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(productosFiltrados)); // Enviar productos filtrados como JSON
        return; // Detener la ejecución aquí ya que la respuesta se envió
    }

    if (req.method === 'POST' && req.url === '/procesar-pedido') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const pedido = JSON.parse(body);
                const { usuario, direccion, tarjeta, productos } = pedido;

                if (!usuario || !direccion || !tarjeta || !productos || !Array.isArray(productos)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ exito: false, error: 'Datos incompletos.' }));
                    return;
                }

                const usuarioExistente = tiendaDB.usuarios.find(u => u.nombre === usuario);
                if (!usuarioExistente) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ exito: false, error: 'Usuario no encontrado.' }));
                    return;
                }

                const productosNoDisponibles = [];
                for (let nombreProducto of productos) {
                    const producto = tiendaDB.productos.find(p => p.nombre === nombreProducto);
                    if (!producto || producto.stock < 1) {
                        productosNoDisponibles.push(nombreProducto);
                    }
                }

                if (productosNoDisponibles.length > 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ exito: false, error: `Producto(s) sin stock: ${productosNoDisponibles.join(', ')}` }));
                    return;
                }

                // Restar 1 del stock por producto comprado
                productos.forEach(nombreProducto => {
                    const p = tiendaDB.productos.find(p => p.nombre === nombreProducto);
                    if (p) p.stock -= 1;
                });

                // Añadir pedido a la base de datos
                if (!tiendaDB.pedidos) tiendaDB.pedidos = [];

                tiendaDB.pedidos.push({
                    usuario,
                    direccion,
                    tarjeta,
                    productos
                });

                fs.writeFile('./tienda.json', JSON.stringify(tiendaDB, null, 2), err => {
                    if (err) {
                        console.error('Error al guardar pedido:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ exito: false, error: 'Error al guardar el pedido.' }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ exito: true }));
                    }
                });

            } catch (err) {
                console.error('Error al procesar el pedido:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ exito: false, error: 'Formato de datos inválido.' }));
            }
        });

        return; // Importante: no seguir procesando como archivo estático
    }

    //-- Manejo de archivos estáticos
    let content_type;
    let recurso;

    if (req.url.endsWith('.png')) {
        content_type = 'image/png';
        recurso = path.join(__dirname, 'Images', path.basename(req.url));
    } else if (req.url.endsWith('.css')) {
        content_type = 'text/css';
        recurso = path.join(__dirname, 'Style', path.basename(req.url));
    } else if (req.url.endsWith('.html')) {
        content_type = 'text/html';
        recurso = path.join(__dirname, 'Pages', path.basename(req.url));
    } else if (req.url.endsWith('.js')) {
        content_type = 'application/javascript';
        recurso = path.join(__dirname, 'JS', path.basename(req.url));
    } else if (req.url.endsWith('.jpeg') || req.url.endsWith('.jpg')) {
        content_type = 'image/jpeg';
        recurso = path.join(__dirname, 'Images', path.basename(req.url));
    } else if (req.url == '/') {
        content_type = 'text/html';
        recurso = path.join(__dirname, 'Pages', 'tienda.html');
    } else {
        content_type = 'text/html';
        recurso = null;
    }

    if (recurso) {
        leerFichero(recurso, (err, data) => {
            if (err) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/html');
                res.write(pagina_error);
                res.end();
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', content_type);
                res.write(data);
                res.end();
            }
        });
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.write(pagina_error);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log('Escuchando en el puerto: ' + PORT);
});
