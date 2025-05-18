// This script handles the login functionality on the client-side.
document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const formulario = document.getElementById('login-formulario'); // The login form
    const inputContraseña = document.getElementById('contraseña'); // Password input field
    const inputCorreo = document.getElementById('email'); // Email input field
    const togglePass = document.getElementById('mostrar-contraseña'); // Button to toggle password visibility
    const mensajeLogin = document.getElementById('login-mensaje'); // Element to display login messages
    const recordarCheckbox = document.getElementById('recordar'); // "Remember me" checkbox
    const botonGoogle = document.getElementById('google-login-btn'); // Google login button (placeholder)

    // Event listener to toggle password visibility
    if (togglePass) {
        togglePass.addEventListener('click', () => {
            const tipo = inputContraseña.type === 'password' ? 'text' : 'password';
            inputContraseña.type = tipo;
            togglePass.classList.toggle('fa-eye'); // Toggle eye icon
            togglePass.classList.toggle('fa-eye-slash'); // Toggle slashed eye icon
        });
    }

    // Load remembered credentials on page load
    window.addEventListener('load', () => {
        const c = localStorage.getItem('correoRecordado'); // Get remembered email
        const p = localStorage.getItem('contraseñaRecordada'); // Get remembered password
        if (c && p) {
            inputCorreo.value = c;
            inputContraseña.value = p;
            recordarCheckbox.checked = true;
        }
    });

    // Event listener for form submission
    if (formulario) {
        formulario.addEventListener('submit', async evento => {
            evento.preventDefault(); // Prevent default form submission
            mensajeLogin.textContent = ''; // Clear previous login messages
            mensajeLogin.style.display = 'none'; // Hide message area

            // Basic client-side validation
            if (!inputCorreo.value.trim()) {
                mostrarError('Por favor, ingresa tu correo');
                return;
            }
            if (!inputContraseña.value.trim()) {
                mostrarError('Por favor, ingresa tu contraseña');
                return;
            }

            // UI feedback: show loading animation on the button
            const botonAcceder = formulario.querySelector('button[type="submit"]');
            const textoBotonOriginal = botonAcceder.innerHTML; // Save original button text/HTML
            botonAcceder.disabled = true;
            botonAcceder.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Accediendo...';

            try {
                // Prepare credentials payload
                const credenciales = {
                    correo: inputCorreo.value.trim(),
                    contrasena: inputContraseña.value
                };

                // Send login request to the backend
                const respuesta = await fetch('/api/usuarios/validar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credenciales)
                });

                const data = await respuesta.json(); // Parse JSON response

                // Handle unsuccessful login
                if (!respuesta.ok || data.valido === false) {
                    mostrarError(data.mensaje || 'Credenciales incorrectas');
                    botonAcceder.disabled = false; // Re-enable button
                    botonAcceder.innerHTML = textoBotonOriginal; // Restore original button text
                    return;
                }

                // --- UPDATED: STORE USER INFO IN LOCALSTORAGE ---
                if (data.nombre) {
                    localStorage.setItem('nombreUsuario', data.nombre);
                }
                if (data.idUsuario) {
                    localStorage.setItem('idUsuario', data.idUsuario.toString());
                }
                if (data.rol) {
                    localStorage.setItem('tipoUsuario', data.rol);
                }
                // Set a simple token indicator. The actual session is managed by HTTPOnly cookies (JSESSIONID).
                localStorage.setItem('token', 'sesion_activa_maranatha');
                // --- END UPDATED ---

                // Handle "Remember me" functionality
                if (recordarCheckbox.checked) {
                    localStorage.setItem('correoRecordado', inputCorreo.value.trim());
                    localStorage.setItem('contraseñaRecordada', inputContraseña.value);
                } else {
                    localStorage.removeItem('correoRecordado');
                    localStorage.removeItem('contraseñaRecordada');
                }

                // Redirect user based on their role
                switch (data.rol) {
                    case 'ADMIN':
                        window.location.href = '/pantalla-admin.html';
                        break;
                    case 'ENCARGADO':
                        window.location.href = '/Gestion-de-reservas.html';
                        break;
                    case 'CLIENTE':
                        // Check for redirect URL from query parameters (e.g., after being sent to login from another page)
                        const params = new URLSearchParams(window.location.search);
                        const redirectUrl = params.get('redirect');
                        if (redirectUrl) {
                            window.location.href = redirectUrl;
                        } else {
                            window.location.href = '/dashboard-cliente.html';
                        }
                        break;
                    default:
                        mostrarError('Rol no reconocido');
                        botonAcceder.disabled = false; // Re-enable button if role is not recognized
                        botonAcceder.innerHTML = textoBotonOriginal; // Restore original button text
                }

            } catch (error) {
                console.error('Error en el proceso de login:', error);
                mostrarError('Error de conexión con el servidor. Inténtalo de nuevo más tarde.');
                botonAcceder.disabled = false; // Re-enable button on error
                botonAcceder.innerHTML = textoBotonOriginal; // Restore original button text
            }
            // The 'finally' block was removed from here because the button state
            // needs to be managed within the try/catch for more precise control,
            // especially for the redirection logic.
        });
    }

    /**
     * Displays an error message to the user.
     * @param {string} mensaje The error message to display.
     */
    function mostrarError(mensaje) {
        if (mensajeLogin) {
            mensajeLogin.textContent = mensaje;
            mensajeLogin.className = 'alert alert-danger mt-3'; // Use Bootstrap alert classes
            mensajeLogin.style.display = 'block';
            // Scroll to the message for better visibility on small screens
            mensajeLogin.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Placeholder for Google login functionality
    if (botonGoogle) {
        botonGoogle.addEventListener('click', () => {
            alert('Inicio de sesión con Google está en desarrollo.');
            // Here you would typically initiate the Google OAuth flow.
        });
    }
});
