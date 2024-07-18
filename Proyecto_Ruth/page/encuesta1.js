// encuesta1.js

function calculateResults() {
    const form = document.getElementById("surveyForm");
    const resultsDiv = document.getElementById("results");
    const results = {}; // Almacenar los resultados de la encuesta

    // Obtener los valores seleccionados de cada grupo de botones
    for (const element of form.elements) {
        if (element.type === "radio" && element.checked) {
            results[element.name] = element.value;
        }
    }

    // Análisis simple de los resultados
    let overallMood = "";
    if (results.stressfulChallenges === "Algunos" || results.negativeFeelings === "Si") {
        overallMood += "Puede que estés experimentando algo de estrés. ";
    }
    if (results.joyfulMoments === "Si") {
        overallMood += "Parece que has tenido momentos positivos. ";
    }
    if (results.socialInteractions === "Malas") {
        overallMood += "Las interacciones sociales pueden ser una fuente de estrés. ";
    }
    if (overallMood === "") {
        overallMood = "Parece que has tenido un día tranquilo. ";
    }

    // Mostrar los resultados
    resultsDiv.innerHTML = `
        <h2>Resultados de la Encuesta</h2>
        <p><strong>Estado de ánimo general:</strong> ${overallMood}</p>
    `;

    // Opcional: Enviar los resultados a un servidor para análisis más profundo
    // fetch('/guardar_resultados', { 
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(results)
    // });
}
