const fs = require('fs');

//-- Lee el archivo JSON
const datos = fs.readFileSync('Ej-02-tienda.json', 'utf8');
const tienda = JSON.parse(datos);

//-- Incrementa el stock de todos los productos en 1
tienda.productos.forEach(producto => {
  producto.stock += 1;
});

//-- Guarda los datos actualizados en el mismo archivo
fs.writeFileSync('Ej-02-tienda.json', JSON.stringify(tienda, null, 2), 'utf8');

console.log("Stock actualizado correctamente.");
