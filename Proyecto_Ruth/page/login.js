document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
  
    const messageDiv = document.getElementById('message');
  
    if (response.ok) {
      // El servidor maneja la redirección, no necesitamos hacer nada más aquí.
    } else {
      const result = await response.json();
      messageDiv.textContent = result.message;
      messageDiv.style.color = 'red';
    }
  });
  