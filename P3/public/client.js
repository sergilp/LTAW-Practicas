const socket = io();
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');
const messagesDiv = document.getElementById('messages');

//-- Recibir mensaje de bienvenida
socket.on('welcome', (msg) => {
  displayMessage(msg, 'green');
});

//-- Recibir mensaje de un nuevo usuario
socket.on('new-user', (msg) => {
  displayMessage(msg, 'blue');
});

//-- Recibir mensaje de un usuario que se ha desconectado
socket.on('user-left', (msg) => {
  displayMessage(msg, 'red');
});

//-- Recibir un mensaje normal
socket.on('message', (msg) => {
  displayMessage(msg, 'black');
});

//-- Recibir la respuesta de un comando
socket.on('command-response', (msg) => {
  displayMessage(msg, 'purple');
});

//-- Enviar mensaje cuando el botón es presionado
sendButton.onclick = () => {
  const message = messageInput.value;
  if (message) {
    socket.emit('message', message);  // Enviar al servidor
    messageInput.value = '';  // Limpiar el campo de mensaje
  }
};

//--Función para mostrar el mensaje en la interfaz
function displayMessage(msg, color) {
  const p = document.createElement('p');
  p.textContent = msg;
  p.style.color = color;
  messagesDiv.appendChild(p);
}

//-- También enviar mensaje al presionar Enter
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendButton.click();
  }
});
