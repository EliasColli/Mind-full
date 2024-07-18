    document.getElementById('recoveryForm').addEventListener('submit', function(event) {
        event.preventDefault();

        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;

        if (validateEmail(email) && validatePassword(password)) {
            window.location.href = '/page/mens.html';
        } else {
            alert('Por favor, ingrese un correo electrónico y una contraseña válidos.');
        }
    });

    function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6; 
    }
