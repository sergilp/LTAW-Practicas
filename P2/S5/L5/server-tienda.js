const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8090;

const server = http.createServer((req, res) => {
  if (req.url === '/productos' && req.method === 'GET') {
    //-- Lee el archivo tienda.json
    const filePath = path.join(__dirname, 'Ej-02-tienda.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error al leer Ej-02-tienda.json');
        return;
      }

      //-- Parsea el JSON y devolver los productos
      const tienda = JSON.parse(data);
      const productos = tienda.productos;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(productos, null, 2));
    });
  } else {
    //-- Para cualquier otra ruta
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Recurso no encontrado');
  }
});

server.listen(PORT, () => {
  console.log('Escuchando en el puerto: ' + PORT);
});
