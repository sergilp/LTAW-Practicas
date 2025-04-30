const fs = require('fs');

// Leer y parsear el fichero JSON
const datos = fs.readFileSync('tienda.json', 'utf8');
const tienda = JSON.parse(datos);

// Mostrar número y nombres de usuarios
console.log("Usuarios registrados: " + tienda.usuarios.length);
tienda.usuarios.forEach((u, i) => {
  console.log(`Usuario ${i + 1}: ${u.nombre}`);
});

// Mostrar número y detalles de productos
console.log("\nProductos en la tienda: " + tienda.productos.length);
tienda.productos.forEach((p, i) => {
  console.log(`Producto ${i + 1}: ${p.nombre} - ${p.precio}€`);
});

// Mostrar pedidos pendientes
const pedidosPendientes = tienda.pedidos.filter(p => p.estado === "pendiente");
console.log(`\nPedidos pendientes: ${pedidosPendientes.length}`);
pedidosPendientes.forEach(p => {
  console.log(`Pedido ${p.id} del usuario ${p.usuarioId}, productos: ${p.productos.join(', ')}`);
});
