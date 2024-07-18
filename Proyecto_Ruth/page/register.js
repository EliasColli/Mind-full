document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const phone_number = document.getElementById('phone_number').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ first_name, last_name, phone_number, address, email, password })
    });
  
    const result = await response.json();
    const messageDiv = document.getElementById('message');
  
    if (response.ok) {
      messageDiv.textContent = result.message;
      messageDiv.style.color = 'green';
    } else {
      messageDiv.textContent = result.message;
      messageDiv.style.color = 'red';
    }
  });
  