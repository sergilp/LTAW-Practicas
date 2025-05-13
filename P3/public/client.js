const socket = io();
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');
const messagesDiv = document.getElementById('messages');
let username = '';

const usernameForm = document.getElementById('username-form');  //-- Formulario de ingreso
const chatDiv = document.getElementById('chat');  //-- El contenedor del chat
const usernameInput = document.getElementById('username');  //-- Campo de texto para el nombre
const setUsernameButton = document.getElementById('set-username');  //-- Botón de ingresar nombre

//-- Función para mostrar el chat y ocultar el formulario
function showChat() {
  usernameForm.style.display = 'none';  //-- Ocultar el formulario
  chatDiv.style.display = 'block';  //-- Mostrar el chat
}

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

setUsernameButton.onclick = () => {
  username = usernameInput.value.trim();  //-- Obtiene el nombre del usuario
  if (username) {
    socket.emit('set-username', username);  //-- Envía el nombre al servidor
    showChat();  //-- Muestra el chat y ocultar el formulario
  } else {
    alert('Por favor, ingresa un nombre de usuario.');
  }
};

//-- Cuando se presiona Enter en el campo de nombre de usuario
usernameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    setUsernameButton.click();  // Dispara el clic del botón "Entrar"
  }
});

//-- Enviar mensaje cuando el botón es presionado
sendButton.onclick = () => {
  const message = messageInput.value;
  if (message) {
    socket.emit('message', message);  // Enviar al servidor
    messageInput.value = '';  // Limpiar el campo de mensaje
  }
};

//-- También enviar mensaje al presionar Enter
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendButton.click();
  }
});

//-- Función para mostrar el mensaje en la interfaz
function displayMessage(msg, color) {
  const p = document.createElement('p');
  p.textContent = msg;
  p.style.color = color;
  messagesDiv.appendChild(p);
}
