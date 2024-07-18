// script.js

// Mostrar un mensaje de bienvenida en la consola
console.log("Bienvenido a Mind Full");

// Manejar el clic en el botón "¡INICIAR EVALUACIÓN!"
document.addEventListener('DOMContentLoaded', function() {
    var evaluarButton = document.querySelector('.btn-custom');
    if (evaluarButton) {
        evaluarButton.addEventListener('click', function(event) {
            event.preventDefault(); // Evitar el comportamiento predeterminado del enlace
            alert('¡Gracias por iniciar la evaluación!');
            // Redirigir a la página de la encuesta
            window.location.href = 'encuesta.html';
        });
    }
});
