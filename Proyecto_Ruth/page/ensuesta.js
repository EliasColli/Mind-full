const form = document.getElementById('bienestarForm');
const resultadosDiv = document.getElementById('resultados');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const respuestas = {};
    for (let [key, value] of formData.entries()) {
        respuestas[key] = value;
    }

    // Aquí podrías enviar los datos (respuestas) a tu servidor
    // o realizar alguna acción en el front-end

    resultadosDiv.innerHTML = '<div class="alert alert-success">Respuestas registradas:</div>';
    resultadosDiv.innerHTML += '<pre>' + JSON.stringify(respuestas, null, 2) + '</pre>';
});
