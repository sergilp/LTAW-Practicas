const socket = io();
const messages = document.getElementById('messages');
const input = document.getElementById('input');
const send = document.getElementById('send');
const typingIndicator = document.getElementById('typing');
const notifSound = document.getElementById('notifSound');
const userList = document.getElementById('user-list');

let nickname = prompt('Introduce tu nickname:');
socket.emit('setNickname', nickname);

//-- Recibir mensajes
socket.on('message', msg => {
    const item = document.createElement('div');
    item.textContent = msg.user + ': ' + msg.text;

    if (msg.user === 'Sistema') {
        item.classList.add('system');
    } else if (msg.user === nickname) {
        item.classList.add('own');
    } else {
        item.classList.add('other');
        notifSound.play();
    }

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

//-- Enviar mensaje
send.addEventListener('click', () => {
    const msg = input.value.trim();
    if (msg) {
        socket.emit('chatMessage', msg);
        socket.emit('stopTyping');
        input.value = '';
    }
});

input.addEventListener('keydown', e => {
    if (e.key === 'Enter') send.click();
    else socket.emit('typing');
});

input.addEventListener('keyup', () => {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stopTyping');
    }, 1000);
});

//-- Mostrar "escribiendo..."
let typingTimeout;
socket.on('typing', user => {
    typingIndicator.textContent = `${user} está escribiendo...`;
});

socket.on('stopTyping', () => {
    typingIndicator.textContent = '';
});

//-- Actualiza lista de usuarios
socket.on('userList', users => {
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });
});
