const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const EventEmitter = require('events');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const emitter = new EventEmitter();

app.use(express.static('public'));

let usersConnected = 0;
let nicknames = {};

server.listen(8080, () => {
    console.log('Servidor en http://localhost:8080');
});

io.on('connection', socket => {
    usersConnected++;

    socket.on('setNickname', nickname => {
        nicknames[socket.id] = nickname || 'Usuario';
        socket.emit('message', { user: 'Jefesito', text: `👋 ¡Bienvenido, ${nickname}!` });
        socket.broadcast.emit('message', { user: 'Jefesito', text: `🔔 ${nickname} se ha unido al chat.` });
        io.emit('userList', Object.values(nicknames));
    });

    socket.on('chatMessage', msg => {
        const nickname = nicknames[socket.id] || 'Usuario';

        if (msg.startsWith('/')) {
            let response;
            switch (msg.trim()) {
                case '/help':
                    response = '🛠 Comandos: /help, /list, /hello, /date';
                    break;
                case '/list':
                    response = `👥 Usuarios conectados: ${usersConnected}`;
                    break;
                case '/hello':
                    response = '👋 ¡Hola!';
                    break;
                case '/date':
                    response = `📅 Fecha: ${new Date().toLocaleString()}`;
                    break;
                default:
                    response = '❓ Comando no reconocido.';
            }
            socket.emit('message', { user: 'Jefesito', text: response });
        } else {
            const fullMsg = { user: nickname, text: msg };
            io.emit('message', fullMsg);
            emitter.emit('message', fullMsg);
        }
    });

    socket.on('typing', () => {
        const nickname = nicknames[socket.id];
        socket.broadcast.emit('typing', nickname);
    });

    socket.on('stopTyping', () => {
        socket.broadcast.emit('stopTyping');
    });

    socket.on('disconnect', () => {
        const nickname = nicknames[socket.id] || 'Usuario';
        delete nicknames[socket.id];
        usersConnected--;
        io.emit('message', { user: 'Jefesito', text: `👋 ${nickname} se ha desconectado.` });
        io.emit('userList', Object.values(nicknames));
    });
});

// Exporta función de emitir mensajes desde el proceso principal
function broadcastTestMessage() {
    io.emit('message', { user: 'Jefesito', text: '📢 Este es un mensaje de prueba enviado desde la interfaz de administración.' });
}

function onMessage(callback) {
    emitter.on('message', callback);
}

module.exports = { broadcastTestMessage, onMessage };
