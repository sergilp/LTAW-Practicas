//-- Importar módulos
const http = require('http');   //-- Módulo para crear servidores HTTP
const fs = require('fs');       //-- Módulo para leer los archivos
const path = require('path');   //-- Módulo para rutas de archivos

//-- Puerto a utilizar 
const PORT = 8090;

const pagina_error = fs.readFileSync('./Pages/pagina_error.html','utf8');