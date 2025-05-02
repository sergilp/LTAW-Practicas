const fs = require('fs');

// 1. Leer el archivo JSON
const datos = fs.readFileSync('Ej-02-tienda.json', 'utf8');
const tienda = JSON.parse(datos);

// 2. Incrementar el stock de todos los productos en 1
tienda.productos.forEach(producto => {
  producto.stock += 1;
});

// 3. Guardar los datos actualizados en el mismo archivo
fs.writeFileSync('Ej-02-tienda.json', JSON.stringify(tienda, null, 2), 'utf8');

console.log("Stock actualizado correctamente.");
