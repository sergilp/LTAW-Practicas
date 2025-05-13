const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 8080;

//-- Maneja la solicitud de la página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/chat.html');  // Servir el archivo HTML
});

//-- Servir archivos estáticos como CSS y JS
app.use(express.static('public'));

//-- Lista de usuarios conectados
let users = [];

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');
  
  //--Enviar mensaje de bienvenida al usuario
  socket.emit('welcome', '¡Bienvenido al chat!');

  //-- Anunciar la llegada de un nuevo usuario a todos
  socket.broadcast.emit('new-user', 'Un nuevo usuario se ha conectado.');

  //-- Añadir al usuario a la lista
  users.push(socket.id);

  //-- Manejar el evento de desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
    //-- Anunciar la salida del usuario
    socket.broadcast.emit('user-left', 'Un usuario ha salido.');
    //-- Eliminar de la lista de usuarios
    users = users.filter(id => id !== socket.id);
  });

  //-- Manejar los mensajes
  socket.on('message', (msg) => {
    if (msg.startsWith('/')) {
      // Es un comando, procesarlo
      handleCommand(msg, socket);
    } else {
      //-- Enviar el mensaje a todos los usuarios
      io.emit('message', msg);
    }
  });
  
});

//-- Función para manejar los comandos
function handleCommand(command, socket) {
  switch (command) {
    case '/help':
      socket.emit('command-response', 'Comandos disponibles: /help, /list, /hello, /date');
      break;
    case '/list':
      socket.emit('command-response', `Usuarios conectados: ${users.length}`);
      break;
    case '/hello':
      socket.emit('command-response', '¡Hola, usuario!');
      break;
    case '/date':
      socket.emit('command-response', `Fecha y hora actual: ${new Date()}`);
      break;
    default:
      socket.emit('command-response', 'Comando no reconocido.');
  }
}

server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
