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

    //-- Ruta para el login
    if (req.url.startsWith('/login') && req.method === 'GET') {
        const query = new URLSearchParams(req.url.split('?')[1]);
        const usuario = query.get('usuario');

        // Verificar si el usuario existe
        const usuarioExistente = tiendaDB.usuarios.find(u => u.nombre === usuario);

        if (usuarioExistente) {
            // Redirigir a la página principal con el mensaje de bienvenida
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Bienvenido - The Spike Shop</title>
                </head>
                <body>
                    <h1>Bienvenido, ${usuario}!</h1>
                    <p>Estás conectado como ${usuario}.</p>
                    <a href="/">Ir a la tienda</a>
                </body>
                </html>
            `);
        } else {
            // Si el usuario no existe, mostrar un mensaje de error
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <body>
                        <h1>Usuario no encontrado</h1>
                        <a href="/">Volver a intentar</a>
                    </body>
                </html>
            `);
        }
        return;  // Evitar que el servidor siga buscando rutas
    }


    //---- Ruta para la búsqueda de productos
    if (req.url.startsWith('/productos?param1=') && req.method === 'GET') {
        const query = new URLSearchParams(req.url.split('?')[1]);
        const searchTerm = query.get('param1').toLowerCase(); // Termino de búsqueda
        
        //-- Filtrar productos que coincidan con el término de búsqueda
        const productosFiltrados = tiendaDB.productos.filter(prod =>
            prod.nombre.toLowerCase().includes(searchTerm)
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(productosFiltrados)); // Enviar productos filtrados como JSON
        return; //-- Detener la ejecución aquí ya que la respuesta se envió
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

                //-- Restar 1 del stock por producto comprado
                productos.forEach(nombreProducto => {
                    const p = tiendaDB.productos.find(p => p.nombre === nombreProducto);
                    if (p) p.stock -= 1;
                });

                //-- Añadir pedido a la base de datos
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

        return; //-- Importante: no seguir procesando como archivo estático
    }


    if (req.url.startsWith('/producto?nombre=') && req.method === 'GET') {
    const query = new URLSearchParams(req.url.split('?')[1]);
    const nombreProducto = decodeURIComponent(query.get('nombre'));

    const producto = tiendaDB.productos.find(p => p.nombre === nombreProducto);

    if (!producto) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(pagina_error);
        return;
    }

   const paginaHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${producto.nombre}</title>
            <link rel="stylesheet" href="/Style/producto.css">
        </head>
        <body>
            <!-- Encabezado con carrito -->
            <header>
                <h1><span>The Spike Shop</span></h1>
                <div class="carrito-container">
                    <a href="#">
                        <img src="/Images/carrito.png" alt="Carrito de la compra" class="carrito-icono">
                        <span class="contador-carrito">0</span>
                    </a>
                </div>
            </header>

            <div class="recuadro-superior"></div>

            <!-- Contenido del producto -->
            <div class="producto-container">
                <h1 class="producto-nombre">${producto.nombre}</h1>
                <img class="producto-imagen" src="${producto.imagen}" alt="${producto.nombre}" style="width:300px;" />
                <p class="producto-descripcion">${producto.descripcion}</p>
                <p><strong>Precio:</strong> ${producto.precio} €</p>
                <p><strong>Stock disponible:</strong> ${producto.stock}</p>

                <button class="añadir-carrito" onclick="añadirAlCarrito()">Añadir al carrito</button>
            </div>

            <footer>
                <div class="footer-content">
                    <p>&copy; 2025 The Spike Shop - Todos los derechos reservados.</p>
                    <div class="footer-links">
                        <a href="https://www.riotgames.com/es/privacy-notice-ES">Política de privacidad</a> | 
                        <a href="https://www.riotgames.com/es/terms-of-service-ES">Términos y condiciones</a> | 
                        <a href="https://x.com/VALORANTes">Contacto</a>
                    </div>
                </div>
            </footer>

            <script>
                // Cargar contador inicial del carrito
                actualizarContadorCarrito();

                function añadirAlCarrito() {
                    const producto = {
                        nombre: "${producto.nombre}",
                        precio: ${producto.precio},
                        imagen: "${producto.imagen}",
                        cantidad: 1
                    };

                    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

                    // Verificar si ya existe
                    const existente = carrito.find(p => p.nombre === producto.nombre);
                    if (existente) {
                        existente.cantidad += 1;
                    } else {
                        carrito.push(producto);
                    }

                    localStorage.setItem('carrito', JSON.stringify(carrito));
                    actualizarContadorCarrito();
                }

                function actualizarContadorCarrito() {
                    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                    const totalItems = carrito.reduce((suma, p) => suma + p.cantidad, 0);
                    document.querySelector('.contador-carrito').textContent = totalItems;
                }
            </script>
        </body>
        </html>
        `;





    

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(paginaHTML);
    return;
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
