const http = require('http');

const PUERTO = 8080;

//-- SERVIDOR: Bucle principal de atención a clientes
const server = http.createServer((req, res) => {

  console.log("\nMENSAJE A")

  req.on('data', (cuerpo) => {
    console.log("MENSAJE B")
    //-- Para que se imprimiese este mensaje tendría que haber cuerpo en la solicitud:
    //-- Hsciendo una solicitud POST, con GET no se imprimiría
    //-- console.log("Cuerpo de la solicitud:", cuerpo.toString());
  });

  req.on('end', ()=> {
    console.log("MENSAJE C");

    //-- Hayppy server. Generar respuesta
    res.setHeader('Content-Type', 'text/plain');
    res.write("Soy el happy server\n");
    res.end()
  });


  //-- Se imprime antes de que 'data' o 'end' se activen
  console.log("MENSAJE D");

});

console.log("MENSAJE E");
server.listen(PUERTO);
console.log("MENSAJE F");