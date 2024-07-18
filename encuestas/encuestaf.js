// script.js

// Esperar a que el contenido de la página esté cargado
document.addEventListener('DOMContentLoaded', () => {
    const checkmark = document.querySelector('.checkmark');
    const container = document.querySelector('.container');

    // Animación de entrada para el contenedor
    container.classList.add('fade-in');

    // Animación de escala para la marca de verificación (checkmark)
    setTimeout(() => {
        checkmark.classList.add('grow');
    }, 500); // Retraso de medio segundo para la animación
});
