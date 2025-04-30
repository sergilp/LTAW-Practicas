const fs = require('fs');

// Leer el fichero JSON
const datos = fs.readFileSync('tienda.json', 'utf8');
const tienda = JSON.parse(datos);

// Incrementar el stock de cada producto
tienda.productos.forEach(producto => {
  if (producto.stock !== undefined) {
    producto.stock += 1;
  } else {
    producto.stock = 1; // Por si no tiene campo stock
  }
});

// Guardar los cambios en el mismo fichero
fs.writeFileSync('tienda.json', JSON.stringify(tienda, null, 2), 'utf8');

console.log("Stock actualizado con éxito.");
