//-- JS para hacer la búsqueda

//-- Elementos HTML para mostrar la información
const display = document.getElementById("resultado-busqueda");

//-- Caja de búsquedas
const caja_busqueda = document.getElementById("caja-busqueda");

//-- Retrollamada del botón Ver Productos
caja_busqueda.oninput = () => {

    //-- Crear objeto para hacer las peticiones AJAX
    const m = new XMLHttpRequest();

    //-- Función de callback que se invoca cuando hay  
    //-- cambios en el estado de la petición
    m.onreadystatechange = () => {

        //-- Petición enviada y recibida. Todo nice!
        if (m.readyState == 4) {

            //-- Solo se procesa si la respuesta es correcta
            if (m.status == 200) {

                //-- Respuesta es un objeto JSON
                let productos = JSON.parse(m.responseText);

                //-- Borrar el resultado anterior
                display.innerHTML = "";

                n_prod = 0;

                if (productos.length < 1) { //-- No hay resultados

                    //-- Muestro los resultados de busqueda
                    display.style.display = "block";

                    //-- No hay resultados
                    display.innerHTML += "No se encuentran resultados";

                } else {
                    
                    //-- Muestro los resultados de busqueda
                    display.style.display = "block";

                    //-- Recorrer todos los productos del objeto JSON
                    for (let prod of productos) {

                        n_prod += 1
                        display.innerHTML += '<a href="/producto?nombre_producto=' + prod.nombre + '">' + prod.nombre + '</a>';

                        if (n_prod < productos.length) {

                            //-- Se añade salto de página si no es último producto a mostrar
                            display.innerHTML += "<br>";

                        }
                        
                    }

                }

            } else {

                //-- Error en la petición -> Notificar en la consola
                console.log("Error en la petición: " + m.status + " " + m.statusText);

            }

        }

    }

    //-- La petición se realiza solo si hay al menos un carácter
    if (caja_busqueda.value.length >= 1) {

        //-- Configurar la petición
        m.open("GET", "/productos?param1=" + caja_busqueda.value, true);

        //-- Enviar la petición
        m.send()

    } else {
        display.style.display = "none";
        display.innerHTML = "";
    }
}